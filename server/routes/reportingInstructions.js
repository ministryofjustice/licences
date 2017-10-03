const express = require('express');

module.exports = function({reportingInstructionService}) {
    const router = express.Router();

    router.get('/:prisonNumber', (req, res) => {
        const existingInputs = reportingInstructionService.getExistingInputs();

        res.render('reportingInstructions/index', existingInputs);
    });

    return router;
};
