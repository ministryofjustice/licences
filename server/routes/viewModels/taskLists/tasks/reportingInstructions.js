const { standardAction, viewEdit, view } = require('./utils/actions')

const getLabel = ({ reportingInstructions }) => (reportingInstructions === 'DONE' ? 'Confirmed' : 'Not completed')

const title = 'Reporting instructions'

module.exports = {
  edit: ({ tasks }) => {
    return {
      title,
      label: getLabel(tasks),
      action: viewEdit('/hdc/reporting/reportingInstructions/', 'reporting-instructions'),
    }
  },
  view: ({ tasks }) => {
    return {
      title,
      label: getLabel(tasks),
      action: view('/hdc/review/reporting/'),
    }
  },
  ro: ({ tasks }) => {
    const { reportingInstructions } = tasks
    return {
      title,
      label: getLabel(tasks),
      action: standardAction(reportingInstructions, '/hdc/reporting/reportingInstructions/'),
    }
  },
}
