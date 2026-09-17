import React from "react";

interface CSVPreviewTableProps {
  validJobs: any[];
}

export const CSVPreviewTable = ({ validJobs }: CSVPreviewTableProps) => {
  if (validJobs.length === 0) return null;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground border-b border-border">
        Preview: Valid Jobs to Upload ({validJobs.length})
      </div>
      <div className="max-h-[220px] overflow-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/20 text-muted-foreground uppercase sticky top-0 border-b border-border">
            <tr>
              <th className="p-2">Role</th>
              <th className="p-2">Company</th>
              <th className="p-2">Location</th>
              <th className="p-2">Apply Link</th>
            </tr>
          </thead>
          <tbody>
            {validJobs.map((job, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-muted/20">
                <td className="p-2 font-medium text-foreground">{job.role}</td>
                <td className="p-2">{job.company}</td>
                <td className="p-2">{job.location}</td>
                <td className="p-2 text-muted-foreground truncate max-w-[150px]">{job.apply_link}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};