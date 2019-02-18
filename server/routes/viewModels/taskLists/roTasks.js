const riskManagement = require('./tasks/riskManagement')
const curfewHours = require('./tasks/curfewHours')
const additionalConditions = require('./tasks/additionalConditions')
const reportingInstructions = require('./tasks/reportingInstructions')
const curfewAddress = require('./tasks/curfewAddress')
const victimLiaison = require('./tasks/victimLiaison')
const bassArea = require('./tasks/bassArea')
const roSubmit = require('./tasks/roSubmit')

module.exports = {
    getRoTasks: ({ decisions, tasks, allowedTransition }) => {
        const { bassReferralNeeded, addressUnsuitable, curfewAddressRejected, addressReviewFailed } = decisions

        const addressRejectedInRiskPhase = curfewAddressRejected && addressUnsuitable
        const addressRejectedInReviewPhase = curfewAddressRejected && addressReviewFailed

        return [
            {
                title: 'BASS area check',
                label: bassArea.getLabel({ decisions, tasks }),
                action: bassArea.getRoAction({ decisions, tasks }),
                visible: bassReferralNeeded,
            },
            {
                title: 'Proposed curfew address',
                label: curfewAddress.getLabel({ decisions, tasks }),
                action: curfewAddress.getRoAction({ decisions, tasks }),
                visible: (!bassReferralNeeded && !curfewAddressRejected) || addressRejectedInReviewPhase,
            },
            {
                title: 'Risk management',
                label: riskManagement.getLabel({ decisions, tasks }),
                action: riskManagement.getRoAction({ decisions, tasks }),
                visible: !curfewAddressRejected || addressRejectedInRiskPhase,
            },
            {
                title: 'Victim liaison',
                label: victimLiaison.getLabel({ decisions, tasks }),
                action: victimLiaison.getRoAction({ decisions, tasks }),
                visible: !curfewAddressRejected,
            },
            {
                title: 'Curfew hours',
                label: curfewHours.getLabel({ decisions, tasks }),
                action: curfewHours.getRoAction({ decisions, tasks }),
                visible: !curfewAddressRejected,
            },
            {
                title: 'Additional conditions',
                label: additionalConditions.getLabel({ decisions, tasks }),
                action: additionalConditions.getRoAction({ decisions, tasks }),
                visible: !curfewAddressRejected,
            },
            {
                title: 'Reporting instructions',
                label: reportingInstructions.getLabel({ decisions, tasks }),
                action: reportingInstructions.getRoAction({ decisions, tasks }),
                visible: !curfewAddressRejected,
            },
            {
                title: 'Submit to prison case admin',
                label: roSubmit.getLabel({ allowedTransition }),
                action: roSubmit.getRoAction({ decisions }),
                visible: true,
            },
        ].filter(task => task.visible)
    },

    getRoTasksPostApproval: ({ decisions, tasks }) => {
        return [
            {
                title: 'Risk management',
                label: riskManagement.getLabel({ decisions, tasks }),
                action: riskManagement.getRoAction({ decisions, tasks }),
            },
            {
                title: 'Curfew hours',
                label: curfewHours.getLabel({ decisions, tasks }),
                action: curfewHours.getRoAction({ decisions, tasks }),
            },
            {
                title: 'Additional conditions',
                label: additionalConditions.getLabel({ decisions, tasks }),
                action: additionalConditions.getRoAction({ decisions, tasks }),
            },
            {
                title: 'Reporting instructions',
                label: reportingInstructions.getLabel({ decisions, tasks }),
                action: reportingInstructions.getRoAction({ decisions, tasks }),
            },
        ]
    },
}
