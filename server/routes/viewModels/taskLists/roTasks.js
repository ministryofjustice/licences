const riskManagement = require('./tasks/riskManagement');
const curfewHours = require('./tasks/curfewHours');
const additionalConditions = require('./tasks/additionalConditions');
const reportingInstructions = require('./tasks/reportingInstructions');
const curfewAddress = require('./tasks/curfewAddress');
const victimLiaison = require('./tasks/victimLiaison');

module.exports = {
    getRoTasks: ({decisions, tasks}) => {
        const {
            bassReferralNeeded,
            addressUnsuitable,
            curfewAddressRejected,
            addressReviewFailed
        } = decisions;

        const addressRejectedInRiskPhase = curfewAddressRejected && addressUnsuitable;
        const addressRejectedInReviewPhase = curfewAddressRejected && addressReviewFailed;

        return [
            {
                task: 'bassAreaTask',
                visible: bassReferralNeeded
            },
            {
                title: 'Proposed curfew address',
                label: curfewAddress.getLabel({decisions, tasks}),
                action: curfewAddress.getRoAction({decisions, tasks}),
                visible: !bassReferralNeeded && !curfewAddressRejected || addressRejectedInReviewPhase
            },
            {
                title: 'Risk management',
                label: riskManagement.getLabel({decisions, tasks}),
                action: riskManagement.getRoAction({decisions, tasks}),
                visible: !curfewAddressRejected || addressRejectedInRiskPhase
            },
            {
                title: 'Victim liaison',
                label: victimLiaison.getLabel({decisions, tasks}),
                action: victimLiaison.getRoAction({decisions, tasks}),
                visible: !curfewAddressRejected
            },
            {
                title: 'Curfew hours',
                label: curfewHours.getLabel({decisions, tasks}),
                action: curfewHours.getRoAction({decisions, tasks}),
                visible: !curfewAddressRejected
            },
            {
                title: 'Additional conditions',
                label: additionalConditions.getLabel({decisions, tasks}),
                action: additionalConditions.getRoAction({decisions, tasks}),
                visible: !curfewAddressRejected
            },
            {
                title: 'Reporting instructions',
                label: reportingInstructions.getLabel({decisions, tasks}),
                action: reportingInstructions.getRoAction({decisions, tasks}),
                visible: !curfewAddressRejected
            },
            {
                task: 'roSubmitTask',
                visible: true
            }
        ].filter(task => task.visible);
    },

    getRoTasksPostApproval: ({decisions, tasks}) => {
        return [
            {
                title: 'Risk management',
                label: riskManagement.getLabel({decisions, tasks}),
                action: riskManagement.getRoAction({decisions, tasks})
            },
            {
                title: 'Curfew hours',
                label: curfewHours.getLabel({decisions, tasks}),
                action: curfewHours.getRoAction({decisions, tasks})
            },
            {
                title: 'Additional conditions',
                label: additionalConditions.getLabel({decisions, tasks}),
                action: additionalConditions.getRoAction({decisions, tasks})
            },
            {
                title: 'Reporting instructions',
                label: reportingInstructions.getLabel({decisions, tasks}),
                action: reportingInstructions.getRoAction({decisions, tasks})
            }
        ];
    }
};
