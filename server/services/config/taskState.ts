export enum taskState {
  UNSTARTED = 'UNSTARTED',
  STARTED = 'STARTED',
  DONE = 'DONE',
}

export function getOverallState(tasks) {
  if (tasks.every((it) => it === taskState.UNSTARTED)) {
    return taskState.UNSTARTED
  }

  if (tasks.every((it) => it === taskState.DONE)) {
    return taskState.DONE
  }

  return taskState.STARTED
}

export const anyStarted = (tasks) => tasks.some((task) => [taskState.STARTED, taskState.DONE].includes(task))

export const allComplete = (required) => required.every((it) => it === taskState.DONE)
