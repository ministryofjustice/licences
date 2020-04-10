const { standardAction } = require('./utils/actions')

module.exports = {
  getLabel: ({ decisions, tasks }) => {
    const { finalChecks } = tasks
    const { seriousOffence, onRemand, confiscationOrder } = decisions

    const warningLabel = [
      seriousOffence && 'The offender is under investigation or been charged for a serious offence in custody',
      onRemand && 'The offender is on remand',
      confiscationOrder && 'The offender is subject to a confiscation order',
    ]
      .filter(Boolean)
      .join('||')

    if (warningLabel) {
      return `WARNING||${warningLabel}`
    }

    return finalChecks === 'DONE' ? 'Confirmed' : 'Not completed'
  },

  getCaProcessingAction: ({ tasks }) => {
    const { finalChecks } = tasks

    return standardAction(finalChecks, '/hdc/finalChecks/seriousOffence/')
  },
}
