export interface Exam {
    id?: number;

    exam_type_id: number;
    exam_setting_id: number;
    course_id: number;

    title: string;
    description: string;
    instructions: string;

    duration: number;
    total_marks: number;
    total_questions: number;
    pass_percentage: number;

    start_date?: string;
    end_date?: string;

    status: string;

    created_at?: string;
    updated_at?: string;
}

export interface McqQuestion {
    id?: number;

    exam_id?: number;
    course_id: number;

    question_type: "MCQ";

    question: string;

    options: string[];

    correct_answer: string;

    positive_marks: number;
    negative_marks: number;

    difficulty_level:
    | "Easy"
    | "Medium"
    | "Hard";
}

export interface CodingQuestion {
    id?: number;

    exam_id?: number;
    course_id: number;

    question_type: "Coding";

    question: string;

    language?: string;

    starter_code?: string;

    solution_code?: string;

    test_cases?: TestCase[];

    positive_marks: number;
    negative_marks: number;

    difficulty_level:
    | "Easy"
    | "Medium"
    | "Hard";
}

export interface TestCase {
    input: string;
    expected_output: string;
}

export interface ExamQuestionResponse {
    totalQuestions: number;
    questions: (
        | McqQuestion
        | CodingQuestion
    )[];
}

export interface ExamListResponse {
    success: boolean;
    data: Exam[];
}

export interface ExamResponse {
    success: boolean;
    data: Exam;
}

export interface CreateExamPayload
    extends Omit<
        Exam,
        "id" | "created_at" | "updated_at"
    > { }

export interface UpdateExamPayload
    extends CreateExamPayload {
    id: number;
}