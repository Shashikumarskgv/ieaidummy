"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({
  language,
  value,
  onChange,
}: CodeEditorProps) {
  return (
    <div
      style={{
        border: "1px solid #333",
        borderRadius: "6px",
        overflow: "hidden",
        marginTop: "1rem",
      }}
    >
      <Editor
        height="75vh"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange(val ?? "")}
        options={{
          fontSize: 14,
          lineNumbers: "on",
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          tabSize: 4,
        }}
        loading={
          <div
            style={{
              height: "75vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1e1e1e",
              color: "#ccc",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Loading Monaco Editor...
          </div>
        }
      />
    </div>
  );
}
