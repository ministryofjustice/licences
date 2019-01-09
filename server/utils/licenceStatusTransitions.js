const {taskStates} = require('../services/config/taskStates');

module.exports = {getAllowedTransition};

function getAllowedTransition(licenceStatus, role) {

    if (!licenceStatus) {
        return null;
    }

    switch (role) {
        case 'RO':
            if (canSendRoToCa(licenceStatus)) {
                return 'roToCa';
            }

            return null;

        case 'DM':
            if (canSendDmToCa(licenceStatus)) {
                return 'dmToCa';
            }

            return null;

        default:

            if (canSendCaToDmRefusal(licenceStatus)) {
                return 'caToDmRefusal';
            }

            if (canSendCaToDm(licenceStatus)) {
                return 'caToDm';
            }

            if (canSendCaToRo(licenceStatus)) {
                return 'caToRo';
            }

            return null;
    }
}

function canSendRoToCa(licenceStatus) {
    const tasks = licenceStatus.tasks;
    const stage = licenceStatus.stage;
    const decisions = licenceStatus.decisions || {};

    if (stage !== 'PROCESSING_RO') {
        return false;
    }

    if (decisions.bassReferralNeeded && tasks.bassAreaCheck === taskStates.DONE) {
        return true;
    }

    if (decisions.curfewAddressRejected) {
        return true;
    }

    if (decisions.optedOut) {
        return true;
    }

    const required = [
        tasks.curfewAddressReview,
        tasks.curfewHours,
        tasks.licenceConditions,
        tasks.riskManagement,
        tasks.victim,
        tasks.reportingInstructions
    ];

    return required.every(it => it === taskStates.DONE);
}

function canSendDmToCa(licenceStatus) {
    const {tasks, stage} = licenceStatus;
    return tasks.approval === taskStates.DONE && stage === 'APPROVAL';
}

function canSendCaToRo(licenceStatus) {
    const {tasks, decisions, stage} = licenceStatus;

    const {eligible, optedOut, bassReferralNeeded, curfewAddressRejected} = decisions;

    if (['PROCESSING_CA', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(stage)) {
        if (bassReferralNeeded) {
            if (licenceStatus.tasks.bassAreaCheck === taskStates.UNSTARTED) {
                return true;
            }
        } else if (tasks.curfewAddressReview === taskStates.UNSTARTED) {
            return true;
        }
    }

    const notToProgress = !eligible || optedOut || curfewAddressRejected;

    if (stage !== 'ELIGIBILITY' || notToProgress) {
        return false;
    }

    const required = [
        tasks.exclusion,
        tasks.crdTime,
        tasks.suitability,
        tasks.optOut,
        tasks.curfewAddress
    ];

    const allTaskComplete = required.every(it => it === taskStates.DONE);

    if (bassReferralNeeded) {
        return allTaskComplete && tasks.bassReferral === taskStates.DONE;
    }

    return allTaskComplete;
}

function canSendCaToDmRefusal(licenceStatus) {

    const {stage, decisions} = licenceStatus;
    const {addressWithdrawn, curfewAddressRejected, finalChecksRefused, bassReferralNeeded} = decisions;
    const bassFailure = isBassFailure(decisions);

    if (['PROCESSING_CA', 'DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(stage)) {

        if (finalChecksRefused) {
            return false;
        }

        if (bassReferralNeeded) {
            return bassFailure;
        }

        return addressWithdrawn;
    }

    if (stage === 'ELIGIBILITY') {
        const {eligible, insufficientTimeStop} = decisions;

        if (!eligible && !insufficientTimeStop) {
            return false;
        }

        return insufficientTimeStop || curfewAddressRejected || bassFailure;
    }

    return false;
}

function isBassFailure(decisions) {
    const {bassAreaNotSuitable, bassAccepted, bassWithdrawn} = decisions;
    return bassWithdrawn || bassAreaNotSuitable || ['Unsuitable', 'Unavailable'].includes(bassAccepted);
}

function canSendCaToDm(licenceStatus) {
    const tasks = licenceStatus.tasks;
    const decisions = licenceStatus.decisions;
    const stage = licenceStatus.stage;

    if (stage === 'MODIFIED_APPROVAL') {
        return true;
    }

    if (stage !== 'PROCESSING_CA') {
        return false;
    }

    if (decisions.insufficientTimeStop) {
        return true;
    }

    const required = getRequiredTasks(decisions, tasks);
    const tasksComplete = required.every(it => it === taskStates.DONE);

    const addressOk = decisions.bassReferralNeeded || decisions.curfewAddressApproved;

    const decisionsOk =
        !decisions.excluded &&
        !decisions.postponed &&
        !decisions.finalChecksRefused &&
        addressOk;

    return tasksComplete && decisionsOk;
}

function getRequiredTasks(decisions, tasks) {

    if (decisions.bassReferralNeeded) {
        return [
            tasks.bassOffer,
            tasks.finalChecks
        ];
    }

    return [
        tasks.finalChecks
    ];
}
