const {pick, pickBy, keys, mapObject, isEmpty} = require('../../utils/functionalHelpers');

const getVersionLabel = ({approvedVersion}) => `Licence version ${approvedVersion}`;
const getNextVersionLabel = ({version}) => `Ready to create version ${version}`;
const getPdfLink = ({approvedVersionDetails}) => `/hdc/pdf/create/${approvedVersionDetails.template}/`;

const tasksData = {
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
        {task: 'riskManagementTask', filters: ['addressOrBassChecksDoneOrUnsuitable']},
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
        {task: 'riskManagementTask', filters: ['eligible', 'addressOrBassOfferedOrUnsuitable']},
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
        {task: 'createLicenceTask', filters: ['eligible', 'addressOrBassOffered', '!caToDm', '!caToDmRefusal', '!caToRo']},
        {task: 'informOffenderTask', filters: ['!eligible']}
    ],
    roTasks: [
        {task: 'bassAreaTask', filters: ['bassReferralNeeded']},
        {task: 'curfewAddressTask', filters: ['!addressRejectedInRiskTask', '!bassReferralNeeded']},
        {task: 'riskManagementTask', filters: ['!addressRejectedInReviewTask']},
        {task: 'victimLiaisonTask', filters: ['!curfewAddressRejected']},
        {task: 'curfewHoursTask', filters: ['!curfewAddressRejected']},
        {task: 'additionalConditionsTask', filters: ['!curfewAddressRejected']},
        {task: 'reportingInstructionsTask', filters: ['!curfewAddressRejected']},
        {task: 'roSubmitTask', filters: []}
    ],
    vary: [
        {
            filters: ['licenceVersionExists', '!licenceVaried'],
            title: 'View current licence',
            btn: {text: 'View', link: getPdfLink},
            label: getVersionLabel
        },
        {task: 'varyLicenceTask', filters: ['licenceUnstarted']},
        {filters: ['!licenceUnstarted'], title: 'Permission for variation', link: '/hdc/vary/evidence/'},
        {filters: ['!licenceUnstarted'], title: 'Curfew address', link: '/hdc/vary/address/'},
        {filters: ['!licenceUnstarted'], title: 'Additional conditions', link: '/hdc/licenceConditions/standard/'},
        {filters: ['!licenceUnstarted'], title: 'Curfew hours', link: '/hdc/curfew/curfewHours/'},
        {filters: ['!licenceUnstarted'], title: 'Reporting instructions', link: '/hdc/vary/reportingAddress/'},
        {
            filters: ['!licenceUnstarted', 'licenceVaried'],
            title: 'Create licence',
            btn: {text: 'Continue', link: '/hdc/pdf/select/'},
            label: getNextVersionLabel
        }
    ]
};

module.exports = (
    taskList, {decisions, tasks, stage}, {version, approvedVersion, approvedVersionDetails}, allowedTransition
) => {

    if (!tasksData[taskList]) {
        return null;
    }

    const {
        bassReferralNeeded,
        curfewAddressApproved,
        optedOut,
        eligible,
        dmRefused,
        curfewAddressRejected,
        addressUnsuitable,
        addressReviewFailed
    } = decisions;

    const {
        eligibility,
        optOut
    } = tasks;

    const {bassChecksDone, bassOfferMade} = getBassDetails(decisions, tasks);

    const filtersForTaskList = keys(pickBy(item => item, {
        bassReferralNeeded,
        optedOut,
        eligible,
        [allowedTransition]: allowedTransition,
        dmRefused,
        curfewAddressRejected,
        eligibilityDone: eligibility === 'DONE',
        optOutDone: optOut === 'DONE',
        optOutUnstarted: optOut === 'UNSTARTED',
        addressOrBassChecksDone: curfewAddressApproved || bassChecksDone,
        addressOrBassChecksDoneOrUnsuitable: curfewAddressApproved || bassChecksDone || addressUnsuitable,
        addressOrBassOffered: curfewAddressApproved || bassOfferMade,
        addressRejectedInReviewTask: addressReviewFailed,
        addressRejectedInRiskTask: addressUnsuitable,
        addressOrBassOfferedOrUnsuitable: curfewAddressApproved || bassOfferMade || addressUnsuitable,
        licenceUnstarted: stage === 'UNSTARTED',
        licenceVersionExists: !isEmpty(approvedVersionDetails),
        licenceVaried: isEmpty(approvedVersionDetails) || version > approvedVersion
    }));

    return tasksData[taskList]
        .filter(task => task.filters.every(filter => {
            if (filter[0] !== '!') {
                return filtersForTaskList.includes(filter);
            }
            return !filtersForTaskList.includes(filter.slice(1));
        }))
        .map(task => {
            const rawConfig = pick(['task', 'title', 'link', 'btn', 'label'], task);
            const callAnyFunctions = value => {
                if (typeof value === 'string') {
                    return value;
                }
                if (typeof value === 'function') {
                    return value({approvedVersion, version, approvedVersionDetails});
                }
                return mapObject(callAnyFunctions, value);
            };
            return mapObject(callAnyFunctions, rawConfig);
        });
};

function getBassDetails({bassReferralNeeded, bassAccepted, bassWithdrawn}, {bassAreaCheck, bassOffer}) {
    const bassExcluded = ['Unavailable', 'Unsuitable'].includes(bassAccepted);
    const bassAreaChecked = bassAreaCheck === 'DONE';

    return {
        bassChecksDone: bassReferralNeeded && bassAreaChecked && !bassWithdrawn && !bassExcluded,
        bassOfferMade: bassReferralNeeded && bassOffer === 'DONE' && !bassWithdrawn && !bassExcluded
    };
}
