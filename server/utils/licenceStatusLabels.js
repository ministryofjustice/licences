const {licenceStages} = require('../models/licenceStages');
const {taskStates} = require('../models/taskStates');

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
            CA: () => 'Submitted to DM',
            RO: () => 'Submitted to DM',
            DM: dmProcessingLabel
        },
        [licenceStages.DECIDED]: {
            CA: decisionLabel,
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
        }
    };

    return labels[licenceStatus.stage][role](licenceStatus);
}

function caEligibilityLabel(licenceStatus) {

    const labels = [
        {decision: 'excluded', label: 'Excluded (Ineligible)'},
        {decision: 'unsuitableResult', label: 'Presumed unsuitable'},
        {decision: 'insufficientTime', label: 'Not enough time'},
        {decision: 'optedOut', label: 'Opted out'},
        {decision: 'bassReferralNeeded', label: 'Getting address'},
        {decision: 'curfewAddressApproved', value: 'rejected', label: 'Address rejected'},
        {decision: 'eligible', label: 'Eligible'}
    ];

    return getLabel(labels, licenceStatus) || 'Checking eligibility';
}

function caProcessingLabel(licenceStatus) {

    const labels = [
        {decision: 'finalChecksRefused', label: 'Refused'},
        {decision: 'postponed', label: 'Postponed'},
        {decision: 'excluded', label: 'Excluded (Ineligible)'},
        {decision: 'curfewAddressApproved', value: 'rejected', label: 'Address not suitable'},
        {decision: 'curfewAddressApproved', value: 'withdrawn', label: 'Address withdrawn'}
    ];

    return getLabel(labels, licenceStatus) || 'Reviewing case';
}

function caProcessingRoLabel(licenceStatus) {

    const labels = [
        {decision: 'postponed', label: 'Postponed'}
    ];

    return getLabel(labels, licenceStatus) || 'Submitted to PCA';
}

function caProcessingDmLabel(licenceStatus) {

    const labels = [
        {decision: 'postponed', label: 'Postponed'}
    ];

    return getLabel(labels, licenceStatus) || 'Submitted to PCA';
}

function roProcessingLabel(licenceStatus) {

    const optOutLabel = getLabel([{decision: 'optedOut', label: 'Opted out'}], licenceStatus);

    if (optOutLabel) {
        return optOutLabel;
    }

    if (licenceStatus.tasks.curfewAddressReview === taskStates.UNSTARTED) {
        return 'Ready to check';
    }

    if (anyStarted([
            licenceStatus.tasks.curfewAddressReview,
            licenceStatus.tasks.curfewHours,
            licenceStatus.tasks.licenceConditions,
            licenceStatus.tasks.riskManagement,
            licenceStatus.tasks.reportingInstructions])) {
        return 'Assessment ongoing';
    }

    return 'Ready to check';
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

    return getLabel(labels, licenceStatus) || 'Awaiting decision';
}

function decisionLabel(licenceStatus) {

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

    return getLabel(labels, licenceStatus) || 'Modified';
}

function getLabel(labels, licenceStatus) {
    const found = labels.find(label => {
        const value = 'value' in label ? label.value : true;
        return licenceStatus.decisions[label.decision] === value;
    });

    return found ? found.label : null;
}

function anyStarted(tasks) {
    return tasks.some(task => {
        return [taskStates.STARTED, taskStates.DONE].includes(task);
    });
}
