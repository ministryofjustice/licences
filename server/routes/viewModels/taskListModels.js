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
    ]
};

module.exports = (taskList, decisions, taskStatus, allowedTransition) => {

    if (!tasks[taskList]) {
        return null;
    }

    const {bassReferralNeeded, curfewAddressApproved, bassWithdrawn, optedOut, bassAccepted, eligible} = decisions;
    const {bassAreaCheck, eligibility, optOut} = taskStatus;

    const filtersForTaskList = keys(pickBy(item => item, {
        bassReferralNeeded,
        optedOut,
        eligible,
        [allowedTransition]: allowedTransition,
        eligibilityDone: eligibility === 'DONE',
        optOutDone: optOut === 'DONE',
        optOutUnstarted: optOut === 'UNSTARTED',
        addressOrBassChecksDone: curfewAddressApproved ||
            (bassReferralNeeded && bassAreaCheck === 'DONE' && !bassWithdrawn && !['Unavailable', 'Unsuitable'].includes(bassAccepted))
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

