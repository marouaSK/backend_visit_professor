// src/controllers/applicantController.js
const applicationService = require('../services/applicationService');

exports.getApplicants = async (req, res, next) => {
    try {
        // This calls the RPC via the service
        const applicants = await applicationService.getApplicantsToAssign();
        res.status(200).json(applicants);
    } catch (error) {
        next(error);
    }
};