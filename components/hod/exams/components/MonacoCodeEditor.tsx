import Editor, { Monaco } from "@monaco-editor/react";
import { Code2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Props {
    language?: string;
    value: string;
    onChange: (value: string) => void;
    onLanguageChange?: (language: string) => void;
    height?: string;
}

const languages = [
    "python",
    "javascript",
    "java",
    "c",
    "cpp",
    "php",
    "r",
    "sql",
];

export default function MonacoCodeEditor({
    language = "javascript",
    value,
    onChange,
    onLanguageChange,
    height = "500px",
}: Props) {

    const handleBeforeMount = (monaco: Monaco) => {

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
            allowJs: true,
        });

        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        });

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ESNext,
        });

        monaco.languages.registerCompletionItemProvider("javascript", {
            provideCompletionItems: () => ({
                suggestions: [
                    {
                        label: "for",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "for(let i = 0; i < ${1:n}; i++){",
                            "\t$0",
                            "}",
                        ].join("\n"),
                        insertTextRules:
                            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    },
                    {
                        label: "function",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "function ${1:name}(){",
                            "\t$0",
                            "}",
                        ].join("\n"),
                        insertTextRules:
                            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    },
                ],
            }),
        });
    };

    return (
        <div className="border rounded-xl overflow-hidden bg-card shadow-sm">

            <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/40">
                <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">Code Editor</span>
                </div>

                <Select
                    value={language}
                    onValueChange={(value) =>
                        onLanguageChange?.(value)
                    }
                >
                    <SelectTrigger className="w-44">
                        <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                        {languages.map((lang) => (
                            <SelectItem
                                key={lang}
                                value={lang}
                            >
                                {lang.toUpperCase()}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Editor
                height={height}
                language={language}
                theme="vs-dark"
                value={value}
                beforeMount={handleBeforeMount}
                onChange={(value) =>
                    onChange(value || "")
                }
                options={{
                    minimap: {
                        enabled: false,
                    },
                    fontSize: 15,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    tabSize: 2,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    roundedSelection: true,
                    quickSuggestions: true,
                    suggestOnTriggerCharacters: true,
                    parameterHints: {
                        enabled: true,
                    },
                    acceptSuggestionOnEnter: "on",
                    snippetSuggestions: "top",
                    padding: {
                        top: 16,
                        bottom: 16,
                    },
                }}
            />
        </div>
    );
}