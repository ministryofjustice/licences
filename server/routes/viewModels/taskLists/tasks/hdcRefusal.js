const { taskBtn } = require('./utils/actions')

module.exports = {
  getLabel: ({ decisions }) => {
    const { refused } = decisions
    return refused ? 'HDC refused' : 'Refuse the case if there is no available address or not enough time'
  },

  getCaAction: ({ decisions }) => {
    const { refused } = decisions
    return refused
      ? taskBtn('/hdc/finalChecks/refuse/', 'Update refusal', false, 'refuse')
      : taskBtn('/hdc/finalChecks/refuse/', 'Refuse HDC', true, 'refuse')
  },
}
