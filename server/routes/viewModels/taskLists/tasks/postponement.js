const getLabel = (postponed, confiscationOrder) => {
  if (postponed) {
    return 'HDC application postponed'
  }
  if (confiscationOrder) {
    return 'Use this to indicate that the process is postponed if a confiscation order is in place'
  }
  return "Postpone the case if you're waiting for information on risk management"
}

const task =
  (title) =>
  ({ decisions }) => {
    const { postponed, confiscationOrder } = decisions

    return {
      title,
      label: getLabel(postponed, confiscationOrder),
      action: {
        text: postponed ? 'Resume' : 'Postpone',
        href: '/hdc/finalChecks/postpone/',
        type: 'btn',
        dataQa: 'postpone',
      },
    }
  }

module.exports = {
  postpone: task('Postpone'),
  postponeOrRefuse: task('Postpone or refuse'),
}
