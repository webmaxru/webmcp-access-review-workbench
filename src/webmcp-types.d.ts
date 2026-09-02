type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute: (
    input: Record<string, unknown>,
    options?: { signal?: AbortSignal },
  ) => Promise<unknown> | unknown;
};

type WebModelContext = {
  registerTool: (
    tool: WebMcpTool,
    options?: { signal?: AbortSignal; exposedTo?: string[] },
  ) => Promise<void> | void;
  unregisterTool?: (name: string) => void;
};

interface Document {
  modelContext?: WebModelContext;
}

interface Navigator {
  modelContext?: WebModelContext;
}
