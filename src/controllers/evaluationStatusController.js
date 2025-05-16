// src/controllers/evaluationStatusController.js
const evaluationStatusService = require('../services/evaluationStatusService');

exports.getStatuses = async (req, res, next) => {
    try {
        const statuses = await evaluationStatusService.fetchAllEvaluationStatuses();
        res.status(200).json(statuses);
    } catch (error) {
        next(error);
    }
};