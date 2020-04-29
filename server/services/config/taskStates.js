const taskStates = {
  UNSTARTED: 'UNSTARTED',
  STARTED: 'STARTED',
  DONE: 'DONE',
}

function getOverallState(tasks) {
  if (tasks.every((it) => it === taskStates.UNSTARTED)) {
    return taskStates.UNSTARTED
  }

  if (tasks.every((it) => it === taskStates.DONE)) {
    return taskStates.DONE
  }

  return taskStates.STARTED
}

module.exports = { taskStates, getOverallState }
