import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "@/services/auth.service";
import { fetchColleges, fetchAcademicCatalog } from "@/services/college.service";

import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ExamService from "@/services/exam.service";

export default function Exams() {
    const navigate = useNavigate();

    const [loading, setLoading] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [exams, setExams] =
        useState<any[]>([]);

    const [colleges, setColleges] = useState<any[]>([]);
    const [catalog, setCatalog] = useState<any[]>([]);

    useEffect(() => {
        fetchColleges().then(cols => {
            setColleges(cols);
        }).catch(err => console.error(err));

        fetchAcademicCatalog().then(cat => {
            setCatalog(cat);
        }).catch(err => console.error(err));
    }, []);

    const currentUser = AuthService.getUser();
    const collegeCode = currentUser?.college_code || "";

    const selectedCollege = useMemo(() => {
        return colleges.find(c => String(c.id) === String(collegeCode) || c.code === collegeCode) || colleges[0] || null;
    }, [colleges, collegeCode]);

    const getCourseHierarchyLabel = (courseName: string, academicProfile: any, catalogData: any[]) => {
        if (!academicProfile || !catalogData || catalogData.length === 0) return courseName;

        let found = false;
        let result = courseName;
        Object.entries(academicProfile).forEach(([instTypeCode, levelMap]: [string, any]) => {
            if (found || !levelMap || typeof levelMap !== "object") return;

            Object.entries(levelMap).forEach(([levelCode, degreeMap]: [string, any]) => {
                if (found || !degreeMap || typeof degreeMap !== "object") return;

                Object.entries(degreeMap).forEach(([degreeCode, depts]: [string, any]) => {
                    if (found || !Array.isArray(depts)) return;

                    const deptMatch = depts.find(d => d.trim().toUpperCase() === courseName.trim().toUpperCase());
                    if (deptMatch) {
                        let degreeName = degreeCode;
                        catalogData.forEach(instType => {
                            if (instType.levels) {
                                instType.levels.forEach((lvl: any) => {
                                    if (lvl.degrees) {
                                        const match = lvl.degrees.find((d: any) => d.id === degreeCode);
                                        if (match) {
                                            degreeName = match.name;
                                        }
                                    }
                                });
                            }
                        });

                        result = `${levelCode} → ${degreeName} → ${deptMatch}`;
                        found = true;
                    }
                });
            });
        });

        return result;
    };

    const loadExams = async () => {
        try {
            setLoading(true);

            const res =
                await ExamService.getAll(
                    search
                );

            setExams(
                res.data || []
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExams();
    }, []);

    const handleSearch = async (
        value: string
    ) => {
        setSearch(value);

        const res =
            await ExamService.getAll(
                value
            );

        setExams(
            res.data || []
        );
    };

    const handleDelete = async (
        id: number
    ) => {
        const confirmDelete =
            window.confirm(
                "Delete Exam?"
            );

        if (!confirmDelete) return;

        await ExamService.delete(id);

        loadExams();
    };

    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-3xl font-bold">
                        Exams
                    </h1>

                    <p className="text-muted-foreground">
                        Manage Exams & Questions
                    </p>
                </div>

                <Button
                    onClick={() =>
                        navigate(
                            "/dashboard/exams/create"
                        )
                    }
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Exam
                </Button>

            </div>

            <div className="flex gap-3">

                <div className="relative flex-1">

                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />

                    <Input
                        value={search}
                        placeholder="Search Exams..."
                        className="pl-10"
                        onChange={(e) =>
                            handleSearch(
                                e.target.value
                            )
                        }
                    />

                </div>

            </div>

            <div className="border rounded-xl overflow-hidden">

                <table className="w-full">

                    <thead className="bg-muted">

                        <tr>

                            <th className="p-4 text-left">
                                Title
                            </th>

                            <th className="p-4 text-left">
                                Course
                            </th>

                            <th className="p-4 text-left">
                                Duration
                            </th>

                            <th className="p-4 text-left">
                                Questions
                            </th>

                            <th className="p-4 text-left">
                                Status
                            </th>

                            <th className="p-4 text-right">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {loading ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="p-8 text-center"
                                >
                                    Loading...
                                </td>
                            </tr>
                        ) : exams.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="p-8 text-center"
                                >
                                    No Exams Found
                                </td>
                            </tr>
                        ) : (
                            exams.map((exam) => (
                                <tr
                                    key={exam.id}
                                    className="border-t"
                                >
                                    <td className="p-4">
                                        {exam.title}
                                    </td>

                                    <td className="p-4">
                                        {getCourseHierarchyLabel(exam.course_name, selectedCollege?.academicProfile, catalog)}
                                    </td>

                                    <td className="p-4">
                                        {exam.duration}
                                        min
                                    </td>

                                    <td className="p-4">
                                        {
                                            exam.total_questions
                                        }
                                    </td>

                                    <td className="p-4">
                                        {exam.status}
                                    </td>

                                    <td className="p-4">

                                        <div className="flex justify-end gap-2">

                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    navigate(
                                                        `/dashboard/exams/edit/${exam.id}`
                                                    )
                                                }
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    navigate(
                                                        `/dashboard/exams/edit/${exam.id}`
                                                    )
                                                }
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() =>
                                                    handleDelete(
                                                        exam.id
                                                    )
                                                }
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>

                                        </div>

                                    </td>
                                </tr>
                            ))
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}