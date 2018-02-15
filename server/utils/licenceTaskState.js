const {getIn, isEmpty} = require('../utils/functionalHelpers');
const taskStates = require('../data/taskStates');
const {states} = require('../data/licenceStates');

module.exports = {
    getTaskData,
    allCompletedState
};

function getTaskData(licence) {
    const isEligible = getEligibility(getIn(licence, ['licence', 'eligibility']));
    const hasStarted = getHasStarted(licence);
    const hasOptedOut = getOptedOut(licence);
    const hasBassReferral = getBassReferralDecision(licence);
    const handoverState = getIn(licence, ['status']);

    const eligibility = {
        answers: getIn(licence, ['licence', 'eligibility']),
        state: getIn(licence, ['licence', 'eligibility']) ? taskStates.DONE : taskStates.DEFAULT
    };

    const proposedAddress = {
        state: getProposedAddressState(hasStarted, handoverState, hasOptedOut, hasBassReferral)
    };

    const curfewAddress = {
        state: getIn(licence, ['licence', 'curfew', 'curfewAddressReview']) ?
            taskStates.STARTED : taskStates.DEFAULT
    };

    const additionalConditions = {
        state: getAdditionalConditionsState(licence)
    };

    const riskManagement = {
        state: getIn(licence, ['licence', 'licenceConditions', 'riskManagement']) ?
            taskStates.STARTED : taskStates.DEFAULT
    };

    const reportingInstructions = {
        state: getIn(licence, ['licence', 'reportingInstructions']) ? taskStates.STARTED : taskStates.DEFAULT
    };

    const readyToSubmit = allCompletedState([curfewAddress, additionalConditions, riskManagement]);
    // todo include reportingInstructions

    return {
        isEligible,
        hasStarted,
        hasOptedOut,
        hasBassReferral,
        eligibility,
        proposedAddress,
        curfewAddress,
        additionalConditions,
        riskManagement,
        reportingInstructions,
        readyToSubmit
    };
};

function allCompletedState(tasks) {
    return tasks.every(isCompletedState);
}

function isCompletedState(task) {
    // todo Define minimum requirements for each task and oly look for DONE
    return [taskStates.STARTED, taskStates.DONE].includes(task.state);
}

function getProposedAddressState(hasStarted, handoverState, hasOptedOut, hasBassReferral) {

    if (handoverState !== states.DEFAULT || hasOptedOut || hasBassReferral) {
        return taskStates.DONE;
    }
    if (hasStarted) {
        return taskStates.STARTED;
    }
    return taskStates.DEFAULT;
}

function getEligibility(eligibilityObject) {

    if (!eligibilityObject) {
        return false;
    }
    return eligibilityObject.excluded.decision === 'No' && eligibilityObject.suitability.decision === 'No';
}

function getHasStarted(licence) {
    return !isEmpty(getIn(licence, ['licence', 'proposedAddress', 'optOut']));
}

function getOptedOut(licence) {
    return getIn(licence, ['licence', 'proposedAddress', 'optOut', 'decision']) === 'Yes';
}

function getBassReferralDecision(licence) {
    return getIn(licence, ['licence', 'proposedAddress', 'bassReferral', 'decision']) === 'Yes';
}

function getAdditionalConditionsState(licence) {
    const additionalRequired =
        getIn(licence, ['licence', 'licenceConditions', 'standardConditions', 'additionalConditionsRequired']);

    if (additionalRequired && additionalRequired === 'No') {
        return taskStates.DONE;
    } else if (additionalRequired) {
        return taskStates.STARTED;
    }

    return taskStates.DEFAULT;
}
