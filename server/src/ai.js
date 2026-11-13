let baseUrl = process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1';
while (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
export const isAIConfigured = () => Boolean(process.env.AI_API_KEY && process.env.AI_MODEL);
export async function askAI({ system, prompt, maxTokens = 1800, temperature = 0.2 }) {
  if (!isAIConfigured()) {
    const error = new Error('Le service IA n’est pas configuré. Ajoute AI_API_KEY et AI_MODEL dans les variables du serveur.');
    error.status = 503;
    throw error;
  }
  const response = await fetch(baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.AI_API_KEY,
      'Content-Type': 'application/json',
      ...(process.env.AI_HTTP_REFERER ? { 'HTTP-Referer': process.env.AI_HTTP_REFERER } : {}),
      ...(process.env.AI_APP_TITLE ? { 'X-Title': process.env.AI_APP_TITLE } : {})
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }]
    }),
    signal: AbortSignal.timeout(45000)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.error?.message || 'Le fournisseur IA a refusé la demande (' + response.status + ').');
    error.status = response.status === 429 ? 429 : 502;
    throw error;
  }
  const raw = payload?.choices?.[0]?.message?.content;
  if (typeof raw !== 'string' || !raw.trim()) {
    const error = new Error('Le fournisseur IA a renvoyé une réponse vide.');
    error.status = 502;
    throw error;
  }
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(cleaned.indexOf('\n') + 1);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();
  }
  let data;
  try { data = JSON.parse(cleaned); }
  catch { const error = new Error('La réponse IA n’est pas un JSON valide. Réessaie.'); error.status = 502; throw error; }
  return { data, usage: payload.usage || null, model: payload.model || process.env.AI_MODEL };
}
