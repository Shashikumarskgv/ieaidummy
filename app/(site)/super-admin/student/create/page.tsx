import { Suspense } from "react";
import CreateStudentPage from "@/components/super-admin/student/create/page";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading student registration form...</div>}>
      <CreateStudentPage />
    </Suspense>
  );
}
