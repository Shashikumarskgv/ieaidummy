"use client";

import { useState, useEffect, useCallback } from "react";

export interface TableColumn {
  cid: number;
  name: string;
  type: string;
  notnull: boolean;
  dflt_value: string | null;
  pk: boolean;
}

export interface TableDetail {
  name: string;
  columns: TableColumn[];
  totalRows: number;
  rows: Record<string, unknown>[];
}

export interface SqlExplorerData {
  exists: boolean;
  tables: string[];
  views: { name: string; sql?: string }[];
  indexes: { name: string; tbl_name?: string }[];
  selectedTable: TableDetail | null;
}

interface DatabaseExplorerProps {
  sessionId: string;
  refreshTrigger: number;
}

export default function DatabaseExplorer({
  sessionId,
  refreshTrigger,
}: DatabaseExplorerProps) {
  const [explorerData, setExplorerData] = useState<SqlExplorerData | null>(null);
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"tables" | "views" | "indexes">("tables");

  const fetchExplorer = useCallback(
    async (tableToSelect?: string | null) => {
      setLoading(true);
      try {
        const targetTable = tableToSelect !== undefined ? tableToSelect : selectedTableName;
        const res = await fetch("/api/sql/explorer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, table: targetTable }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setExplorerData(json.data);
          if (targetTable && json.data.tables.includes(targetTable)) {
            setSelectedTableName(targetTable);
          } else if (json.data.tables.length > 0 && !targetTable) {
            setSelectedTableName(json.data.tables[0]);
          } else if (json.data.tables.length === 0) {
            setSelectedTableName(null);
          }
        }
      } catch (err) {
        console.error("Failed to load SQL Explorer metadata:", err);
      } finally {
        setLoading(false);
      }
    },
    [sessionId, selectedTableName]
  );

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const res = await fetch("/api/sql/explorer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, table: selectedTableName }),
        });
        const json = await res.json();
        if (!ignore && json.success && json.data) {
          setExplorerData(json.data);
          if (selectedTableName && json.data.tables.includes(selectedTableName)) {
            setSelectedTableName(selectedTableName);
          } else if (json.data.tables.length > 0 && !selectedTableName) {
            setSelectedTableName(json.data.tables[0]);
          } else if (json.data.tables.length === 0) {
            setSelectedTableName(null);
          }
        }
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [sessionId, selectedTableName, refreshTrigger]);

  const handleTableClick = (tableName: string) => {
    setSelectedTableName(tableName);
    fetchExplorer(tableName);
  };

  const handleResetDatabase = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/sql/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedTableName(null);
        setExplorerData(null);
        setShowResetConfirm(false);
        await fetchExplorer(null);
      }
    } catch (err) {
      console.error("Failed to reset SQL database:", err);
    } finally {
      setResetting(false);
    }
  };

  const selectedTableDetail = explorerData?.selectedTable;

  return (
    <div
      style={{
        marginTop: "1.5rem",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Explorer Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1rem",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#111827" }}>
            Database Explorer
          </h2>
          <span
            style={{
              fontSize: "0.75rem",
              backgroundColor: "#e0e7ff",
              color: "#3730a3",
              padding: "0.15rem 0.5rem",
              borderRadius: "9999px",
              fontWeight: 500,
            }}
          >
            SQLite Persistent DB
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={() => fetchExplorer()}
            disabled={loading}
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.85rem",
              backgroundColor: "#ffffff",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={loading || resetting}
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.85rem",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fca5a5",
              borderRadius: "4px",
              cursor: loading || resetting ? "not-allowed" : "pointer",
              fontWeight: 500,
            }}
          >
            Reset Database
          </button>
        </div>
      </div>

      {/* Explorer Content Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          minHeight: "280px",
        }}
      >
        {/* Left Tree View Navigation */}
        <div
          style={{
            borderRight: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
            padding: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem" }}>
            <button
              onClick={() => setActiveTab("tables")}
              style={{
                flex: 1,
                padding: "0.3rem",
                fontSize: "0.8rem",
                fontWeight: activeTab === "tables" ? 600 : 400,
                backgroundColor: activeTab === "tables" ? "#2563eb" : "transparent",
                color: activeTab === "tables" ? "#ffffff" : "#4b5563",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Tables ({explorerData?.tables.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab("views")}
              style={{
                flex: 1,
                padding: "0.3rem",
                fontSize: "0.8rem",
                fontWeight: activeTab === "views" ? 600 : 400,
                backgroundColor: activeTab === "views" ? "#2563eb" : "transparent",
                color: activeTab === "views" ? "#ffffff" : "#4b5563",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Views ({explorerData?.views.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab("indexes")}
              style={{
                flex: 1,
                padding: "0.3rem",
                fontSize: "0.8rem",
                fontWeight: activeTab === "indexes" ? 600 : 400,
                backgroundColor: activeTab === "indexes" ? "#2563eb" : "transparent",
                color: activeTab === "indexes" ? "#ffffff" : "#4b5563",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Idx ({explorerData?.indexes.length ?? 0})
            </button>
          </div>

          {/* Tree Item List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {activeTab === "tables" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {explorerData?.tables.length === 0 ? (
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af", fontStyle: "italic" }}>
                    No tables in DB
                  </span>
                ) : (
                  explorerData?.tables.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTableClick(t)}
                      style={{
                        textAlign: "left",
                        padding: "0.4rem 0.6rem",
                        fontSize: "0.85rem",
                        fontFamily: "monospace",
                        backgroundColor: selectedTableName === t ? "#e0e7ff" : "transparent",
                        color: selectedTableName === t ? "#3730a3" : "#374151",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontWeight: selectedTableName === t ? 600 : 400,
                      }}
                    >
                      {t}
                    </button>
                  ))
                )}
              </div>
            )}

            {activeTab === "views" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {explorerData?.views.length === 0 ? (
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af", fontStyle: "italic" }}>
                    No views created
                  </span>
                ) : (
                  explorerData?.views.map((v) => (
                    <div
                      key={v.name}
                      style={{
                        padding: "0.4rem 0.6rem",
                        fontSize: "0.85rem",
                        fontFamily: "monospace",
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      {v.name}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "indexes" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {explorerData?.indexes.length === 0 ? (
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af", fontStyle: "italic" }}>
                    No custom indexes
                  </span>
                ) : (
                  explorerData?.indexes.map((idx) => (
                    <div
                      key={idx.name}
                      style={{
                        padding: "0.4rem 0.6rem",
                        fontSize: "0.85rem",
                        fontFamily: "monospace",
                        color: "#374151",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        {idx.name}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#6b7280", paddingLeft: "1.2rem" }}>
                        on {idx.tbl_name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Panel */}
        <div style={{ padding: "1rem", overflowX: "auto" }}>
          {selectedTableDetail ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Table Name & Stats */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, fontFamily: "monospace" }}>
                  Table: {selectedTableDetail.name}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  Total Rows: <strong>{selectedTableDetail.totalRows}</strong>
                </span>
              </div>

              {/* Schema Columns Table */}
              <div>
                <h4 style={{ margin: "0 0 0.4rem 0", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>
                  Schema Columns ({selectedTableDetail.columns.length})
                </h4>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.85rem",
                    fontFamily: "monospace",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f3f4f6", textAlign: "left" }}>
                      <th style={{ padding: "0.4rem 0.6rem", border: "1px solid #e5e7eb" }}>Column Name</th>
                      <th style={{ padding: "0.4rem 0.6rem", border: "1px solid #e5e7eb" }}>Data Type</th>
                      <th style={{ padding: "0.4rem 0.6rem", border: "1px solid #e5e7eb" }}>Constraints</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTableDetail.columns.map((col) => (
                      <tr key={col.name} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #e5e7eb", fontWeight: 600 }}>
                          {col.name}
                        </td>
                        <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #e5e7eb", color: "#2563eb" }}>
                          {col.type || "BLOB"}
                        </td>
                        <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #e5e7eb" }}>
                          {col.pk && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                backgroundColor: "#fef3c7",
                                color: "#92400e",
                                padding: "0.1rem 0.4rem",
                                borderRadius: "4px",
                                marginRight: "0.4rem",
                                fontWeight: 600,
                              }}
                            >
                              PRIMARY KEY
                            </span>
                          )}
                          {col.notnull && (
                            <span style={{ fontSize: "0.7rem", color: "#dc2626", marginRight: "0.4rem" }}>
                              NOT NULL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Data Rows Preview Grid */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>
                    Data Rows Preview (showing up to 50 rows)
                  </h4>
                </div>

                {selectedTableDetail.rows.length === 0 ? (
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "4px",
                      color: "#6b7280",
                      fontSize: "0.85rem",
                      fontStyle: "italic",
                    }}
                  >
                    Table &quot;{selectedTableDetail.name}&quot; is currently empty.
                  </div>
                ) : (
                  <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.85rem",
                        fontFamily: "monospace",
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#1e1e1e", color: "#f3f4f6", textAlign: "left" }}>
                          {selectedTableDetail.columns.map((col) => (
                            <th key={col.name} style={{ padding: "0.45rem 0.65rem", borderRight: "1px solid #374151" }}>
                              {col.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTableDetail.rows.map((row, idx) => (
                          <tr
                            key={idx}
                            style={{
                              backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                              borderBottom: "1px solid #e5e7eb",
                            }}
                          >
                            {selectedTableDetail.columns.map((col) => (
                              <td
                                key={col.name}
                                style={{
                                  padding: "0.45rem 0.65rem",
                                  borderRight: "1px solid #e5e7eb",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {row[col.name] !== undefined && row[col.name] !== null
                                  ? String(row[col.name])
                                  : "NULL"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                gap: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.9rem" }}>
                Select a table from the left to inspect schema & data.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              borderRadius: "8px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#991b1b", fontSize: "1.1rem", fontWeight: 600 }}>
              Reset SQL Database?
            </h3>
            <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.9rem", color: "#374151", lineHeight: 1.5 }}>
              Are you sure you want to reset your SQL database? All tables, views, indexes, and stored data in this session will be permanently erased.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={resetting}
                style={{
                  padding: "0.45rem 1rem",
                  fontSize: "0.9rem",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: resetting ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetDatabase}
                disabled={resetting}
                style={{
                  padding: "0.45rem 1rem",
                  fontSize: "0.9rem",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: 600,
                  cursor: resetting ? "not-allowed" : "pointer",
                }}
              >
                {resetting ? "Resetting..." : "Yes, Reset Database"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
