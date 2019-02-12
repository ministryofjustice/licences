const {pick, pickBy, pickKey, keys, mapObject, isEmpty} = require('../../utils/functionalHelpers');
const versionInfo = require('../../utils/versionInfo');
const getDmTasks = require('./taskLists/dmTasks');
const {getRoTasksPostApproval, getRoTasks} = require('./taskLists/roTasks');
const postponement = require('./taskLists/tasks/postponement');
const bassOffer = require('./taskLists/tasks/bassOffer');
const curfewAddress = require('./taskLists/tasks/curfewAddress');
const riskManagement = require('./taskLists/tasks/riskManagement');
const victimLiaison = require('./taskLists/tasks/victimLiaison');
const curfewHours = require('./taskLists/tasks/curfewHours');
const additionalConditions = require('./taskLists/tasks/additionalConditions');
const reportingInstructions = require('./taskLists/tasks/reportingInstructions');

const getVersionLabel = ({approvedVersion}) => `Licence version ${approvedVersion}`;
const getNextVersionLabel = ({version}) => `Ready to create version ${version}`;
const getPdfLink = ({approvedVersionDetails}) => `/hdc/pdf/create/${approvedVersionDetails.template}/`;

const taskListsConfig = {
    caTasksEligibility: {
        stages: ['ELIGIBILITY', 'UNSTARTED'],
        role: 'CA'
    },
    caTasksPostApproval: {
        stages: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'],
        role: 'CA'
    },
    caTasksFinalChecks: {
        stages: ['PROCESSING_CA', 'PROCESSING_RO', 'APPROVAL'],
        role: 'CA'
    },
    roTasks: {
        stages: ['PROCESSING_RO', 'PROCESSING_CA', 'APPROVAL', 'ELIGIBILITY'],
        role: 'RO'
    },
    roTasksPostApproval: {
        stages: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'],
        role: 'RO'
    },
    dmTasks: {
        role: 'DM'
    }
};

