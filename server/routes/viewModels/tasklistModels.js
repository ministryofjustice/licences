const {pick, pickBy, keys} = require('../../utils/functionalHelpers');
const tasks = [
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
    {task: 'caSubmitApprovalTask', filters: ['notOptedOut', '!caToDmRefusal', '!caToRo']},
    {task: 'caSubmitRefusalTask', filters: ['notOptedOut', 'caToDmRefusal']},
    {task: 'caSubmitAddressReviewTask', filters: ['notOptedOut', 'caToRo', '!bassReferralNeeded']},
    {task: 'caSubmitBassReviewTask', filters: ['notOptedOut', 'caToRo', 'bassReferralNeeded']}
];


module.exports = (tasklist, decisions, taskStatus, allowedTransition) => {

    if (tasklist !== 'caTasksFinalChecks') {
        return null;
    }

    const {bassReferralNeeded, curfewAddressApproved, bassWithdrawn, optedOut, bassAccepted} = decisions;
    const {bassAreaCheck} = taskStatus;

    const filtersForTasklist = keys(pickBy(item => item, {
        bassReferralNeeded,
        addressOrBassChecksDone: curfewAddressApproved ||
            (bassReferralNeeded && bassAreaCheck === 'DONE' && !bassWithdrawn && !['Unavailable', 'Unsuitable'].includes(bassAccepted)),
        notOptedOut: !optedOut,
        [allowedTransition]: allowedTransition
    }));

    return tasks
        .filter(task => task.filters.every(filter => {
            if (filter[0] !== '!') {
                return filtersForTasklist.includes(filter);
            }
            return !filtersForTasklist.includes(filter.slice(1));
        }))
        .map(task => pick(['task'], task));
};

