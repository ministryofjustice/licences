const { standardAction, viewEdit, view } = require('./utils/actions')

const getLabel = ({ curfewHours }) => (curfewHours === 'DONE' ? 'Confirmed' : 'Not completed')

const title = 'Curfew hours'

module.exports = {
  edit: ({ tasks, visible }) => {
    return {
      title,
      label: getLabel(tasks),
      action: viewEdit('/hdc/curfew/curfewHours/', 'curfew-hours'),
      visible,
    }
  },
  view: ({ tasks, visible }) => {
    return {
      title,
      label: getLabel(tasks),
      action: view('/hdc/review/curfewHours/'),
      visible,
    }
  },
  ro: ({ tasks, visible }) => {
    const { curfewHours } = tasks
    return {
      title,
      label: getLabel(tasks),
      action: standardAction(curfewHours, '/hdc/curfew/curfewHours/'),
      visible,
    }
  },
}
