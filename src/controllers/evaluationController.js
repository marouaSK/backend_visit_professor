const evaluationService = require('../services/evaluationService');
const teacherService = require('../services/teacherService');

exports.assignEvaluator = async (req, res, next) => {
    try {
        const { applicantTeacherId, applicationId, evaluatorTeacherId } = req.body;
        if (!applicantTeacherId || !applicationId || !evaluatorTeacherId) {
            return res.status(400).json({ message: "Missing required fields." });
        }
        if (String(applicantTeacherId) === String(evaluatorTeacherId)) {
            return res.status(400).json({ message: "Cannot assign self as evaluator." });
        }
        const [applicant, evaluator] = await Promise.all([
            teacherService.findTeacherById(applicantTeacherId),
            teacherService.findTeacherById(evaluatorTeacherId)
        ]);
        if (!applicant) return res.status(404).json({ message: "Applicant not found." });
        if (!evaluator) return res.status(404).json({ message: "Evaluator not found." });

        const newEvaluation = await evaluationService.createEvaluation({
            applicantTeacherId, applicationId, evaluatorTeacherId
        });
        res.status(201).json({
            message: `${applicant["Full_Name"]} assigned to ${evaluator["Full_Name"]}.`,
            evaluation: newEvaluation
        });
    } catch (error) {
        if (error.message.includes('violates foreign key constraint')) {
             return res.status(409).json({ message: "Assignment failed: Invalid ID provided." });
        }
        if (error.message.includes('violates unique constraint')) {
            return res.status(409).json({ message: "This assignment might already exist." });
        }
        next(error);
    }
};