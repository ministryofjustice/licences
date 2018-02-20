const {licenceStages} = require('../models/licenceStages');
const {taskStates} = require('../models/taskStates');

module.exports = {getStatusLabel};

const UNSTARTED_LABEL = 'Not started';

function getStatusLabel(licenceStatus, role) {

    if(!licenceStatus || !licenceStatus.stage || !licenceStatus.decisions || !licenceStatus.tasks) {
        return UNSTARTED_LABEL;
    }

    if(licenceStatus.stage === licenceStages.UNSTARTED) {
        return UNSTARTED_LABEL;
    }

    return statusLabels(licenceStatus, role);
}

function statusLabels(licenceStatus, role) {

    const labels = {
        [licenceStages.ELIGIBILITY]: {
            CA: caEligibilityLabel,
            RO: () => 'Eligibility checks ongoing',
            DM: () => 'Eligibility checks ongoing'
        },
        [licenceStages.PROCESSING_RO]: {
            CA: () => 'Submitted to RO',
            RO: roProcessingLabel,
            DM: () => 'Submitted to RO'
        },
        [licenceStages.PROCESSING_CA]: {
            CA: caProcessingLabel,
            RO: () => 'Submitted to PCA',
            DM: () => 'Submitted to PCA'
        },
        [licenceStages.APPROVAL]: {
            CA: () => 'Submitted to DM',
            RO: () => 'Submitted to DM',
            DM: () => 'Awaiting Decision'
        },
        [licenceStages.DECIDED]: {
            CA: decisionLabel,
            RO: decisionLabel,
            DM: decisionLabel
        }
    };

    return labels[licenceStatus.stage][role](licenceStatus);
}

function caEligibilityLabel(licenceStatus) {

    const labels = [
        {decision: 'excluded', label: 'Excluded (Ineligible)'},
        {decision: 'insufficientTime', label: 'Excluded (Insufficient time)'},
        {decision: 'unsuitable', label: 'Presumed unsuitable'},
        {decision: 'immigrationCheckNeeded', label: 'Immigration status check requested'},
        {decision: 'optedOut', label: 'Opted out'},
        {decision: 'bassReferralNeeded', label: 'Address/Opt-out form sent'}
    ];

    return getLabel(labels, licenceStatus) || 'Eligibility checks ongoing';
}

function caProcessingLabel(licenceStatus) {

    const labels = [
        {decision: 'excluded', label: 'Excluded (Ineligible)'},
        {decision: 'curfewAddressApproved', value: false, label: 'Address not suitable'},
        {decision: 'postponed', label: 'Postponed'}
    ];

    return getLabel(labels, licenceStatus) || 'Final Checks';
}

function roProcessingLabel(licenceStatus) {
    if (anyStarted([
            licenceStatus.tasks.curfewAddressReview,
            licenceStatus.tasks.curfewHours,
            licenceStatus.tasks.licenceConditions,
            licenceStatus.tasks.riskManagement,
            licenceStatus.tasks.reportingInstructions])) {
        return 'Assessment ongoing';
    }

    return 'Awaiting Assessment';
}

function decisionLabel(licenceStatus) {

    const labels = [
        {decision: 'approved', label: 'Approved'},
        {decision: 'refused', label: 'Refused'}
    ];

    return getLabel(labels, licenceStatus) || '';
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
