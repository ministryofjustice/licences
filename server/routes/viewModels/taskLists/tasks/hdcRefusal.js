const { taskBtn } = require('./utils/actions')

module.exports = ({ decisions }) => {
  const { refused } = decisions
  return {
    title: null,
    label: refused ? 'HDC refused' : 'Refuse the case if there is no available address or not enough time',
    action: refused
      ? taskBtn('/hdc/finalChecks/refuse/', 'Update refusal', false, 'refuse')
      : taskBtn('/hdc/finalChecks/refuse/', 'Refuse HDC', true, 'refuse'),
  }
}
