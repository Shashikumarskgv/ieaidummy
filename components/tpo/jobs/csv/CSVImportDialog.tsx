import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Upload, Loader2, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import { CSVPreviewTable } from "./CSVPreviewTable";

interface ValidationError {
  row: number;
  message: string;
}

interface CSVImportDialogProps {
  onImportComplete: () => void;
}

export const CSVImportDialog = ({ onImportComplete }: CSVImportDialogProps) => {
  const [importOpen, setImportOpen] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [validJobs, setValidJobs] = useState<any[]>([]);

  const downloadTemplate = () => {
    const headers = ["title", "company", "location", "apply_link", "category", "description", "skills", "experience_level", "employment_type", "package_text"];
    const sampleRow = ["Full Stack Developer", "DataQuotes", "Hyderabad, India", "https://example.com/apply", "Web Development", "Job description here", "React, Node.js", "Entry-Level", "Full-time", "6-8 LPA"];
    const csvRows = [headers.join(","), sampleRow.map(val => `"${val.replace(/"/g, '""')}"`).join(",")];
    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "jobs_template.csv";
    link.click();
    toast.success("CSV template downloaded");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith(".csv")) {
      toast.error("Please upload only .csv files");
      return;
    }

    setParsing(true);
    setErrors([]);
    setDuplicateCount(0);
    setValidJobs([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedRows = results.data;
        const compiledErrors: ValidationError[] = [];
        const validList: any[] = [];

        // TODO: Replace with your internal API duplicate validation check if desired
        // For pure UI execution, treating rows as valid:
        parsedRows.forEach((row: any, index: number) => {
          const rowNum = index + 2;
          const title = row.title?.trim();
          const company = row.company?.trim();
          const location = row.location?.trim();
          const applyLink = row.apply_link?.trim();

          if (!title) compiledErrors.push({ row: rowNum, message: "Missing job title" });
          if (!company) compiledErrors.push({ row: rowNum, message: "Missing company name" });
          if (!location) compiledErrors.push({ row: rowNum, message: "Missing location" });
          if (!applyLink) {
            compiledErrors.push({ row: rowNum, message: "Missing apply link" });
          } else if (!/^https?:\/\/.+/i.test(applyLink)) {
            compiledErrors.push({ row: rowNum, message: "Invalid URL format" });
          }

          if (title && company && location && applyLink && /^https?:\/\/.+/i.test(applyLink)) {
            validList.push({
              role: title,
              company,
              location,
              apply_link: applyLink,
              category: row.category?.trim() || null,
              description: row.description?.trim() || null,
              skills: row.skills ? row.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
              experience_level: row.experience_level?.trim() || "Entry-Level",
              employment_type: row.employment_type?.trim() || "Full-time",
              package_text: row.package_text?.trim() || null,
            });
          }
        });

        setErrors(compiledErrors);
        setValidJobs(validList);
        setParsing(false);
      },
    });
  };

  const submitImportedJobs = async () => {
    if (validJobs.length === 0) return;
    setUploading(true);

    try {
      const localJobs = localStorage.getItem("dq_jobs");
      const parsedJobs = localJobs ? JSON.parse(localJobs) : [];
      
      const newJobs = validJobs.map((job, idx) => ({
        ...job,
        id: String(Date.now() + idx),
        status: "pending"
      }));

      const updated = [...parsedJobs, ...newJobs];
      localStorage.setItem("dq_jobs", JSON.stringify(updated));
      
      toast.success(`Successfully imported ${validJobs.length} jobs!`);
      setImportOpen(false);
      setValidJobs([]);
      onImportComplete();
    } catch (err) {
      toast.error("Import failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={importOpen} onOpenChange={setImportOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
          <Upload className="w-4 h-4 mr-1" /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" /> Bulk Job Import using CSV
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 my-2">
          <div className="flex gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <Input type="file" accept=".csv" onChange={handleFileUpload} disabled={parsing || uploading} />
            </div>
            <Button variant="ghost" size="sm" onClick={downloadTemplate} className="text-xs text-primary underline">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Download Template
            </Button>
          </div>

          {parsing && (
            <div className="flex justify-center items-center py-6 text-sm text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Parsing CSV data...
            </div>
          )}

          {errors.length > 0 && (
            <div className="border border-destructive/20 bg-destructive/5 rounded-xl p-4 max-h-[180px] overflow-y-auto">
              <div className="text-sm font-semibold text-destructive flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4" /> Validation Failures ({errors.length})
              </div>
              <ul className="text-xs space-y-1 text-destructive/90">
                {errors.map((err, i) => (
                  <li key={i}>Row {err.row} &rarr; {err.message}</li>
                ))}
              </ul>
            </div>
          )}

          <CSVPreviewTable validJobs={validJobs} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setImportOpen(false)} disabled={uploading}>Cancel</Button>
          <Button onClick={submitImportedJobs} disabled={validJobs.length === 0 || uploading} className="bg-green-600 hover:bg-green-700 text-white">
            {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
            Import {validJobs.length} Jobs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
