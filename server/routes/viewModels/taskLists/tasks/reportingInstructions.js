const { standardAction } = require('./utils/actions')

module.exports = {
    getLabel: ({ tasks }) => {
        const { reportingInstructions } = tasks
        return reportingInstructions === 'DONE' ? 'Confirmed' : 'Not completed'
    },

    getRoAction: ({ tasks }) => {
        const { reportingInstructions } = tasks
        return standardAction(reportingInstructions, '/hdc/reporting/reportingInstructions/')
    },
}
