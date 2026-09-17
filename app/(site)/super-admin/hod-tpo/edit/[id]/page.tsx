import { Suspense } from "react";
import EditStaffPage from "@/components/super-admin/hod-tpo/edit/[id]/page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading staff editor...</div>}>
      <EditStaffPage staffId={id} />
    </Suspense>
  );
}
