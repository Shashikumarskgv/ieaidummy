import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
                                        {exam.course_name}
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