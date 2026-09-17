import { Suspense } from "react";
import DeleteStudentPage from "@/components/super-admin/student/delete/[id]/page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading student profile...</div>}>
      <DeleteStudentPage studentId={id} />
    </Suspense>
  );
}
