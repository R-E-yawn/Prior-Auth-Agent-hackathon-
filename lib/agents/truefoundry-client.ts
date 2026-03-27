/**
 * TrueFoundry AI Gateway Client
 *
 * Wraps Anthropic API calls with TrueFoundry gateway for:
 * - Cost tracking and monitoring
 * - Automatic failover to backup providers
 * - Rate limiting and governance
 * - Production-grade observability
 */

import Anthropic from "@anthropic-ai/sdk";

const USE_TRUEFOUNDRY = process.env.TRUEFOUNDRY_API_KEY && process.env.TRUEFOUNDRY_GATEWAY_URL;

interface TrueFoundryConfig {
  apiKey: string;
  gatewayUrl: string;
  fallbackModels?: string[];
  deployment?: string;
}

export function createAIClient(): Anthropic {
  if (!USE_TRUEFOUNDRY) {
    // Direct Anthropic client (development mode)
    console.log('[AI Client] Using direct Anthropic API');
    return new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  // TrueFoundry gateway client (production mode)
  console.log('[AI Client] Using TrueFoundry AI Gateway for production monitoring');

  const config: TrueFoundryConfig = {
    apiKey: process.env.TRUEFOUNDRY_API_KEY!,
    gatewayUrl: process.env.TRUEFOUNDRY_GATEWAY_URL!,
    fallbackModels: ['gpt-4o', 'claude-sonnet-4-5'], // Auto-failover if Opus unavailable
    deployment: 'prior-auth-agents',
  };

  // Create Anthropic client that routes through TrueFoundry gateway
  return new Anthropic({
    apiKey: config.apiKey,
    baseURL: config.gatewayUrl,
    defaultHeaders: {
      'x-deployment-id': config.deployment,
      'x-fallback-models': config.fallbackModels?.join(','),
      'x-track-costs': 'true',
      'x-enable-monitoring': 'true',
    },
  });
}

/**
 * Log agent performance metrics
 * In production with TrueFoundry, these are automatically tracked
 */
export function logAgentMetrics(agentId: string, metrics: {
  startTime: number;
  endTime: number;
  tokenCount?: number;
  model: string;
}) {
  if (!USE_TRUEFOUNDRY) {
    // Local logging for development
    const duration = metrics.endTime - metrics.startTime;
    console.log(`[Agent Metrics] ${agentId}: ${duration}ms, Model: ${metrics.model}`);
  }
  // In production, TrueFoundry automatically captures these metrics
}
