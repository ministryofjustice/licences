const {licenceStages} = require('../models/licenceStages');
const {taskStates} = require('../models/taskStates');

module.exports = {getStatusLabel};


function getStatusLabel(licenceStatus, role) {

    if(!licenceStatus || !licenceStatus.stage || !licenceStatus.decisions || !licenceStatus.tasks) {
        return 'Not started';
    }

    const statusLabelMethod = {
        CA: caStatusLabels,
        RO: roStatusLabels,
        DM: dmStatusLabels
    };

    return statusLabelMethod[role](licenceStatus);
}

function caStatusLabels(licenceStatus) {
    switch (licenceStatus.stage) {
        case licenceStages.ELIGIBILITY:
            return caEligibilityLabel(licenceStatus);
        case licenceStages.PROCESSING_RO:
            return 'Submitted to RO';
        case licenceStages.PROCESSING_CA:
            return caProcessingLabel(licenceStatus);
        case licenceStages.APPROVAL:
            return 'Submitted to DM';
        case licenceStages.DECIDED:
            return decisionLabel(licenceStatus);
    }
}

function roStatusLabels(licenceStatus) {
    switch (licenceStatus.stage) {
        case licenceStages.ELIGIBILITY:
            return 'Eligibility checks ongoing';
        case licenceStages.PROCESSING_RO:
            return roProcessingLabel(licenceStatus);
        case licenceStages.PROCESSING_CA:
            return 'Submitted to PCA';
        case licenceStages.APPROVAL:
            return 'Submitted to DM';
        case licenceStages.DECIDED:
            return decisionLabel(licenceStatus);
    }
}

function dmStatusLabels(licenceStatus) {
    switch (licenceStatus.stage) {
        case licenceStages.ELIGIBILITY:
            return 'Eligibility checks ongoing';
        case licenceStages.PROCESSING_RO:
            return 'Submitted to RO';
        case licenceStages.PROCESSING_CA:
            return 'Submitted to PCA';
        case licenceStages.APPROVAL:
            return 'Awaiting Decision';
        case licenceStages.DECIDED:
            return decisionLabel(licenceStatus);
    }
}

function caEligibilityLabel(licenceStatus) {
    if (licenceStatus.decisions.excluded) {
        return 'Excluded (Ineligible)';
    } else if (licenceStatus.decisions.insufficientTime) {
        return 'Excluded (Insufficient time)';
    } else if (licenceStatus.decisions.unsuitable) {
        return 'Presumed unsuitable';
    } else if (licenceStatus.decisions.immigrationCheckNeeded) {
        return 'Immigration status check requested';
    } else if (licenceStatus.decisions.optedOut) {
        return 'Opted out';
    } else if (licenceStatus.decisions.bassReferralNeeded) {
        return 'Address/Opt-out form sent';
    } else {
        return 'Eligibility checks ongoing';
    }
}

function caProcessingLabel(licenceStatus) {
    if (licenceStatus.decisions.excluded) {
        return 'Excluded (Ineligible)';
    } else if (licenceStatus.decisions.curfewAddressApproved === false) {
        return 'Address not suitable';
    } else if (licenceStatus.decisions.postponed) {
        return 'Postponed';
    } else {
        return 'Final Checks';
    }
}

function roProcessingLabel(licenceStatus) {
    if (anyStarted([
            licenceStatus.tasks.curfewAddressReview,
            licenceStatus.tasks.curfewHours,
            licenceStatus.tasks.licenceConditions,
            licenceStatus.tasks.riskManagement,
            licenceStatus.tasks.reportingInstructions])) {
        return 'Assessment ongoing';
    } else {
        return 'Awaiting Assessment';
    }
}

function decisionLabel(licenceStatus) {
    if (licenceStatus.decisions.approved) {
        return 'Approved';
    } else if (licenceStatus.decisions.refused) {
        return 'Refused';
    } else {
        return '';
    }
}

function anyStarted(tasks) {
    return tasks.some(task => {
       return [taskStates.STARTED, taskStates.DONE].includes(task);
    });
}
