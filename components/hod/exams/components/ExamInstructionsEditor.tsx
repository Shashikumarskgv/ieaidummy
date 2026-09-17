import { Textarea } from "@/components/ui/textarea";

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export default function ExamInstructionsEditor({
    value,
    onChange,
}: Props) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">
                Exam Instructions
            </label>

            <div className="bg-background rounded-xl overflow-hidden">
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Write exam instructions..."
                    rows={8}
                    className="w-full text-xs"
                />
            </div>
        </div>
    );
}