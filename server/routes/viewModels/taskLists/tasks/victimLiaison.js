const { standardAction, viewEdit, view } = require('./utils/actions')

module.exports = {
  getLabel: ({ decisions, tasks }) => {
    const { victimLiaisonNeeded } = decisions
    const { victim } = tasks

    if (victim === 'DONE') {
      return victimLiaisonNeeded ? 'Victim liaison required' : 'No victim liaison required'
    }
    return 'Not completed'
  },

  getRoAction: ({ tasks }) => {
    const { victim } = tasks
    return standardAction(victim, '/hdc/victim/victimLiaison/')
  },

  edit: () => viewEdit('/hdc/victim/victimLiaison/', 'victim-liaison'),

  view: () => view('/hdc/review/victimLiaison/'),
}
