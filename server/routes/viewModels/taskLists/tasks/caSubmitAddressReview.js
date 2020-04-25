const { continueBtn } = require('./utils/actions')

module.exports = ({ decisions, tasks }) => {
  const { optedOut } = decisions
  const curfewAddressDone = tasks.curfewAddress === 'DONE'
  return {
    title: 'Submit curfew address',
    label: curfewAddressDone ? 'Ready to submit' : 'Not completed',
    action: curfewAddressDone && !optedOut ? continueBtn('/hdc/review/curfewAddress/') : null,
  }
}
