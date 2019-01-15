const {licenceStages} = require('../services/config/licenceStages');
const {taskStates} = require('../services/config/taskStates');

module.exports = {getStatusLabel};

const UNSTARTED_LABEL = 'Not started';

function getStatusLabel(licenceStatus, role) {

    if (!licenceStatus || !licenceStatus.stage || !licenceStatus.decisions || !licenceStatus.tasks) {
        return UNSTARTED_LABEL;
    }

    if (licenceStatus.stage === licenceStages.UNSTARTED) {
        return UNSTARTED_LABEL;
    }

    return statusLabels(licenceStatus, role);
}

function statusLabels(licenceStatus, role) {

    const labels = {
        [licenceStages.ELIGIBILITY]: {
            CA: caEligibilityLabel,
            RO: () => 'Checking eligibility',
            DM: () => 'Checking eligibility'
        },
        [licenceStages.PROCESSING_RO]: {
            CA: roProcessingCaLabel,
            RO: roProcessingLabel,
            DM: () => 'With responsible officer'
        },
        [licenceStages.PROCESSING_CA]: {
            CA: caProcessingLabel,
            RO: caProcessingRoLabel,
            DM: caProcessingDmLabel
        },
        [licenceStages.APPROVAL]: {
            CA: () => 'With decision maker',
            RO: () => 'With decision maker',
            DM: dmProcessingLabel
        },
        [licenceStages.DECIDED]: {
            CA: caDecisionLabel,
            RO: decisionLabel,
            DM: decisionLabel
        },
        [licenceStages.MODIFIED]: {
            CA: postApprovalLabel,
            RO: postApprovalLabel,
            DM: postApprovalLabel
        },
        [licenceStages.MODIFIED_APPROVAL]: {
            CA: postApprovalLabel,
            RO: postApprovalLabel,
            DM: postApprovalLabel
        },
        [licenceStages.VARY]: {
            CA: () => 'Varying licence',
            RO: () => 'Varying licence',
            DM: () => 'Varying licence'
        }
    };

    return labels[licenceStatus.stage][role](licenceStatus);
}

function caEligibilityLabel(licenceStatus) {
    const labels = [
        {decision: 'excluded', label: 'Excluded (Ineligible)'},
        {decision: 'unsuitableResult', label: 'Presumed unsuitable'},
        {decision: 'insufficientTimeContinue', label: 'Not enough time'},
        {decision: 'insufficientTime', label: 'Not enough time - rejected'},
        {decision: 'optedOut', label: 'Opted out'},
        {decision: 'bassReferralNeeded', label: 'Getting address'},
        {decision: 'curfewAddressRejected', label: 'Address rejected'},
        {decision: 'eligible', label: 'Eligible'}
    ];

    return getLabel(labels, licenceStatus) || 'Checking eligibility';
}

function caProcessingLabel(licenceStatus) {

    const bassRouteLabels = [
        {decision: 'bassWithdrawalReason', value: 'offer', label: 'BASS offer withdrawn'},
        {decision: 'bassWithdrawalReason', value: 'request', label: 'BASS request withdrawn'}
    ];

    const addressRouteLabels = [
        {decision: 'curfewAddressWithdrawn', label: 'Address withdrawn'},
        {decision: 'curfewAddressRejected', label: 'Address not suitable'}
    ];

    const commonLabels = [
        {decision: 'finalChecksRefused', label: 'Refused'},
        {decision: 'postponed', label: 'Postponed'},
        {decision: 'excluded', label: 'Excluded (Ineligible)'}];

    const labels =
        licenceStatus.decisions.bassReferralNeeded ? commonLabels.concat(bassRouteLabels) : commonLabels.concat(addressRouteLabels);

    return getLabel(labels, licenceStatus) || 'Review case';
}

function caProcessingRoLabel(licenceStatus) {

    const labels = [
        {decision: 'postponed', label: 'Postponed'}
    ];

    return getLabel(labels, licenceStatus) || 'Submitted to prison case admin';
}

function caProcessingDmLabel(licenceStatus) {

    const labels = [
        {decision: 'postponed', label: 'Postponed'}
    ];

    return getLabel(labels, licenceStatus) || 'Submitted to prison case admin';
}

function roProcessingLabel(licenceStatus) {

    const optOutLabel = getLabel([{decision: 'optedOut', label: 'Opted out'}], licenceStatus);

    if (optOutLabel) {
        return optOutLabel;
    }

    if (licenceStatus.decisions.bassReferralNeeded) {

        if (licenceStatus.tasks.bassAreaCheck === taskStates.UNSTARTED) {
            return 'BASS request';
        }

        if (licenceStatus.decisions.bassAreaNotSuitable) {
            return 'BASS area rejected';
        }

    } else if (licenceStatus.tasks.curfewAddressReview === taskStates.UNSTARTED) {
        return 'Address provided';
    }

    if (anyStarted([
        licenceStatus.tasks.bassAreaCheck,
        licenceStatus.tasks.curfewAddressReview,
        licenceStatus.tasks.curfewHours,
        licenceStatus.tasks.licenceConditions,
        licenceStatus.tasks.riskManagement,
        licenceStatus.tasks.victim,
        licenceStatus.tasks.reportingInstructions])) {
        return 'Assessment ongoing';
    }


    return 'Address provided';
}

function roProcessingCaLabel(licenceStatus) {
    const labels = [
        {decision: 'optedOut', label: 'Opted out'}
    ];

    return getLabel(labels, licenceStatus) || 'With responsible officer';
}

function dmProcessingLabel(licenceStatus) {
    const labels = [
        {decision: 'insufficientTimeStop', label: 'Awaiting refusal'}
    ];

    return getLabel(labels, licenceStatus) || 'Make decision';
}

function caDecisionLabel(licenceStatus) {

    if (licenceStatus.decisions.approved) {
        if (licenceStatus.tasks.createLicence === taskStates.DONE) {
            return 'Licence created';
        }

        return 'Create licence';
    }

    return decisionLabel(licenceStatus);
}

function decisionLabel(licenceStatus) {

    if (licenceStatus.decisions.approved) {
        if (licenceStatus.tasks.createLicence === taskStates.DONE) {
            return 'Licence created';
        }
    }

    const labels = [
        {decision: 'approved', label: 'Approved'},
        {decision: 'refused', label: 'Refused'}
    ];

    return getLabel(labels, licenceStatus) || 'Not complete';
}

function postApprovalLabel(licenceStatus) {

    const labels = [
        {decision: 'refused', label: 'Refused'}
    ];

    return getLabel(labels, licenceStatus) || 'Licence updated';
}

function getLabel(labels, licenceStatus) {
    const found = labels.find(label => {
        const value = label.value || true;
        return licenceStatus.decisions[label.decision] === value;
    });

    return found ? found.label : null;
}

function anyStarted(tasks) {
    return tasks.some(task => {
        return [taskStates.STARTED, taskStates.DONE].includes(task);
    });
}
