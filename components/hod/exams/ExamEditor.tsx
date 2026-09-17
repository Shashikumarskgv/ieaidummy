import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ExamForm from "./ExamForm";

import ExamService from "@/services/exam.service";

const CourseService = {
    getAll: async () => ({ data: [] as any[] })
};

export default function ExamEditor() {
    const id = "";

    const navigate = useNavigate();

    const [loading, setLoading] =
        useState(true);

    const [exam, setExam] =
        useState<any>(null);

    const [courses, setCourses] =
        useState<any[]>([]);

    const loadData = async () => {
        try {
            const courseRes =
                await CourseService.getAll();

            setCourses(
                courseRes.data || []
            );

            if (id) {
                const examRes =
                    await ExamService.getById(
                        Number(id)
                    );

                setExam(
                    examRes.data
                );
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleSave = async (
        data: any
    ) => {
        try {

            if (id) {

                await ExamService.update(
                    Number(id),
                    data
                );

            } else {

                const examRes =
                    await ExamService.create({
                        exam_type_id:
                            data.exam_type_id,

                        exam_setting_id:
                            data.exam_setting_id,

                        course_id:
                            data.course_id,

                        title:
                            data.title,

                        description:
                            data.description,

                        instructions:
                            data.instructions,

                        duration:
                            data.duration,

                        total_marks:
                            data.total_marks,

                        total_questions:
                            data.mcqs.length +
                            data.codings.length,

                        pass_percentage:
                            data.pass_percentage,

                        start_date:
                            data.start_date,

                        end_date:
                            data.end_date,

                        status:
                            data.status,
                    });

                console.log(
                    "EXAM CREATED =>",
                    examRes
                );
            }

            // navigate("/dashboard/exams");

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ExamForm
            exam={exam}
            courses={courses}
            onSave={handleSave}
            onCancel={() =>
                navigate(
                    "/dashboard/exams"
                )
            }
        />
    );
}