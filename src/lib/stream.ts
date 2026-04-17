/**
 * 流式请求选项接口
 */
export interface StreamRequestOptions {
  /** Edge Function URL */
  functionUrl: string;
  /** 请求体 */
  requestBody: unknown;
  /** Supabase 匿名密钥 */
  supabaseAnonKey: string;
  /** 接收到每个 SSE 数据块的回调 */
  onData: (data: string) => void;
  /** 请求完成回调 */
  onComplete: () => void;
  /** 错误处理回调 */
  onError: (error: Error) => void;
  /** 中断信号（可选） */
  signal?: AbortSignal;
}

const extractSseDataLines = (rawEvent: string): string[] => {
  const dataLines = rawEvent
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);

  return dataLines;
};

/**
 * 发送流式请求到 Supabase Edge Function
 * 使用原生 fetch 读取 SSE，避免第三方 hook 在浏览器里吞掉流或误报网络错误。
 */
export const sendStreamRequest = async (options: StreamRequestOptions): Promise<void> => {
  const {
    functionUrl,
    requestBody,
    supabaseAnonKey,
    onData,
    onComplete,
    onError,
    signal,
  } = options;

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `请求失败: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('响应体为空');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';

      for (const event of events) {
        const dataLines = extractSseDataLines(event);
        for (const data of dataLines) {
          if (data !== '[DONE]') {
            onData(data);
          }
        }
      }
    }

    if (buffer.trim()) {
      const dataLines = extractSseDataLines(buffer);
      for (const data of dataLines) {
        if (data !== '[DONE]') {
          onData(data);
        }
      }
    }

    onComplete();
  } catch (error) {
    if (signal?.aborted) {
      return;
    }

    onError(error instanceof Error ? error : new Error('未知网络错误'));
  }
};
