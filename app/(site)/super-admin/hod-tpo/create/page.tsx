import { Suspense } from "react";
import CreateStaffPage from "@/components/super-admin/hod-tpo/create/page";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading staff creation form...</div>}>
      <CreateStaffPage />
    </Suspense>
  );
}
