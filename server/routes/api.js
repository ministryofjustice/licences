const express = require('express')
const swaggerUi = require('swagger-ui-express')
const moment = require('moment')
const swaggerDocument = require('./config/swagger')

module.exports = ({ reportingService }) => {
    const router = express.Router()

    router.use('/docs/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

    const getMethods = {
        addressSubmission: reportingService.getAddressSubmission,
        assessmentComplete: reportingService.getAssessmentComplete,
        finalChecksComplete: reportingService.getFinalChecksComplete,
        decisionMade: reportingService.getApprovalComplete,
    }

    router.get('/:report/', async (req, res) => {
        const { report } = req.params
        const { start, end } = req.query

        const startDate = start ? moment(start, 'DD-MM-YYYY') : null
        const endDate = end ? moment(end, 'DD-MM-YYYY').set({ hour: 23, minute: 59 }) : null
        const invalidDate = (startDate && !startDate.isValid()) || (endDate && !endDate.isValid())
        if (invalidDate) {
            return res.status(400).json({ message: 'Invalid date format' })
        }

        if (!getMethods[report]) {
            return res.status(404).json({ message: 'Not found' })
        }

        try {
            const response = await getMethods[report](startDate, endDate)
            return res.send(response)
        } catch (err) {
            return res.status(500).json({ message: 'Error accessing data' })
        }
    })

    return router
}
