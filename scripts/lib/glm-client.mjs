// Zhipu (BigModel) GLM API client with model fallback chain.
// Uses the coding-plan endpoint. Robust JSON parsing with fault tolerance.

import crypto from 'node:crypto';

const GLM_BASE_URL = process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/coding/paas/v4';
const TIMEOUT_MS = parseInt(process.env.GLM_TIMEOUT_MS || '480000', 10); // 480s default
const MAX_TOKENS = parseInt(process.env.GLM_MAX_TOKENS || '50000', 10);

// Model fallback chain: try each in order until one succeeds
const MODEL_CHAIN = (process.env.GLM_MODELS || 'GLM-5-Turbo,GLM-4.7,GLM-4.7-Flash')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

/**
 * Generate a Zhipu JWT token from the API key.
 * The API key format is "{id}.{secret}". We sign a JWT with HS256.
 * @param {string} apiKey
 * @returns {string} JWT token string
 */
function generateZhipuToken(apiKey) {
  const parts = apiKey.split('.');
  if (parts.length < 2) {
    // If not in id.secret format, return as-is (might work as direct Bearer)
    return apiKey;
  }
  const [id, secret] = parts;

  const header = { alg: 'HS256', sign_type: 'SIGN' };
  const now = Date.now();
  const payload = {
    api_key: id,
    exp: now + 3600 * 1000, // 1 hour expiry
    timestamp: now,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header))
    .toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload))
    .toString('base64url');
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64url');

  return `${signingInput}.${signature}`;
}

/**
 * Call GLM chat completions with automatic model fallback.
 * @param {Array<{role:string, content:string}>} messages
 * @param {object} opts - { temperature, jsonMode, maxTokens }
 * @returns {Promise<string>} The content string from the response
 */
export async function chatCompletion(messages, opts = {}) {
  const {
    temperature = 0.6,
    jsonMode = true,
    maxTokens = MAX_TOKENS,
  } = opts;

  const errors = [];

  for (const model of MODEL_CHAIN) {
    try {
      console.error(`[GLM] Trying model: ${model}`);
      const content = await callOnce(model, messages, { temperature, jsonMode, maxTokens });
      console.error(`[GLM] Success with model: ${model}`);
      return content;
    } catch (err) {
      console.error(`[GLM] Failed with ${model}: ${err.message}`);
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
    max_tokens: opts.maxTokens,
    stream: false,
  };

  if (opts.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(`${GLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${generateZhipuToken(process.env.ZHIPU_API_KEY)}`,
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
