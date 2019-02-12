const riskManagement = require('./tasks/riskManagement');
const curfewHours = require('./tasks/curfewHours');
const additionalConditions = require('./tasks/additionalConditions');
const reportingInstructions = require('./tasks/reportingInstructions');

module.exports = {
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
