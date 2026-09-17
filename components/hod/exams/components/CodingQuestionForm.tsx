import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MonacoCodeEditor from "./MonacoCodeEditor";
import TestCaseForm, {
    TestCase,
} from "./TestCaseForm";

interface Props {
    value: {
        question: string;
        language: string;
        starter_code: string;
        test_cases: TestCase[];
        difficulty_level: string;
        positive_marks: number;
        negative_marks: number;
    };
    onChange: (value: any) => void;
}

export default function CodingQuestionForm({
    value,
    onChange,
}: Props) {
    const updateField = (
        field: string,
        fieldValue: any
    ) => {
        onChange({
            ...value,
            [field]: fieldValue,
        });
    };

    return (
        <div className="space-y-5">
            <div>
                <label className="text-sm font-medium">
                    Problem Statement
                </label>

                <Textarea
                    rows={8}
                    value={value.question}
                    onChange={(e) =>
                        updateField(
                            "question",
                            e.target.value
                        )
                    }
                    placeholder="Write coding problem statement..."
                />
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Input
                    placeholder="Language"
                    value={value.language}
                    onChange={(e) =>
                        updateField(
                            "language",
                            e.target.value
                        )
                    }
                />

                <Input
                    type="number"
                    placeholder="Positive Marks"
                    value={value.positive_marks}
                    onChange={(e) =>
                        updateField(
                            "positive_marks",
                            Number(e.target.value)
                        )
                    }
                />

                <Input
                    type="number"
                    placeholder="Negative Marks"
                    value={value.negative_marks}
                    onChange={(e) =>
                        updateField(
                            "negative_marks",
                            Number(e.target.value)
                        )
                    }
                />

                <select
                    className="border rounded-md px-3"
                    value={value.difficulty_level}
                    onChange={(e) =>
                        updateField(
                            "difficulty_level",
                            e.target.value
                        )
                    }
                >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                </select>
            </div>

            <div>
                <label className="text-sm font-medium">
                    Starter Code
                </label>

                <MonacoCodeEditor
                    language={value.language}
                    value={value.starter_code}
                    onChange={(code) =>
                        updateField(
                            "starter_code",
                            code
                        )
                    }
                />
            </div>

            <TestCaseForm
                testCases={value.test_cases}
                onChange={(cases) =>
                    updateField(
                        "test_cases",
                        cases
                    )
                }
            />
        </div>
    );
}