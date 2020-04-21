const { taskBtn } = require('./utils/actions')

const getLabel = (refused) =>
  refused ? 'HDC refused' : 'Refuse the case if there is no available address or not enough time'

const getCaAction = (refused) =>
  refused
    ? taskBtn('/hdc/finalChecks/refuse/', 'Update refusal', false, 'refuse')
    : taskBtn('/hdc/finalChecks/refuse/', 'Refuse HDC', true, 'refuse')

module.exports = ({ decisions, visible = true }) => {
  const { refused } = decisions
  return {
    title: null,
    label: getLabel(refused),
    action: getCaAction(refused),
    visible,
  }
}
