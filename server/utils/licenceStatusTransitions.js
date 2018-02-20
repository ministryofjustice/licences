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
                caToDm: canSendCaToDm(licenceStatus)
            };
    }
}

function canSendRoToCa(licenceStatus) {

    const tasks = licenceStatus.tasks;

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
    return licenceStatus.tasks.approval === taskStates.DONE;
}

function canSendCaToRo(licenceStatus) {

    const tasks = licenceStatus.tasks;

    const required = [
        tasks.exclusion,
        tasks.crdTime,
        tasks.suitability,
        tasks.optOut,
        tasks.bassReferral
        // tasks.curfewAddress
    ];

    return required.every(it => it === taskStates.DONE);
}

function canSendCaToDm(licenceStatus) {

    const decisions = licenceStatus.decisions;

    return (!decisions.postponed && !decisions.excluded && decisions.curfewAddressApproved);
}
