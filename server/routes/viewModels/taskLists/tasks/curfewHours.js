const { standardAction, viewEdit, view } = require('./utils/actions')

const getLabel = ({ curfewHours }) => (curfewHours === 'DONE' ? 'Confirmed' : 'Not completed')

const title = 'Curfew hours'

module.exports = {
  edit: ({ tasks }) => {
    return {
      title,
      label: getLabel(tasks),
      action: viewEdit('/hdc/curfew/curfewHours/', 'curfew-hours'),
    }
  },
  view: ({ tasks }) => {
    return {
      title,
      label: getLabel(tasks),
      action: view('/hdc/review/curfewHours/'),
    }
  },
  ro: ({ tasks }) => {
    const { curfewHours } = tasks
    return {
      title,
      label: getLabel(tasks),
      action: standardAction(curfewHours, '/hdc/curfew/curfewHours/'),
    }
  },
}
