import type { AccessReviewService, Simulation } from "./domain";

type ToolExecuteOptions = { signal?: AbortSignal };

export type AccessTool = WebMcpTool;

const subjectSchema = {
  type: "object",
  properties: {
    subject: {
      type: "string",
      description: "Person name or synthetic user ID. Use Alex Morgan for this demo.",
    },
  },
  required: ["subject"],
  additionalProperties: false,
};

function requireSubject(input: Record<string, unknown>) {
  const subject = input.subject;
  if (typeof subject !== "string" || !subject.trim()) {
    throw new Error('subject is required. Use "Alex Morgan" or "usr_alex_morgan".');
  }
  const normalized = subject.trim().toLowerCase();
  if (normalized !== "alex morgan" && normalized !== "usr_alex_morgan") {
    throw new Error(
      `Unknown subject "${subject}". This synthetic demo supports Alex Morgan only.`,
    );
  }
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Tool execution was cancelled.", "AbortError");
  }
}

function withUiSync(
  action: (input: Record<string, unknown>) => unknown,
): AccessTool["execute"] {
  return (input, options?: ToolExecuteOptions) => {
    const signal = options?.signal;
    assertNotAborted(signal);
    // AccessReviewService publishes synchronously to useSyncExternalStore listeners.
    // The precommit abort check is therefore the final cancellation point.
    return action(input);
  };
}

