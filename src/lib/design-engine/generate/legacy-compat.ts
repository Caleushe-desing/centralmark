import type { OrchestratorPhase } from "./orchestrator";
import { runDesignEngine } from "./orchestrator";
import { DesignEngineError } from "../errors";
import type { ProAdInput } from "../schemas";

/** @deprecated Usa DesignEngineError */
export const ProAdGenerationError = DesignEngineError;

/** @deprecated Usa runDesignEngine */
export function generateProAd(
  input: ProAdInput,
  opts?: { storeId?: string; jobId?: string; onPhase?: (p: OrchestratorPhase) => Promise<void> }
) {
  return runDesignEngine(input, {
    storeId: opts?.storeId ?? "anonymous",
    jobId: opts?.jobId,
    onPhase: opts?.onPhase,
  });
}
