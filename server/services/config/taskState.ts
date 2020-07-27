export enum TaskState {
  UNSTARTED = 'UNSTARTED',
  STARTED = 'STARTED',
  DONE = 'DONE',
}

export function getOverallState(tasks) {
  if (tasks.every((it) => it === TaskState.UNSTARTED)) {
    return TaskState.UNSTARTED
  }

  if (tasks.every((it) => it === TaskState.DONE)) {
    return TaskState.DONE
  }

  return TaskState.STARTED
}

export const anyStarted = (tasks) => tasks.some((task) => [TaskState.STARTED, TaskState.DONE].includes(task))

export const allComplete = (required) => required.every((it) => it === TaskState.DONE)
