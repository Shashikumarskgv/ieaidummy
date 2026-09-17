import { Suspense } from "react";
import EditCollegePage from "@/components/dq-admin/college/edit/[id]/page";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading college editor...</div>}>
      <EditCollegePage />
    </Suspense>
  );
}
