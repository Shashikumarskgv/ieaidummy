import { Suspense } from "react";
import DeleteStaffPage from "@/components/super-admin/hod-tpo/delete/[id]/page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading staff profile...</div>}>
      <DeleteStaffPage staffId={id} />
    </Suspense>
  );
}