const tasksConfig = {
    caTasksEligibility: [
        {task: 'eligibilityTask', filters: []},
        {task: 'informOffenderTask', filters: ['eligibilityDone', 'optOutUnstarted', '!optedOut']},
        {task: 'proposedAddressTask', filters: ['eligible']},
        {task: 'caSubmitRefusalTask', filters: ['caToDmRefusal']},
        {task: 'caSubmitBassReviewTask', filters: ['optOutDone', '!optedOut', 'bassReferralNeeded', '!caToDmRefusal']},
        {
            task: 'caSubmitAddressReviewTask',
            filters: ['optOutDone', '!optedOut', '!bassReferralNeeded', '!caToDmRefusal']
        }
    ],
    caTasksFinalChecks: [
        {
            title: 'Proposed curfew address',
            label: curfewAddress.getLabel,
            action: curfewAddress.getCaProcessingAction,
            filters: ['!bassReferralNeeded', '!caToRo']
        },
        {task: 'proposedAddressTask', filters: ['caToRo']},
        {
            title: 'BASS address',
            label: bassOffer.getLabel,
            action: bassOffer.getAction,
            filters: ['bassReferralNeeded']
        },
        {
            title: 'Risk management',
            label: riskManagement.getLabel,
            action: {
                type: 'btn-secondary',
                href: '/hdc/risk/riskManagement/',
                text: 'View/Edit'
            },
            filters: ['addressOrBassChecksDoneOrUnsuitable']
        },
        {
            title: 'Victim liaison',
            label: victimLiaison.getLabel,
            action: {
                type: 'btn-secondary',
                href: '/hdc/victim/victimLiaison/',
                text: 'View/Edit'
            },
            filters: ['addressOrBassChecksDone']
        },
        {
            title: 'Curfew hours',
            label: curfewHours.getLabel,
            action: {
                type: 'btn-secondary',
                href: '/hdc/curfew/curfewHours/',
                text: 'View/Edit'
            },
            filters: ['addressOrBassChecksDone']
        },
        {
            title: 'Additional conditions',
            label: additionalConditions.getLabel,
            action: {
                type: 'btn-secondary',
                href: '/hdc/review/conditions/',
                text: 'View'
            },
            filters: ['addressOrBassChecksDone']
        },
        {
            title: 'Reporting instructions',
            label: reportingInstructions.getLabel,
            action: {
                type: 'btn-secondary',
                href: '/hdc/review/reporting/',
                text: 'View'
            },
            filters: ['addressOrBassChecksDone']
        },
        {task: 'finalChecksTask', filters: ['addressOrBassChecksDone']},
        {
            title: 'Postpone or refuse',
            label: postponement.getLabel,
            action: postponement.getAction,
            filters: ['addressOrBassChecksDone']
        },
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
        {
            title: 'Proposed curfew address',
            label: curfewAddress.getLabel,
            action: curfewAddress.getCaPostApprovalAction,
            filters: ['eligible', '!caToRo', '!bassReferralNeeded']
        },
        {
            title: 'Risk management',
            label: riskManagement.getLabel,
            action: {
                type: 'btn-secondary',
                href: '/hdc/risk/riskManagement/',
                text: 'View/Edit'
            },
            filters: ['eligible', 'addressOrBassOfferedOrUnsuitable']
        },
        {
            title: 'Victim liaison',
            label: victimLiaison.getLabel,
            action: {
                type: 'btn-secondary',
                href: '/hdc/victim/victimLiaison/',
                text: 'View/Edit'
            },
            filters: ['eligible', 'addressOrBassOffered']
        },
        {
            title: 'Curfew hours',
            label: curfewHours.getLabel,
            action: {
                type: 'btn-secondary',
                href: '/hdc/curfew/curfewHours/',
                text: 'View/Edit'
            },
            filters: ['eligible', 'addressOrBassOffered']
        },
        {
            title: 'Additional conditions',
            label: additionalConditions.getLabel,
            action: {
                type: 'btn-secondary',
                href: '/hdc/licenceConditions/standard/',
                text: 'View/Edit'
            },
            filters: ['eligible', 'addressOrBassOffered']
        },
        {
            title: 'Reporting instructions',
            label: reportingInstructions.getLabel,
            action: {
                type: 'btn-secondary',
                href: '/hdc/reporting/reportingInstructions/',
                text: 'View/Edit'
            },
            filters: ['eligible', 'addressOrBassOffered']
        },
        {task: 'finalChecksTask', filters: ['eligible', 'addressOrBassOffered']},
        {
            title: 'Postpone or refuse',
            label: postponement.getLabel,
            action: postponement.getAction,
            filters: ['eligible', 'addressOrBassOffered']
        },
        {task: 'HDCRefusalTask', filters: ['eligible', '!dmRefused']},
        {task: 'caSubmitApprovalTask', filters: ['eligible', 'caToDm']},
        {task: 'caSubmitRefusalTask', filters: ['eligible', 'caToDmRefusal']},
        {task: 'caSubmitBassReviewTask', filters: ['eligible', 'caToRo', 'bassReferralNeeded']},
        {task: 'caSubmitAddressReviewTask', filters: ['eligible', 'caToRo', '!bassReferralNeeded']},
        {
            task: 'createLicenceTask',
            filters: ['eligible', 'addressOrBassOffered', '!caToDm', '!caToDmRefusal', '!caToRo']
        },
        {task: 'informOffenderTask', filters: ['!eligible']}
    ],
    vary: [
        {
            title: 'View current licence',
            label: getVersionLabel,
            action: {type: 'btn', text: 'View', href: getPdfLink},
            filters: ['licenceVersionExists', '!isNewVersion']
        },
        {
            task: 'varyLicenceTask',
            filters: ['licenceUnstarted']
        },
        {
            title: 'Permission for variation',
            action: {type: 'link', text: 'Change', href: '/hdc/vary/evidence/'},
            filters: ['!licenceUnstarted']
        },
        {
            title: 'Curfew address',
            action: {type: 'link', text: 'Change', href: '/hdc/vary/address/'},
            filters: ['!licenceUnstarted']
        },
        {
            title: 'Additional conditions',
            action: {type: 'link', text: 'Change', href: '/hdc/licenceConditions/standard/'},
            filters: ['!licenceUnstarted']
        },
        {
            title: 'Curfew hours',
            action: {type: 'link', text: 'Change', href: '/hdc/curfew/curfewHours/'},
            filters: ['!licenceUnstarted']
        },
        {
            title: 'Reporting instructions',
            action: {type: 'link', text: 'Change', href: '/hdc/vary/reportingAddress/'},
            filters: ['!licenceUnstarted']
        },
        {
            title: 'Create licence',
            label: getNextVersionLabel,
            action: {type: 'btn', text: 'Continue', href: '/hdc/pdf/select/'},
            filters: ['!licenceUnstarted', 'isNewVersion']
        }
    ],
    noTaskList: [
        {
            title: 'No active licence',
            action: {type: 'link', text: 'Return to case list', href: '/caseList/'},
            filters: []
        }
    ]
};

