const { standardAction, viewEdit, view } = require('./utils/actions')

module.exports = {
  getLabel: ({ tasks }) => {
    const { curfewHours } = tasks
    return curfewHours === 'DONE' ? 'Confirmed' : 'Not completed'
  },

  getRoAction: ({ tasks }) => {
    const { curfewHours } = tasks
    return standardAction(curfewHours, '/hdc/curfew/curfewHours/')
  },

  edit: () => viewEdit('/hdc/curfew/curfewHours/', 'curfew-hours'),

  view: () => view('/hdc/review/curfewHours/'),
}
