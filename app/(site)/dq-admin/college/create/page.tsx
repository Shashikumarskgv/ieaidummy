import { Suspense } from "react";
import CreateCollegePage from "@/components/dq-admin/college/create/page";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading college onboarding form...</div>}>
      <CreateCollegePage />
    </Suspense>
  );
}
