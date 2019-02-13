const {pick, pickBy, pickKey, keys, mapObject, isEmpty} = require('../../utils/functionalHelpers');
const versionInfo = require('../../utils/versionInfo');
const getDmTasks = require('./taskLists/dmTasks');
const {getRoTasksPostApproval, getRoTasks} = require('./taskLists/roTasks');
const {getCaTasksEligibility, getCaTasksFinalChecks, getCaTasksPostApproval} = require('./taskLists/caTasks');

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
    vary: [
        {
            title: 'View current licence',
            label: getVersionLabel,
            action: {type: 'btn', text: 'View', href: getPdfLink, newTab: true},
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
        roTasksPostApproval: getRoTasksPostApproval,
        caTasksEligibility: getCaTasksEligibility,
        caTasksFinalChecks: getCaTasksFinalChecks,
        caTasksPostApproval: getCaTasksPostApproval
    };
    if (!tasksConfig[taskList] && !getTaskListMethod[taskList]) {
        return {taskListView: taskList};
    }

    const filtersForTaskList = keys(pickBy(item => item, {
        licenceUnstarted: stage === 'UNSTARTED',
        licenceVersionExists: !isEmpty(approvedVersionDetails),
        isNewVersion: versionInfo({version, versionDetails, approvedVersionDetails}).isNewVersion
    }));

    const filteredTasks = getTaskListMethod[taskList] ?
        getTaskListMethod[taskList]({decisions, tasks, stage, allowedTransition}) :
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
        if (typeof value === 'string' || typeof value === 'boolean') {
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
