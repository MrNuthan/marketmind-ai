import { N8NWebhookRequest, N8NWebhookResponse } from '../types/n8n';

export const DEFAULT_N8N_WEBHOOK_URL = 'https://nuthan45.app.n8n.cloud/webhook/ai-market-agent';

export function getN8nWebhookUrl(): string {
  return import.meta.env.VITE_N8N_WEBHOOK_URL || DEFAULT_N8N_WEBHOOK_URL;
}

export class N8NServiceError extends Error {
  statusCode?: number;
  isCorsOrNetwork?: boolean;

  constructor(message: string, statusCode?: number, isCorsOrNetwork?: boolean) {
    super(message);
    this.name = 'N8NServiceError';
    this.statusCode = statusCode;
    this.isCorsOrNetwork = isCorsOrNetwork;
  }
}

/**
 * Sends a natural language query to the n8n Generative AI backend
 */
export async function sendMessage(
  query: string,
  sessionId: string,
  options?: { signal?: AbortSignal; timeoutMs?: number }
): Promise<N8NWebhookResponse> {
  const webhookUrl = getN8nWebhookUrl();
  const timeoutMs = options?.timeoutMs ?? 60000; // 60s max timeout for agent reasoning

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Link external signal if provided
  if (options?.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  const payload: N8NWebhookRequest = {
    query: query.trim(),
    sessionId: sessionId.trim(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {
        // ignore text parsing error
      }
      throw new N8NServiceError(
        `n8n backend returned HTTP ${response.status}${errorBody ? `: ${errorBody.slice(0, 120)}` : ''}`,
        response.status
      );
    }

    const data = await response.json();

    // Check if data has answer (or if it's in string format)
    if (!data || typeof data !== 'object') {
      throw new N8NServiceError('Invalid response received from n8n (not a JSON object)');
    }

    // In case backend returned { text: ... } or { output: ... }, fallback if answer is missing
    const answer = data.answer ?? data.output ?? data.text ?? data.message;

    if (!answer || typeof answer !== 'string') {
      throw new N8NServiceError('Invalid response received from n8n (missing "answer" property)');
    }

    return {
      success: data.success !== undefined ? Boolean(data.success) : true,
      answer,
      timestamp: data.timestamp || new Date().toISOString(),
      ...data,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof N8NServiceError) {
      throw err;
    }

    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new N8NServiceError('Request timed out while waiting for MarketMind AI backend to complete processing.');
    }

    const errorMessage = err instanceof Error ? err.message : String(err);
    const isNetwork = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('CORS');

    throw new N8NServiceError(
      isNetwork
        ? 'MarketMind AI couldn’t connect to the n8n backend. Please check network connectivity or CORS configuration on the n8n webhook.'
        : `Backend Error: ${errorMessage}`,
      undefined,
      isNetwork
    );
  }
}

/**
 * Tests backend connection by pinging the webhook with the designated test query
 */
export async function testConnection(testSessionId = 'marketmind-connection-test'): Promise<{
  success: boolean;
  latencyMs: number;
  answer?: string;
  error?: string;
}> {
  const startTime = performance.now();
  try {
    const res = await sendMessage('Respond with exactly: CONNECTION_OK', testSessionId, { timeoutMs: 15000 });
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: true,
      latencyMs,
      answer: res.answer,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      latencyMs,
      error: msg,
    };
  }
}
