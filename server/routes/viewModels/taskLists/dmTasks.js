const postponement = require('./tasks/postponement');
const bassOffer = require('./tasks/bassOffer');
const curfewAddress = require('./tasks/curfewAddress');
const riskManagement = require('./tasks/riskManagement');
const victimLiaison = require('./tasks/victimLiaison');
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
            {
                title: 'Proposed curfew address',
                label: curfewAddress.getLabel({decisions, tasks}),
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/review/address/',
                    text: 'View'
                }
            },
            {
                title: 'Return to prison case admin',
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/send/return/',
                    text: 'Return to prison case admin'
                }
            },
            {task: 'refusalTask'}
        ];
    }

    return [
        {
            title: 'BASS address',
            label: bassOffer.getLabel({decisions, tasks}),
            action: {
                type: 'btn-secondary',
                href: '/hdc/review/bassOffer/',
                text: 'View'
            }
        },
        {
            title: 'Proposed curfew address',
            label: curfewAddress.getLabel({decisions, tasks}),
            action: {
                type: 'btn-secondary',
                href: '/hdc/review/address/',
                text: 'View'
            }
        },
        {
            title: 'Risk management',
            label: riskManagement.getLabel({decisions, tasks}),
            action: {
                type: 'btn-secondary',
                href: '/hdc/review/risk/',
                text: 'View'
            }
        },
        {
            title: 'Victim liaison',
            label: victimLiaison.getLabel({decisions, tasks}),
            action: {
                type: 'btn-secondary',
                href: '/hdc/review/victimLiaison/',
                text: 'View'
            }
        },
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
        if (task.title === 'BASS address') {
            return bassReferralNeeded;
        }

        if (task.title === 'Proposed curfew address') {
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
