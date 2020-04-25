const { standardAction, viewEdit, view } = require('./utils/actions')

const getLabel = ({ decisions, tasks }) => {
  const { victimLiaisonNeeded } = decisions
  const { victim } = tasks

  if (victim === 'DONE') {
    return victimLiaisonNeeded ? 'Victim liaison required' : 'No victim liaison required'
  }
  return 'Not completed'
}

const title = 'Victim liaison'

module.exports = {
  edit: ({ decisions, tasks }) => {
    return {
      title,
      label: getLabel({ decisions, tasks }),
      action: viewEdit('/hdc/victim/victimLiaison/', 'victim-liaison'),
    }
  },
  view: ({ decisions, tasks }) => {
    return {
      title,
      label: getLabel({ decisions, tasks }),
      action: view('/hdc/review/victimLiaison/'),
    }
  },
  ro: ({ decisions, tasks }) => {
    const { victim } = tasks
    return {
      title,
      label: getLabel({ decisions, tasks }),
      action: standardAction(victim, '/hdc/victim/victimLiaison/'),
    }
  },
}