module.exports = (
    role,
    postRelease,
    {decisions, tasks, stage},
    {version, versionDetails, approvedVersion, approvedVersionDetails},
    allowedTransition
) => {
    const taskList = getTaskList(role, stage, postRelease);
    const getTaskListMethod = {
        dmTasks: getDmTasks,
        roTasks: getRoTasks,
        roTasksPostApproval: getRoTasksPostApproval
    };
    if (!tasksConfig[taskList] && !getTaskListMethod[taskList]) {
        return {taskListView: taskList};
    }

    const {
        bassReferralNeeded,
        curfewAddressApproved,
        optedOut,
        eligible,
        dmRefused,
        addressUnsuitable
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
        eligibilityDone: eligibility === 'DONE',
        optOutDone: optOut === 'DONE',
        optOutUnstarted: optOut === 'UNSTARTED',
        addressOrBassChecksDone: curfewAddressApproved || bassChecksDone,
        addressOrBassChecksDoneOrUnsuitable: curfewAddressApproved || bassChecksDone || addressUnsuitable,
        addressOrBassOffered: curfewAddressApproved || bassOfferMade,
        addressOrBassOfferedOrUnsuitable: curfewAddressApproved || bassOfferMade || addressUnsuitable,
        licenceUnstarted: stage === 'UNSTARTED',
        licenceVersionExists: !isEmpty(approvedVersionDetails),
        isNewVersion: versionInfo({version, versionDetails, approvedVersionDetails}).isNewVersion
    }));

    const filteredTasks = getTaskListMethod[taskList] ?
        getTaskListMethod[taskList]({decisions, tasks, stage}) :
        tasksConfig[taskList].filter(filtersMatch(filtersForTaskList));

    return {
        taskListModel: filteredTasks.map(decorateTaskModel(approvedVersion, version, approvedVersionDetails, decisions, tasks))
    };
};

const filtersMatch = filterList => task => task.filters.every(filter => {
    if (filter[0] !== '!') {
        return filterList.includes(filter);
    }
    return !filterList.includes(filter.slice(1));
});

const decorateTaskModel = (approvedVersion, version, approvedVersionDetails, decisions, tasks) => task => {
    const rawConfig = pick(['task', 'title', 'label', 'action'], task);
    const callAnyFunctions = value => {
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'function') {
            return value({approvedVersion, version, approvedVersionDetails, decisions, tasks});
        }
        return mapObject(callAnyFunctions, value);
    };
    return mapObject(callAnyFunctions, rawConfig);
};

function getTaskList(role, stage, postRelease) {
    if (postRelease) {
        return 'vary';
    }

    function roleAndStageMatch(view) {
        if (view.role !== role) {
            return false;
        }
        if (!view.stages) {
            return true;
        }
        return view.stages.includes(stage);
    }

    return pickKey(roleAndStageMatch, taskListsConfig) || 'noTaskList';
}

function getBassDetails({bassReferralNeeded, bassAccepted, bassWithdrawn}, {bassAreaCheck, bassOffer}) {
    const bassExcluded = ['Unavailable', 'Unsuitable'].includes(bassAccepted);
    const bassAreaChecked = bassAreaCheck === 'DONE';

    return {
        bassChecksDone: bassReferralNeeded && bassAreaChecked && !bassWithdrawn && !bassExcluded,
        bassOfferMade: bassReferralNeeded && bassOffer === 'DONE' && !bassWithdrawn && !bassExcluded
    };
}
