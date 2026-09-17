"use client";

export type ExecutionStatus = "idle" | "running" | "success" | "error";

export interface ExecutionResult {
  status: "success" | "error";
  stdout: string;
  stderr: string;
  exitCode?: number;
  executionTime?: number;
}

interface ExecutionPanelProps {
  customInput: string;
  onCustomInputChange: (value: string) => void;
  onRunCode: () => void;
  onSubmit?: () => void;
  onClearOutput: () => void;
  status: ExecutionStatus;
  result: ExecutionResult | null;
  isSubmitting?: boolean;
}

export default function ExecutionPanel({
  customInput,
  onCustomInputChange,
  onRunCode,
  onSubmit,
  onClearOutput,
  status,
  result,
  isSubmitting = false,
}: ExecutionPanelProps) {
  const isRunning = status === "running";
  const isDisabled = isRunning || isSubmitting;

  return (
    <div
      style={{
        marginTop: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* Control Buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <button
          onClick={onRunCode}
          disabled={isDisabled}
          style={{
            padding: "0.55rem 1.25rem",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#fff",
            backgroundColor: isDisabled ? "#6b7280" : "#2563eb",
            border: "none",
            borderRadius: "4px",
            cursor: isDisabled ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
          }}
        >
          {isRunning ? "Running..." : "Run Code"}
        </button>

        {onSubmit && (
          <button
            onClick={onSubmit}
            disabled={isDisabled}
            style={{
              padding: "0.55rem 1.25rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#fff",
              backgroundColor: isDisabled ? "#6b7280" : "#16a34a",
              border: "none",
              borderRadius: "4px",
              cursor: isDisabled ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Solution"}
          </button>
        )}

        <button
          onClick={onClearOutput}
          disabled={isDisabled || (status === "idle" && !result)}
          style={{
            padding: "0.55rem 1rem",
            fontSize: "0.95rem",
            color: "#374151",
            backgroundColor: "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            cursor:
              isDisabled || (status === "idle" && !result)
                ? "not-allowed"
                : "pointer",
          }}
        >
          Clear Output
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        {/* Custom Input Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label
            htmlFor="custom-input"
            style={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#374151",
            }}
          >
            Custom Input
          </label>
          <textarea
            id="custom-input"
            value={customInput}
            onChange={(e) => onCustomInputChange(e.target.value)}
            placeholder="Enter stdin input here..."
            rows={6}
            style={{
              width: "100%",
              padding: "0.6rem",
              fontSize: "0.9rem",
              fontFamily: "monospace",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              backgroundColor: "#fafafa",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Output Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#374151",
              }}
            >
              Output
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {result?.executionTime !== undefined && (
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  {result.executionTime}ms
                </span>
              )}
              <StatusBadge status={status} />
            </div>
          </div>

          <div
            style={{
              height: "140px",
              padding: "0.6rem",
              fontSize: "0.9rem",
              fontFamily: "monospace",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              backgroundColor: "#1e1e1e",
              color: "#f3f4f6",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {status === "idle" && !result && (
              <span style={{ color: "#9ca3af" }}>
                No output yet. Click &quot;Run Code&quot; to execute.
              </span>
            )}

            {status === "running" && (
              <span style={{ color: "#fbbf24" }}>Running code...</span>
            )}

            {status === "success" && result && (
              <span style={{ color: "#4ade80" }}>
                {result.stdout || "(No output produced)"}
              </span>
            )}

            {status === "error" && result && (
              <span style={{ color: "#f87171" }}>
                {result.stderr ||
                  (result.exitCode !== undefined && result.exitCode !== 0
                    ? `Execution failed with exit code ${result.exitCode}`
                    : "An error occurred during execution.")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ExecutionStatus }) {
  const badgeStyles: Record<
    ExecutionStatus,
    { label: string; bg: string; color: string }
  > = {
    idle: { label: "Idle", bg: "#e5e7eb", color: "#4b5563" },
    running: { label: "Running", bg: "#fef3c7", color: "#92400e" },
    success: { label: "Success", bg: "#dcfce7", color: "#166534" },
    error: { label: "Error", bg: "#fee2e2", color: "#991b1b" },
  };

  const style = badgeStyles[status];

  return (
    <span
      style={{
        fontSize: "0.75rem",
        fontWeight: 600,
        padding: "0.15rem 0.5rem",
        borderRadius: "9999px",
        backgroundColor: style.bg,
        color: style.color,
        textTransform: "uppercase",
      }}
    >
      {style.label}
    </span>
  );
}
