import { useState } from "react";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import McqQuestionForm from "./components/McqQuestionForm";
import CodingQuestionForm from "./components/CodingQuestionForm";

interface Course {
    id: number;
    name: string;
}

interface Props {
    exam?: any;
    courses: Course[];
    onSave: (data: any) => void;
    onCancel: () => void;
}

export default function ExamForm({
    exam,
    courses,
    onSave,
    onCancel,
}: Props) {
    const [form, setForm] = useState({
        exam_type_id: exam?.exam_type_id || "",
        exam_setting_id:
            exam?.exam_setting_id || "",
        course_id: exam?.course_id || "",

        title: exam?.title || "",
        description:
            exam?.description || "",

        instructions:
            exam?.instructions || "",

        duration:
            exam?.duration || 60,

        total_marks:
            exam?.total_marks || 0,

        total_questions:
            exam?.total_questions || 0,

        pass_percentage:
            exam?.pass_percentage || 40,

        start_date:
            exam?.start_date || "",

        end_date:
            exam?.end_date || "",

        status:
            exam?.status || "Draft",
    });

    const [mcq, setMcq] = useState({
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
        positive_marks: 1,
        negative_marks: 0,
        difficulty_level: "Medium",
    });

    const [coding, setCoding] = useState({
        question: "",
        language: "python",
        positive_marks: 10,
        negative_marks: 0,
        difficulty_level: "Medium",
        starter_code: "",
        solution_code: "",
        test_cases: [
            {
                input: "",
                expected_output: "",
                is_hidden: false,
            },
        ],
    });

    const updateField = (
        field: string,
        value: any
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = () => {
        onSave({
            ...form,
            mcq,
            coding,
        });
    };

    return (
        <div className="space-y-6">

            <div className="bg-card border rounded-xl p-6 space-y-4">

                <h2 className="text-xl font-bold">
                    Exam Information
                </h2>

                <Input
                    placeholder="Exam Title"
                    value={form.title}
                    onChange={(e) =>
                        updateField(
                            "title",
                            e.target.value
                        )
                    }
                />

                <Textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) =>
                        updateField(
                            "description",
                            e.target.value
                        )
                    }
                />

                <select
                    value={form.course_id}
                    onChange={(e) =>
                        updateField(
                            "course_id",
                            Number(
                                e.target.value
                            )
                        )
                    }
                    className="w-full h-10 border rounded-md px-3"
                >
                    <option value="">
                        Select Course
                    </option>

                    {courses.map((course) => (
                        <option
                            key={course.id}
                            value={course.id}
                        >
                            {course.name}
                        </option>
                    ))}
                </select>

                <div className="grid grid-cols-4 gap-4">

                    <Input
                        type="number"
                        placeholder="Duration"
                        value={form.duration}
                        onChange={(e) =>
                            updateField(
                                "duration",
                                Number(
                                    e.target.value
                                )
                            )
                        }
                    />

                    <Input
                        type="number"
                        placeholder="Total Marks"
                        value={form.total_marks}
                        onChange={(e) =>
                            updateField(
                                "total_marks",
                                Number(
                                    e.target.value
                                )
                            )
                        }
                    />

                    <Input
                        type="number"
                        placeholder="Questions"
                        value={
                            form.total_questions
                        }
                        onChange={(e) =>
                            updateField(
                                "total_questions",
                                Number(
                                    e.target.value
                                )
                            )
                        }
                    />

                    <Input
                        type="number"
                        placeholder="Pass %"
                        value={
                            form.pass_percentage
                        }
                        onChange={(e) =>
                            updateField(
                                "pass_percentage",
                                Number(
                                    e.target.value
                                )
                            )
                        }
                    />

                </div>

            </div>

            <div className="bg-card border rounded-xl p-6">

                <h2 className="text-xl font-bold mb-4">
                    Instructions
                </h2>

                <Textarea
                    placeholder="Instructions"
                    value={form.instructions}
                    onChange={(e) =>
                        updateField(
                            "instructions",
                            e.target.value
                        )
                    }
                    rows={6}
                />

            </div>

            <div className="bg-card border rounded-xl p-6">

                <Tabs defaultValue="mcq">

                    <TabsList>
                        <TabsTrigger value="mcq">
                            MCQ Question
                        </TabsTrigger>

                        <TabsTrigger value="coding">
                            Coding Question
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="mcq">
                        <McqQuestionForm
                            value={mcq}
                            onChange={setMcq}
                        />
                    </TabsContent>

                    <TabsContent value="coding">
                        <CodingQuestionForm
                            value={coding}
                            onChange={setCoding}
                        />
                    </TabsContent>

                </Tabs>

            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                >
                    Save Exam
                </Button>
            </div>

        </div>
    );
}