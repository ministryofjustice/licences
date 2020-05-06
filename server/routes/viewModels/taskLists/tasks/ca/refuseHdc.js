const { taskBtn } = require('../utils/actions')

module.exports = ({ decisions }) => {
  const { caRefused } = decisions
  return {
    title: null,
    label: caRefused ? 'HDC refused' : 'Refuse the case if there is no available address or not enough time',
    action: caRefused
      ? taskBtn('/hdc/finalChecks/refuse/', 'Update refusal', false, 'refuse')
      : taskBtn('/hdc/finalChecks/refuse/', 'Refuse HDC', true, 'refuse'),
  }
}
