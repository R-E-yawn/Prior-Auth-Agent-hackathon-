/**
 * Aerospike Caching Layer for AI Agents
 *
 * Provides:
 * - Agent output caching (avoid re-running expensive AI calls)
 * - Session state persistence (resume interrupted workflows)
 * - Sub-millisecond retrieval for cached data
 * - Automatic TTL management
 */

import Aerospike from 'aerospike';

const USE_AEROSPIKE = process.env.AEROSPIKE_HOSTS && process.env.NODE_ENV === 'production';

interface CacheConfig {
  hosts: string;
  namespace: string;
  ttl: number; // Time to live in seconds
}

interface AgentCacheData {
  questionAgentOutput?: string;
  patientSummary?: string;
  stepTherapySummary?: string;
  clinicalSummary?: string;
  timestamp: number;
}

interface SessionState {
  sessionId: string;
  patientId: string;
  requestText: string;
  isUrgent: boolean;
  agentOutputs?: AgentCacheData;
  questions?: string[];
  answers?: Record<number, string>;
  lastUpdated: number;
}

class AerospikeCache {
  private client: Aerospike.Client | null = null;
  private config: CacheConfig;
  private connected: boolean = false;

  constructor() {
    this.config = {
      hosts: process.env.AEROSPIKE_HOSTS || 'localhost:3000',
      namespace: process.env.AEROSPIKE_NAMESPACE || 'prior_auth',
      ttl: 3600, // 1 hour default TTL
    };
  }

  async connect(): Promise<void> {
    if (!USE_AEROSPIKE || this.connected) {
      return;
    }

    try {
      const hosts = this.config.hosts.split(',').map(host => {
        const [addr, port] = host.split(':');
        return { addr, port: parseInt(port) };
      });

      this.client = await Aerospike.connect({ hosts });
      this.connected = true;
      console.log('[Aerospike] Connected successfully');
    } catch (error) {
      console.error('[Aerospike] Connection failed:', error);
      this.connected = false;
    }
  }

  async cacheAgentOutputs(
    sessionId: string,
    outputs: AgentCacheData
  ): Promise<void> {
    if (!USE_AEROSPIKE || !this.client) {
      console.log('[Cache] Development mode - skipping Aerospike cache');
      return;
    }

    const key = new Aerospike.Key(this.config.namespace, 'agent_outputs', sessionId);
    const bins = {
      ...outputs,
      timestamp: Date.now(),
    };

    const meta = {
      ttl: this.config.ttl,
    };

    try {
      await this.client.put(key, bins, meta);
      console.log(`[Aerospike] Cached agent outputs for session: ${sessionId}`);
    } catch (error) {
      console.error('[Aerospike] Cache write failed:', error);
    }
  }

  async getAgentOutputs(sessionId: string): Promise<AgentCacheData | null> {
    if (!USE_AEROSPIKE || !this.client) {
      return null;
    }

    const key = new Aerospike.Key(this.config.namespace, 'agent_outputs', sessionId);

    try {
      const record = await this.client.get(key);
      console.log(`[Aerospike] Cache hit for session: ${sessionId}`);
      return record.bins as AgentCacheData;
    } catch (error: any) {
      if (error.code === Aerospike.status.ERR_RECORD_NOT_FOUND) {
        console.log(`[Aerospike] Cache miss for session: ${sessionId}`);
        return null;
      }
      console.error('[Aerospike] Cache read failed:', error);
      return null;
    }
  }

  async saveSessionState(state: SessionState): Promise<void> {
    if (!USE_AEROSPIKE || !this.client) {
      // In development, use sessionStorage (handled on frontend)
      return;
    }

    const key = new Aerospike.Key(this.config.namespace, 'sessions', state.sessionId);
    const bins = {
      ...state,
      lastUpdated: Date.now(),
    };

    const meta = {
      ttl: 7200, // 2 hours for session state
    };

    try {
      await this.client.put(key, bins, meta);
      console.log(`[Aerospike] Saved session state: ${state.sessionId}`);
    } catch (error) {
      console.error('[Aerospike] Session save failed:', error);
    }
  }

  async getSessionState(sessionId: string): Promise<SessionState | null> {
    if (!USE_AEROSPIKE || !this.client) {
      return null;
    }

    const key = new Aerospike.Key(this.config.namespace, 'sessions', sessionId);

    try {
      const record = await this.client.get(key);
      return record.bins as SessionState;
    } catch (error: any) {
      if (error.code === Aerospike.status.ERR_RECORD_NOT_FOUND) {
        return null;
      }
      console.error('[Aerospike] Session read failed:', error);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.connected) {
      this.client.close();
      this.connected = false;
      console.log('[Aerospike] Disconnected');
    }
  }
}

// Singleton instance
export const aerospikeCache = new AerospikeCache();

// Initialize connection on module load (only in production)
if (USE_AEROSPIKE) {
  aerospikeCache.connect().catch(console.error);
}
