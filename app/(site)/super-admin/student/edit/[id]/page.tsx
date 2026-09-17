import { Suspense } from "react";
import EditStudentPage from "@/components/super-admin/student/edit/[id]/page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading student editor...</div>}>
      <EditStudentPage studentId={id} />
    </Suspense>
  );
}
