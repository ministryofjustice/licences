const { TaskState, getOverallState } = require('../config/taskState')
const { getIn, isEmpty } = require('../../utils/functionalHelpers')

module.exports = {
  getEligibilityState,
}

function getEligibilityState(licence) {
  const { exclusion, excluded } = getExclusionState(licence)
  const { crdTime, insufficientTime, insufficientTimeContinue, insufficientTimeStop } = getCrdTimeState(licence)
  const { suitability, unsuitable, unsuitableResult, exceptionalCircumstances } = getSuitabilityState(licence)

  const notEligible = excluded || insufficientTimeStop || unsuitableResult
  const eligibility = notEligible ? TaskState.DONE : getOverallState([exclusion, crdTime, suitability])
  // some things mean not eligible no matter what else, but we only know definitely eligible when all answers complete
  const eligible = notEligible ? false : eligibility === TaskState.DONE

  return {
    tasks: {
      exclusion,
      suitability,
      crdTime,
      eligibility,
    },
    decisions: {
      eligible,
      excluded,
      unsuitable,
      unsuitableResult,
      exceptionalCircumstances,
      insufficientTime,
      insufficientTimeContinue,
      insufficientTimeStop,
    },
  }
}

function getExclusionState(licence) {
  const excludedAnswer = getIn(licence, ['eligibility', 'excluded', 'decision'])

  return {
    excluded: excludedAnswer === 'Yes',
    exclusion: excludedAnswer ? TaskState.DONE : TaskState.UNSTARTED,
  }
}

function getCrdTimeState(licence) {
  const decision = getIn(licence, ['eligibility', 'crdTime', 'decision'])
  const dmApproval = getIn(licence, ['eligibility', 'crdTime', 'dmApproval'])

  return {
    insufficientTimeContinue: decision === 'Yes' && dmApproval === 'Yes',
    insufficientTimeStop: decision === 'Yes' && dmApproval === 'No',
    insufficientTime: decision === 'Yes',
    crdTime: getState(),
  }

  function getState() {
    if (isEmpty(getIn(licence, ['eligibility', 'crdTime']))) {
      return TaskState.UNSTARTED
    }

    if (decision === 'No') {
      return TaskState.DONE
    }

    if (isEmpty(dmApproval)) {
      return TaskState.STARTED
    }

    return TaskState.DONE
  }
}

function getSuitabilityState(licence) {
  const unsuitableAnswer = getIn(licence, ['eligibility', 'suitability', 'decision'])
  const exceptionalCircumstances = getIn(licence, ['eligibility', 'exceptionalCircumstances', 'decision'])

  return {
    unsuitable: unsuitableAnswer === 'Yes',
    exceptionalCircumstances: exceptionalCircumstances === 'Yes',
    unsuitableResult: unsuitableAnswer === 'Yes' && exceptionalCircumstances === 'No',
    suitability: getState(),
  }

  function getState() {
    if (!unsuitableAnswer) {
      return TaskState.UNSTARTED
    }

    if (unsuitableAnswer === 'No') {
      return TaskState.DONE
    }

    if (exceptionalCircumstances) {
      return TaskState.DONE
    }

    return TaskState.STARTED
  }
}