export function createAccessReviewTools(service: AccessReviewService): AccessTool[] {
  return [
    {
      name: "get_identity_context",
      title: "Resolve identity",
      description:
        "Resolve Alex Morgan's synthetic offboarding identity and employment context before reviewing access.",
      inputSchema: subjectSchema,
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: withUiSync((input) => {
        requireSubject(input);
        return service.resolveIdentity();
      }),
    },
    {
      name: "get_effective_access",
      title: "Compute effective access",
      description:
        "Compute current sensitive access ownership for Alex Morgan and any preserved on-call service dependency.",
      inputSchema: subjectSchema,
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: withUiSync((input) => {
        requireSubject(input);
        return service.computeEffectiveAccess();
      }),
    },
    {
      name: "trace_permission_path",
      title: "Trace permission path",
      description:
        "Trace one effective permission path into production deploy or customer-data export and explain every hop.",
      inputSchema: {
        type: "object",
        properties: {
          subject: subjectSchema.properties.subject,
          pathId: {
            type: "string",
            enum: [
              "path_direct_role",
              "path_nested_group",
              "path_api_token",
              "path_project_membership",
              "path_service_rollback",
            ],
            description: "Optional path to focus; omit to trace the first path.",
          },
        },
        required: ["subject"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: withUiSync((input) => {
        requireSubject(input);
        if (input.pathId !== undefined && typeof input.pathId !== "string") {
          throw new Error("pathId must be one of the documented path identifiers.");
        }
        return service.tracePath(input.pathId as string | undefined);
      }),
    },
    {
      name: "find_access_risks",
      title: "Find least-privilege risks",
      description:
        "Flag synthetic least-privilege risks and shared-service dependencies in Alex Morgan's current effective access.",
      inputSchema: subjectSchema,
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: withUiSync((input) => {
        requireSubject(input);
        return { risks: service.findRisks() };
      }),
    },
    {
      name: "simulate_access_changes",
      title: "Simulate access changes",
      description:
        "Simulate removal of Alex Morgan's sensitive grants without revoking anything, and report service breakage warnings.",
      inputSchema: {
        type: "object",
        properties: {
          subject: subjectSchema.properties.subject,
          mode: {
            type: "string",
            enum: ["remove_all", "preserve_oncall"],
            description:
              "Use remove_all for the first safety check or preserve_oncall for the revised least-privilege plan.",
          },
        },
        required: ["subject", "mode"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: withUiSync((input) => {
        requireSubject(input);
        if (input.mode !== "remove_all" && input.mode !== "preserve_oncall") {
          throw new Error('mode must be "remove_all" or "preserve_oncall".');
        }
        return service.simulate(input.mode as Simulation["mode"]);
      }),
    },
    {
      name: "preview_access_delta",
      title: "Preview access delta",
      description:
        "Preview Alex Morgan's before-and-after exposure score and exact grant counts for the current simulation.",
      inputSchema: subjectSchema,
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: withUiSync((input) => {
        requireSubject(input);
        return service.previewDelta();
      }),
    },
    {
      name: "stage_access_changes",
      title: "Stage access review",
      description:
        "Stage the revised least-privilege review for the visible normal page confirmation control without revoking or changing permissions.",
      inputSchema: {
        type: "object",
        properties: {
          subject: subjectSchema.properties.subject,
          acknowledgeNoRevocation: {
            type: "boolean",
            description:
              "Must be true to acknowledge that this tool only stages a plan and never revokes access.",
          },
        },
        required: ["subject", "acknowledgeNoRevocation"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: withUiSync((input) => {
        requireSubject(input);
        if (input.acknowledgeNoRevocation !== true) {
          throw new Error(
            "acknowledgeNoRevocation must be true. This WebMCP tool stages the review but does not expose confirmation.",
          );
        }
        return service.stagePlan();
      }),
    },
    {
      name: "cancel_staged_access_review",
      title: "Cancel staged review",
      description:
        "Cancel the currently staged synthetic access review without changing any permissions.",
      inputSchema: {
        type: "object",
        properties: {
          reviewId: {
            type: "string",
            description: 'Use "alex-offboarding-2026-09-02".',
          },
        },
        required: ["reviewId"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: withUiSync((input) => {
        if (input.reviewId !== "alex-offboarding-2026-09-02") {
          throw new Error('reviewId must be "alex-offboarding-2026-09-02".');
        }
        return service.cancelStage();
      }),
    },
    {
      name: "get_access_review_receipt",
      title: "Read review receipt",
      description:
        "Read the immutable synthetic receipt after the visible normal page confirmation control has been activated.",
      inputSchema: {
        type: "object",
        properties: {
          reviewId: {
            type: "string",
            description: 'Use "alex-offboarding-2026-09-02".',
          },
        },
        required: ["reviewId"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: withUiSync((input) => {
        if (input.reviewId !== "alex-offboarding-2026-09-02") {
          throw new Error('reviewId must be "alex-offboarding-2026-09-02".');
        }
        return service.getReceipt();
      }),
    },
  ];
}

export function registerAccessReviewTools(
  service: AccessReviewService,
  modelContext?: WebModelContext,
) {
  const context =
    modelContext ??
    (typeof document !== "undefined" && document.modelContext) ??
    (typeof navigator !== "undefined" && navigator.modelContext) ??
    null;

  if (!context) {
    service.setWebMcpStatus(
      "unavailable",
      0,
      "Native WebMCP unavailable · use the labeled rehearsal control",
    );
    return {
      ready: Promise.resolve(),
      dispose() {},
      tools: createAccessReviewTools(service),
    };
  }

  const controller = new AbortController();
  const tools = createAccessReviewTools(service);
  const attemptedNames: string[] = [];
  let disposed = false;

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    for (const name of attemptedNames.splice(0).reverse()) {
      try {
        context.unregisterTool?.(name);
      } catch {
        // AbortSignal cleanup remains authoritative on current Chrome.
      }
    }
    controller.abort();
  };

  const ready = (async () => {
    const registrations: Promise<void>[] = [];
    try {
      for (const tool of tools) {
        const registration = context.registerTool(tool, {
          signal: controller.signal,
        });
        attemptedNames.push(tool.name);
        registrations.push(Promise.resolve(registration));
      }
      await Promise.all(registrations);
      if (disposed) return;
      service.setWebMcpStatus(
        "ready",
        attemptedNames.length,
        `${attemptedNames.length} top-level imperative tools ready`,
      );
    } catch (error) {
      // If a synchronous call throws before Promise.all is reached, consume any
      // already-started registrations while cleanup proceeds immediately.
      void Promise.allSettled(registrations);
      if (disposed) return;
      console.error("WebMCP tool registration failed atomically:", error);
      cleanup();
      service.setWebMcpStatus(
        "error",
        0,
        "Tool registration failed atomically · no WebMCP tools exposed",
      );
    }
  })();

  return {
    ready,
    tools,
    dispose: cleanup,
  };
}
