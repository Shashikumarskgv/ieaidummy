import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface TestCase {
    input: string;
    expected_output: string;
    is_hidden: boolean;
}

interface Props {
    testCases: TestCase[];
    onChange: (testCases: TestCase[]) => void;
}

export default function TestCaseForm({
    testCases,
    onChange,
}: Props) {
    const addTestCase = () => {
        onChange([
            ...testCases,
            {
                input: "",
                expected_output: "",
                is_hidden: false,
            },
        ]);
    };

    const updateTestCase = (
        index: number,
        field: keyof TestCase,
        value: string | boolean
    ) => {
        const updated = [...testCases];

        updated[index] = {
            ...updated[index],
            [field]: value,
        };

        onChange(updated);
    };

    const removeTestCase = (index: number) => {
        onChange(
            testCases.filter((_, i) => i !== index)
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold">
                    Test Cases
                </h4>

                <Button
                    type="button"
                    size="sm"
                    onClick={addTestCase}
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Test Case
                </Button>
            </div>

            {testCases.map((testCase, index) => (
                <div
                    key={index}
                    className="border rounded-xl p-4 space-y-3"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            placeholder="Input"
                            value={testCase.input}
                            onChange={(e) =>
                                updateTestCase(
                                    index,
                                    "input",
                                    e.target.value
                                )
                            }
                        />

                        <Input
                            placeholder="Expected Output"
                            value={testCase.expected_output}
                            onChange={(e) =>
                                updateTestCase(
                                    index,
                                    "expected_output",
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={testCase.is_hidden}
                                onChange={(e) =>
                                    updateTestCase(
                                        index,
                                        "is_hidden",
                                        e.target.checked
                                    )
                                }
                            />
                            Hidden Test Case
                        </label>

                        <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() =>
                                removeTestCase(index)
                            }
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}