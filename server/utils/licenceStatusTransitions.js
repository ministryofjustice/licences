const {taskStates} = require('../models/taskStates');

module.exports = {getAllowedTransitions};

function getAllowedTransitions(licenceStatus, role) {

    if(!licenceStatus) {
        return null;
    }

    switch (role) {
        case 'RO':
            return {
                roToCa: canSendRoToCa(licenceStatus)
            };
        case 'DM':
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

    const requiredTasks = [
        licenceStatus.tasks.curfewAddressReview,
        licenceStatus.tasks.curfewHours,
        licenceStatus.tasks.licenceConditions,
        licenceStatus.tasks.riskManagement,
        licenceStatus.tasks.reportingInstructions
    ];

    return requiredTasks.every(it => it === taskStates.DONE);
}

function canSendDmToCa(licenceStatus) {
    return licenceStatus.tasks.approval === taskStates.DONE;
}

function canSendCaToRo(licenceStatus) {

    const requiredTasks = [
        licenceStatus.tasks.exclusion,
        licenceStatus.tasks.crdTime,
        licenceStatus.tasks.suitability,
        licenceStatus.tasks.optOut,
        licenceStatus.tasks.bassReferral
        // licenceStatus.tasks.curfewAddress
    ];

    return requiredTasks.every(it => it === taskStates.DONE);
}

function canSendCaToDm(licenceStatus) {
    return !(licenceStatus.decisions.postponed ||
        !licenceStatus.decisions.curfewAddressApproved ||
        licenceStatus.decisions.excluded);
}
