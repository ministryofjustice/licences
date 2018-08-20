const {taskStates} = require('../models/taskStates');
const {roles} = require('../models/roles');

module.exports = {getAllowedTransition};

function getAllowedTransition(licenceStatus, role) {

    if (!licenceStatus) {
        return null;
    }

    switch (role) {


        case roles.RO:
            if (canSendRoToCa(licenceStatus)) {
                return 'roToCa';
            }

            return null;

        case roles.DM:
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

    if (decisions.curfewAddressApproved === 'rejected') {
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

    const addressReviewNeeded = stage === 'PROCESSING_CA' && tasks.curfewAddressReview === 'UNSTARTED';

    if (addressReviewNeeded) {
        return true;
    }

    const {eligible, optedOut, bassReferralNeeded, curfewAddressApproved} = decisions;

    const notToProgress = !eligible || optedOut || curfewAddressApproved === 'rejected';

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

    if (stage === 'PROCESSING_CA') {
        return decisions.curfewAddressApproved === 'withdrawn';
    }

    if (stage === 'ELIGIBILITY') {
        const {eligible, insufficientTimeStop, curfewAddressApproved} = decisions;

        if (!eligible && !insufficientTimeStop) {
            return false;
        }

        return insufficientTimeStop || curfewAddressApproved === 'rejected';
    }

    return false;
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

    const required = [
        tasks.finalChecks
    ];

    const tasksComplete = required.every(it => it === taskStates.DONE);

    const decisionsOk =
        !decisions.excluded &&
        !decisions.postponed &&
        !decisions.finalChecksRefused &&
        // todo should it be possible to send to DM if serious offence / on remand?
        // decisions.finalCheckPass &&
        decisions.curfewAddressApproved === 'approved';

    return tasksComplete && decisionsOk;
}
