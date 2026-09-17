import { Suspense } from "react";
import DeleteCollegePage from "@/components/dq-admin/college/delete/[id]/page";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading college profile...</div>}>
      <DeleteCollegePage />
    </Suspense>
  );
}
