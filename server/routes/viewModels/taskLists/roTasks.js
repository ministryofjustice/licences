const riskManagement = require('./tasks/riskManagement');
const curfewHours = require('./tasks/curfewHours');
const additionalConditions = require('./tasks/additionalConditions');
const reportingInstructions = require('./tasks/reportingInstructions');
const curfewAddress = require('./tasks/curfewAddress');
const victimLiaison = require('./tasks/victimLiaison');

module.exports = {
    getRoTasks: ({decisions}) => {
        const {
            bassReferralNeeded,
            addressUnsuitable,
            curfewAddressRejected,
            addressReviewFailed
        } = decisions;

        const addressRejectedInRiskPhase = curfewAddressRejected && addressUnsuitable;
        const addressRejectedInReviewPhase = curfewAddressRejected && addressReviewFailed;

        return [
            {task: 'bassAreaTask'},
            {
                title: 'Proposed curfew address',
                label: curfewAddress.getLabel,
                action: curfewAddress.getRoAction
            },
            {
                title: 'Risk management',
                label: riskManagement.getLabel,
                action: riskManagement.getRoAction
            },
            {
                title: 'Victim liaison',
                label: victimLiaison.getLabel,
                action: victimLiaison.getRoAction
            },
            {
                title: 'Curfew hours',
                label: curfewHours.getLabel,
                action: curfewHours.getRoAction
            },
            {
                title: 'Additional conditions',
                label: additionalConditions.getLabel,
                action: additionalConditions.getRoAction
            },
            {
                title: 'Reporting instructions',
                label: reportingInstructions.getLabel,
                action: reportingInstructions.getRoAction
            },
            {task: 'roSubmitTask', filters: []}
        ].filter(task => {
            if (task.task === 'bassAreaTask') {
                return bassReferralNeeded;
            }

            if (task.title === 'Proposed curfew address') {
                return !bassReferralNeeded && !curfewAddressRejected || addressRejectedInReviewPhase;
            }

            if (task.title === 'Risk management') {
                return !curfewAddressRejected || addressRejectedInRiskPhase;
            }

            if ([
                'Victim liaison',
                'Curfew hours',
                'Additional conditions',
                'Reporting instructions'
            ].includes(task.title)) {
                return !curfewAddressRejected;
            }

            return true;
        });
    },

    getRoTasksPostApproval: () => {
        return [
            {
                title: 'Risk management',
                label: riskManagement.getLabel,
                action: riskManagement.getRoAction,
                filters: ['!addressRejectedInReviewTask']
            },
            {
                title: 'Curfew hours',
                label: curfewHours.getLabel,
                action: curfewHours.getRoAction,
                filters: ['!curfewAddressRejected']
            },
            {
                title: 'Additional conditions',
                label: additionalConditions.getLabel,
                action: additionalConditions.getRoAction,
                filters: ['!curfewAddressRejected']
            },
            {
                title: 'Reporting instructions',
                label: reportingInstructions.getLabel,
                action: reportingInstructions.getRoAction,
                filters: ['!curfewAddressRejected']
            }
        ];
    }
};
