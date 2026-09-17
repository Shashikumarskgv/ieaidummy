import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
    value: {
        question: string;
        options: string[];
        correct_answer: string;
        positive_marks: number;
        negative_marks: number;
        difficulty_level: string;
    };
    onChange: (value: any) => void;
}

export default function McqQuestionForm({
    value,
    onChange,
}: Props) {
    const updateOption = (
        index: number,
        optionValue: string
    ) => {
        const updated = [...value.options];

        updated[index] = optionValue;

        onChange({
            ...value,
            options: updated,
        });
    };

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
                    Question
                </label>

                <Textarea
                    rows={5}
                    value={value.question}
                    onChange={(e) =>
                        updateField(
                            "question",
                            e.target.value
                        )
                    }
                    placeholder="Enter question..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {value.options.map(
                    (option, index) => (
                        <Input
                            key={index}
                            value={option}
                            placeholder={`Option ${index + 1
                                }`}
                            onChange={(e) =>
                                updateOption(
                                    index,
                                    e.target.value
                                )
                            }
                        />
                    )
                )}
            </div>

            <div className="grid grid-cols-4 gap-4">
                <select
                    className="border rounded-md px-3 h-10"
                    value={value.correct_answer}
                    onChange={(e) =>
                        updateField(
                            "correct_answer",
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        Select Answer
                    </option>

                    {value.options.map(
                        (option, index) => (
                            <option
                                key={index}
                                value={option}
                            >
                                {option ||
                                    `Option ${index + 1
                                    }`}
                            </option>
                        )
                    )}
                </select>

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
                    className="border rounded-md px-3 h-10"
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
        </div>
    );
}