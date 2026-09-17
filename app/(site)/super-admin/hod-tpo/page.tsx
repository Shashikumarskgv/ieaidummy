import { Suspense } from "react";
import HodTpoDashboard from "@/components/super-admin/hod-tpo/page";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading staff dashboard...</div>}>
      <HodTpoDashboard />
    </Suspense>
  );
}
