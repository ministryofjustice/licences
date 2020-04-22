const { standardAction, view } = require('./utils/actions')

const getLabel = ({ decisions, tasks }) => {
  const { finalChecks } = tasks
  const { seriousOffence, onRemand, confiscationOrder } = decisions

  const labels = {
    seriousOffence: { true: 'The offender is under investigation or been charged for a serious offence in custody' },
    onRemand: { true: 'The offender is on remand' },
    confiscationOrder: { true: 'The offender is subject to a confiscation order' },
  }

  const warningLabel = [
    labels.seriousOffence[seriousOffence],
    labels.onRemand[onRemand],
    labels.confiscationOrder[confiscationOrder],
  ]
    .filter(Boolean)
    .join('||')

  if (warningLabel) {
    return `WARNING||${warningLabel}`
  }

  return finalChecks === 'DONE' ? 'Confirmed' : 'Not completed'
}

module.exports = {
  review: ({ decisions, tasks, visible = true }) => {
    const { finalChecks } = tasks
    return {
      title: 'Review case',
      label: getLabel({ decisions, tasks }),
      action: standardAction(finalChecks, '/hdc/finalChecks/seriousOffence/', 'review-case'),
      visible,
    }
  },
  view: ({ decisions, tasks, visible = true }) => ({
    title: 'Review case',
    label: getLabel({ decisions, tasks }),
    action: view('/hdc/review/finalChecks/'),
    visible,
  }),
}
