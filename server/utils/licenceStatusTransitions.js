const {taskStates} = require('../models/taskStates');
const {roles} = require('../models/roles');

module.exports = {getAllowedTransitions};

function getAllowedTransitions(licenceStatus, role) {

    if (!licenceStatus) {
        return null;
    }

    switch (role) {
        case roles.RO:
            return {
                roToCa: canSendRoToCa(licenceStatus)
            };
        case roles.DM:
            return {
                dmToCa: canSendDmToCa(licenceStatus)
            };
        default:
            return {
                caToRo: canSendCaToRo(licenceStatus),
                caToDm: canSendCaToDm(licenceStatus),
                caToDmRefusal: caToDmRefusal(licenceStatus)
            };
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

    const required = [
        tasks.exclusion,
        tasks.crdTime,
        tasks.suitability,
        tasks.optOut,
        tasks.curfewAddress
    ];

    if (stage !== 'ELIGIBILITY') {
        return false;
    }

    const allTaskComplete = required.every(it => it === taskStates.DONE);

    if (decisions.optedOut) {
        return false;
    }

    if (decisions.bassReferralNeeded) {
        return allTaskComplete && tasks.bassReferral == taskStates.DONE;
    }

    return allTaskComplete;
}

function caToDmRefusal(licenceStatus) {
    const stage = licenceStatus.stage;
    const decisions = licenceStatus.decisions;

    if (stage === 'PROCESSING_CA') {
        return decisions.curfewAddressApproved === 'withdrawn';
    }

    if (stage !== 'ELIGIBILITY') {
        return false;
    }

    return decisions.insufficientTimeStop;
}

function canSendCaToDm(licenceStatus) {
    const tasks = licenceStatus.tasks;
    const decisions = licenceStatus.decisions;
    const stage = licenceStatus.stage;

    if (stage !== 'PROCESSING_CA' ) {
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
