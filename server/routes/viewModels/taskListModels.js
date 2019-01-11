const {pick, pickBy, keys} = require('../../utils/functionalHelpers');

const tasks = {
    caTasksEligibility: [
        {task: 'eligibilityTask', filters: []},
        {task: 'informOffenderTask', filters: ['eligibilityDone', 'optOutUnstarted', '!optedOut']},
        {task: 'proposedAddressTask', filters: ['eligible']},
        {task: 'caSubmitRefusalTask', filters: ['caToDmRefusal']},
        {task: 'caSubmitBassReviewTask', filters: ['optOutDone', '!optedOut', 'bassReferralNeeded']},
        {task: 'caSubmitAddressReviewTask', filters: ['optOutDone', '!optedOut', '!bassReferralNeeded']}
    ],
    caTasksFinalChecks: [
        {task: 'curfewAddressTask', filters: ['!bassReferralNeeded']},
        {task: 'bassOfferTask', filters: ['bassReferralNeeded']},
        {task: 'riskManagementTask', filters: ['addressOrBassChecksDone']},
        {task: 'victimLiaisonTask', filters: ['addressOrBassChecksDone']},
        {task: 'curfewHoursTask', filters: ['addressOrBassChecksDone']},
        {task: 'additionalConditionsTask', filters: ['addressOrBassChecksDone']},
        {task: 'reportingInstructionsTask', filters: ['addressOrBassChecksDone']},
        {task: 'finalChecksTask', filters: ['addressOrBassChecksDone']},
        {task: 'postponementTask', filters: ['addressOrBassChecksDone']},
        {task: 'HDCRefusalTask', filters: []},
        {task: 'caSubmitApprovalTask', filters: ['!optedOut', '!caToDmRefusal', '!caToRo']},
        {task: 'caSubmitRefusalTask', filters: ['!optedOut', 'caToDmRefusal']},
        {task: 'caSubmitAddressReviewTask', filters: ['!optedOut', 'caToRo', '!bassReferralNeeded']},
        {task: 'caSubmitBassReviewTask', filters: ['!optedOut', 'caToRo', 'bassReferralNeeded']}
    ],
    caTasksPostApproval: [
        {task: 'eligibilitySummaryTask', filters: ['addressOrBassOffered']},
        {task: 'proposedAddressTask', filters: ['eligible', 'caToRo']},
        {task: 'bassAddressTask', filters: ['eligible', '!caToRo', 'bassReferralNeeded']},
        {task: 'curfewAddressTask', filters: ['eligible', '!caToRo', '!bassReferralNeeded']},
        {task: 'riskManagementTask', filters: ['eligible', 'addressOrBassOffered']},
        {task: 'victimLiaisonTask', filters: ['eligible', 'addressOrBassOffered']},
        {task: 'curfewHoursTask', filters: ['eligible', 'addressOrBassOffered']},
        {task: 'additionalConditionsTask', filters: ['eligible', 'addressOrBassOffered']},
        {task: 'reportingInstructionsTask', filters: ['eligible', 'addressOrBassOffered']},
        {task: 'finalChecksTask', filters: ['eligible', 'addressOrBassOffered']},
        {task: 'postponementTask', filters: ['eligible', 'addressOrBassOffered']},
        {task: 'HDCRefusalTask', filters: ['eligible', '!dmRefused']},
        {task: 'caSubmitApprovalTask', filters: ['eligible', 'caToDm']},
        {task: 'caSubmitRefusalTask', filters: ['eligible', 'caToDmRefusal']},
        {task: 'caSubmitBassReviewTask', filters: ['eligible', 'caToRo', 'bassReferralNeeded']},
        {task: 'caSubmitAddressReviewTask', filters: ['eligible', 'caToRo', '!bassReferralNeeded']},
        {task: 'createLicenceTask', filters: ['eligible', '!caToDm', '!caToDmRefusal', '!caToRo']},
        {task: 'informOffenderTask', filters: ['!eligible']}
    ]
};

module.exports = (taskList, decisions, taskStatus, allowedTransition) => {

    if (!tasks[taskList]) {
        return null;
    }

    const {
        bassReferralNeeded,
        curfewAddressApproved,
        optedOut,
        eligible,
        dmRefused
    } = decisions;

    const {
        eligibility,
        optOut
    } = taskStatus;

    const {bassChecksDone, bassOfferMade} = getBassDetails(decisions, taskStatus);

    const filtersForTaskList = keys(pickBy(item => item, {
        bassReferralNeeded,
        optedOut,
        eligible,
        [allowedTransition]: allowedTransition,
        dmRefused,
        eligibilityDone: eligibility === 'DONE',
        optOutDone: optOut === 'DONE',
        optOutUnstarted: optOut === 'UNSTARTED',
        addressOrBassChecksDone: curfewAddressApproved || bassChecksDone,
        addressOrBassOffered: curfewAddressApproved || bassOfferMade
    }));

    return tasks[taskList]
        .filter(task => task.filters.every(filter => {
            if (filter[0] !== '!') {
                return filtersForTaskList.includes(filter);
            }
            return !filtersForTaskList.includes(filter.slice(1));
        }))
        .map(task => pick(['task'], task));
};

function getBassDetails({bassReferralNeeded, bassAccepted, bassWithdrawn}, {bassAreaCheck, bassOffer}) {
    const bassExcluded = ['Unavailable', 'Unsuitable'].includes(bassAccepted);
    const bassAreaChecked = bassAreaCheck === 'DONE';

    return {
        bassChecksDone: bassReferralNeeded && bassAreaChecked && !bassWithdrawn && !bassExcluded,
        bassOfferMade: bassReferralNeeded && bassOffer === 'DONE' && !bassWithdrawn && !bassExcluded
    };
}

