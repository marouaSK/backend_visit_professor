// src/controllers/criteriaController.js
console.log("--- criteriaController.js --- File loaded."); // DEBUG LOG 3
const criteriaService = require('../services/criteriaService');

exports.fetchAllCriteria = async (req, res, next) => {
    console.log("--- criteriaController.js --- fetchAllCriteria function CALLED."); // DEBUG LOG 4
    try {
        console.log("--- criteriaController.js --- About to call criteriaService.getAllCriteria()"); // DEBUG LOG C1
        const allCriteria = await criteriaService.getAllCriteria();
        console.log("--- criteriaController.js --- criteriaService.getAllCriteria() returned. Data length:", allCriteria ? allCriteria.length : 'undefined/null'); // DEBUG LOG C2
        res.status(200).json(allCriteria);
        console.log("--- criteriaController.js --- Response sent with status 200."); // DEBUG LOG C3
    } catch (error) {
        console.error("Error in fetchAllCriteria controller:", error.message); // DEBUG LOG C4
        console.error("Full error object in controller:", error); // Log the full error
        next(error);
    }
};
console.log("--- criteriaController.js --- fetchAllCriteria EXPORTED. Type:", typeof exports.fetchAllCriteria); // DEBUG LOG 5