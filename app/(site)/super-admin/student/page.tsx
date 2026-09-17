import { Suspense } from "react";
import StudentDashboard from "@/components/super-admin/student/page";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading student management...</div>}>
      <StudentDashboard />
    </Suspense>
  );
}
