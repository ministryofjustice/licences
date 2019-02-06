const postponement = require('./tasks/postponement');
const {getStatusLabel} = require('../../../utils/licenceStatusLabels');

module.exports = ({decisions, tasks, stage}) => {
    const {
        insufficientTimeStop,
        addressWithdrawn,
        curfewAddressRejected,
        bassReferralNeeded,
        confiscationOrder
    } = decisions;

    if (insufficientTimeStop) {
        return [
            {task: 'eligibilitySummaryTask'},
            {task: 'refusalTask'}
        ];
    }

    if (addressWithdrawn || curfewAddressRejected) {
        return [
            {task: 'eligibilitySummaryTask'},
            {task: 'curfewAddressTask'},
            {task: 'returnToCaTask'},
            {task: 'refusalTask'}
        ];
    }

    return [
        {task: 'bassOfferTask'},
        {task: 'curfewAddressTask'},
        {task: 'riskManagementTask'},
        {task: 'victimLiaisonTask'},
        {task: 'curfewHoursTask'},
        {task: 'additionalConditionsTask'},
        {task: 'reportingInstructionsTask'},
        {task: 'finalChecksTask'},
        {
            title: 'Postpone',
            label: postponement.getLabel({decisions}),
            action: postponement.getAction({decisions})
        },
        {
            title: 'Return to prison case admin',
            action: {
                type: 'btn-secondary',
                href: '/hdc/send/return/',
                text: 'Return to prison case admin'
            }
        },
        {
            title: 'Final decision',
            label: getDecisionLabel({decisions, tasks, stage}),
            action: {
                type: 'btn',
                href: '/hdc/approval/release/',
                text: 'Continue'
            }
        }
    ].filter(task => {
        if (task.task === 'bassOfferTask') {
            return bassReferralNeeded;
        }

        if (task.task === 'curfewAddressTask') {
            return !bassReferralNeeded;
        }

        if (task.title === 'Postpone') {
            return confiscationOrder;
        }

        return true;
    });
};

function getDecisionLabel({decisions, tasks, stage}) {
    const {refused, refusalReason} = decisions;
    const statusLabel = getStatusLabel({decisions, tasks, stage}, 'DM');

    if (refused && refusalReason) {
        return `${statusLabel} : ${refusalReason}`;
    }
    return statusLabel;
}
