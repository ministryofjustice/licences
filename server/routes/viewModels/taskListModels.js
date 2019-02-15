const {pickKey} = require('../../utils/functionalHelpers');
const getDmTasks = require('./taskLists/dmTasks');
const {getRoTasksPostApproval, getRoTasks} = require('./taskLists/roTasks');
const {getCaTasksEligibility, getCaTasksFinalChecks, getCaTasksPostApproval} = require('./taskLists/caTasks');
const getVaryTasks = require('./taskLists/varyTasks');

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

module.exports = (
    role,
    postRelease,
    {decisions, tasks, stage},
    {version, versionDetails, approvedVersion = {}, approvedVersionDetails = {}} = {},
    allowedTransition
) => {
    const taskList = getTaskList(role, stage, postRelease);

    const getTaskListTasksMethod = {
        dmTasks: getDmTasks,
        roTasks: getRoTasks,
        roTasksPostApproval: getRoTasksPostApproval,
        caTasksEligibility: getCaTasksEligibility,
        caTasksFinalChecks: getCaTasksFinalChecks,
        caTasksPostApproval: getCaTasksPostApproval(stage),
        vary: getVaryTasks({version, versionDetails, approvedVersion, approvedVersionDetails})
    };

    if (!getTaskListTasksMethod[taskList]) {
        return [
            {
                title: 'No active licence',
                action: {type: 'link', text: 'Return to case list', href: '/caseList/'}
            }
        ];
    }

    return getTaskListTasksMethod[taskList]({decisions, tasks, stage, allowedTransition});
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
