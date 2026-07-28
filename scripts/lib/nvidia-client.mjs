// NVIDIA API client with a long-lived primary/fallback model chain.
// Uses NVIDIA's OpenAI-compatible chat completions endpoint.

const NVIDIA_API_BASE =
  process.env.NVIDIA_API_BASE || 'https://integrate.api.nvidia.com/v1';
const TIMEOUT_MS = parseInt(process.env.NVIDIA_TIMEOUT_MS || '480000', 10);
const MAX_TOKENS = Math.min(
  parseInt(process.env.NVIDIA_MAX_TOKENS || '16384', 10),
  16384
);

const MODEL_CHAIN = (
  process.env.NVIDIA_MODELS ||
  'nvidia/nemotron-3-super-120b-a12b,nvidia/nemotron-3-nano-30b-a3b'
)
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

/**
 * Call NVIDIA chat completions with automatic model fallback.
 * @param {Array<{role:string, content:string}>} messages
 * @param {object} opts - { temperature, jsonMode, maxTokens }
 * @returns {Promise<string>} The content string from the response
 */
export async function chatCompletion(messages, opts = {}) {
  const {
    temperature = 1.0,
    jsonMode = true,
    maxTokens = MAX_TOKENS,
  } = opts;

  const errors = [];

  for (const model of MODEL_CHAIN) {
    try {
      console.error(`[NVIDIA] Trying model: ${model}`);
      const content = await callOnce(model, messages, { temperature, jsonMode, maxTokens });
      console.error(`[NVIDIA] Success with model: ${model}`);
      return content;
    } catch (err) {
      console.error(`[NVIDIA] Failed with ${model}: ${err.message}`);
      errors.push({ model, error: err.message });

      // Don't retry on auth errors or quota errors — they won't fix with another model
      if (err.statusCode === 401 || err.statusCode === 403) {
        throw new Error(`Auth error (${err.statusCode}): ${err.message}`);
      }
      // Continue to next model for other errors
    }
  }

  throw new Error(
    `All models failed:\n${errors.map((e) => `  ${e.model}: ${e.error}`).join('\n')}`
  );
}

async function callOnce(model, messages, opts) {
  const body = {
    model,
    messages,
    temperature: opts.temperature,
    top_p: 0.95,
    max_tokens: opts.maxTokens,
    stream: false,
    chat_template_kwargs: { enable_thinking: false },
  };

  if (opts.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY is not set');
    }
    const resp = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: safeJsonStringify(body),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      const err = new Error(`HTTP ${resp.status}: ${text.slice(0, 300)}`);
      err.statusCode = resp.status;
      err.model = model;
      throw err;
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(`Empty response from ${model}: ${safeJsonStringify(data).slice(0, 300)}`);
    }

    return content;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Robust JSON parser with multiple fallback strategies.
 * Handles: markdown code blocks, trailing commas, truncated JSON,
 * extra text before/after JSON, and BOM characters.
 *
 * @param {string} raw - Raw string that should contain JSON
 * @returns {object|null} Parsed object, or null if all strategies fail
 */
export function parseJsonLenient(raw) {
  if (!raw || typeof raw !== 'string') return null;

  let text = raw.trim();

  // Strip BOM
  text = text.replace(/^\uFEFF/, '');

  // Strip markdown code fences: ```json\n...\n``` or ```\n...\n```
  text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

  // Strategy 1: Direct parse
  let result = tryParse(text);
  if (result.ok) return result.value;

  // Strategy 2: Extract from first { to last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    let substr = text.slice(firstBrace, lastBrace + 1);
    result = tryParse(substr);
    if (result.ok) return result.value;

    // Strategy 2b: Remove trailing commas
    substr = substr.replace(/,\s*([}\]])/g, '$1');
    result = tryParse(substr);
    if (result.ok) return result.value;

    // Strategy 2c: Remove JavaScript-style comments
    substr = substr.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    result = tryParse(substr);
    if (result.ok) return result.value;

    // Strategy 2d: Fix unescaped newlines in string values
    substr = substr.replace(/\n/g, '\\n');
    result = tryParse(substr);
    if (result.ok) return result.value;
  }

  // Strategy 3: Extract from first [ to last ]
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    let substr = text.slice(firstBracket, lastBracket + 1);
    substr = substr.replace(/,\s*([}\]])/g, '$1');
    result = tryParse(substr);
    if (result.ok) return result.value;
  }

  // All strategies failed
  console.error('[JSON] All parse strategies failed. First 500 chars:');
  console.error(text.slice(0, 500));
  return null;
}

function tryParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

function safeJsonStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
}
