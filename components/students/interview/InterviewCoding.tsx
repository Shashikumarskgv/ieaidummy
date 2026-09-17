import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Play, Save } from "lucide-react";
import { toast } from "sonner";

const InterviewCoding = () => {
  const { sessionId, testId } = useParams();
  const [test, setTest] = useState<any>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (!testId) return;
    const items = JSON.parse(localStorage.getItem("dq_session_coding") || "[]");
    const matchedTest = items.find((t: any) => t.id === testId);
    
    if (matchedTest) {
      setTest(matchedTest);
      setLanguage(matchedTest.language || "javascript");
      setCode(matchedTest.user_code || matchedTest.problem?.starter_code?.[matchedTest.language || "javascript"] || "");
      setResults(matchedTest.result || null);
    }
  }, [testId]);

  const runJs = () => {
    if (!test) return;
    setRunning(true);
    const cases = test.problem?.test_cases || [];
    const out: any[] = [];
    let passed = 0;

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(`${code}; return (typeof solve === 'function') ? solve : (typeof solution === 'function' ? solution : null);`)();
      if (typeof fn !== "function") throw new Error("Define a function named solve(input)");
      
      for (const tc of cases) {
        let parsedInput = tc.input;
        try { parsedInput = JSON.parse(tc.input); } catch {}
        
        const res = fn(parsedInput);
        const expected = tc.expected_output;
        const got = typeof res === "string" ? res : JSON.stringify(res);
        const ok = String(got).trim() === String(expected).trim();
        
        if (ok) passed++;
        out.push({ input: tc.input, expected, got, passed: ok, hidden: tc.is_hidden });
      }
    } catch (e: any) {
      toast.error(e.message);
      setRunning(false);
      return;
    }

    const result = { passed, total: cases.length, cases: out };
    setResults(result);

    const items = JSON.parse(localStorage.getItem("dq_session_coding") || "[]");
    const updatedTest = { ...test, user_code: code, language, result, status: "completed", submitted_at: new Date().toISOString() };
    localStorage.setItem("dq_session_coding", JSON.stringify(items.map((t: any) => t.id === test.id ? updatedTest : t)));

    toast.success(`Mock compiler matched: ${passed}/${cases.length} passed.`);
    setRunning(false);
  };

  const saveDraft = () => {
    if (!test) return;
    const items = JSON.parse(localStorage.getItem("dq_session_coding") || "[]");
    const updatedTest = { ...test, user_code: code, language };
    localStorage.setItem("dq_session_coding", JSON.stringify(items.map((t: any) => t.id === test.id ? updatedTest : t)));
    toast.success("Draft saved");
  };

  if (!test) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  const p = test.problem || {};

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4">
        <Link to={`/dashboard/interview-prep/${sessionId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-3 text-sm">
              <h2 className="text-xl font-bold text-foreground">{p.title}</h2>
              <p className="text-foreground whitespace-pre-wrap">{p.statement}</p>
              {p.sample_input && <div><p className="font-semibold text-muted-foreground">Sample Input</p><pre className="bg-muted p-2 rounded text-xs">{p.sample_input}</pre></div>}
              {p.sample_output && <div><p className="font-semibold text-muted-foreground">Sample Output</p><pre className="bg-muted p-2 rounded text-xs">{p.sample_output}</pre></div>}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Select value={language} onValueChange={(v) => { setLanguage(v); setCode(test.problem?.starter_code?.[v] || code); }}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={saveDraft}><Save className="w-4 h-4" /> Save</Button>
                    <Button size="sm" onClick={runJs} disabled={running}>
                      {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run Tests
                    </Button>
                  </div>
                </div>
                <Textarea value={code} onChange={(e) => setCode(e.target.value)} className="font-mono text-xs min-h-[320px]" />
              </CardContent>
            </Card>

            {results && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold text-foreground">Passed: {results.passed}/{results.total}</p>
                  <div className="space-y-1 max-h-64 overflow-auto">
                    {results.cases.map((c: any, i: number) => (
                      <div key={i} className={`p-2 rounded text-xs ${c.passed ? "bg-green-500/10" : "bg-red-500/10"}`}>
                        <p className="font-medium">Test {i + 1}: {c.passed ? "✓ Passed" : "✗ Failed"}</p>
                        <p className="text-muted-foreground">Input: <code>{c.input}</code></p>
                        <p className="text-muted-foreground">Expected: <code>{c.expected}</code></p>
                        <p className="text-muted-foreground">Got: <code>{String(c.got)}</code></p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewCoding;
