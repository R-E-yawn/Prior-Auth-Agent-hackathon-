export async function GET() {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: "DEEPGRAM_API_KEY not set" }), {
      status: 500,
    });
  }
  return new Response(JSON.stringify({ key }), {
    headers: { "Content-Type": "application/json" },
  });
}
