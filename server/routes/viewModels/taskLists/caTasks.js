const postponement = require('../taskLists/tasks/postponement');
const bassOffer = require('../taskLists/tasks/bassOffer');
const curfewAddress = require('../taskLists/tasks/curfewAddress');
const riskManagement = require('../taskLists/tasks/riskManagement');
const victimLiaison = require('../taskLists/tasks/victimLiaison');
const curfewHours = require('../taskLists/tasks/curfewHours');
const additionalConditions = require('../taskLists/tasks/additionalConditions');
const reportingInstructions = require('../taskLists/tasks/reportingInstructions');

module.exports = {
    getCaTasksEligibility: ({decisions, tasks, allowedTransition}) => {
        const {optedOut, eligible, bassReferralNeeded} = decisions;
        const {eligibility, optOut} = tasks;

        const eligibilityDone = eligibility === 'DONE';
        const optOutUnstarted = optOut === 'UNSTARTED';
        const optOutRefused = optOut === 'DONE' && !optedOut;

        return [
            {
                task: 'eligibilityTask',
                visible: true
            },
            {
                task: 'informOffenderTask',
                visible: eligibilityDone && optOutUnstarted && !optedOut
            },
            {
                task: 'proposedAddressTask',
                visible: eligible
            },
            {
                task: 'caSubmitRefusalTask',
                visible: allowedTransition === 'caToDmRefusal'
            },
            {
                task: 'caSubmitBassReviewTask',
                visible: optOutRefused && bassReferralNeeded && allowedTransition !== 'caToDmRefusal'
            },
            {
                task: 'caSubmitAddressReviewTask',
                visible: optOutRefused && !bassReferralNeeded && allowedTransition !== 'caToDmRefusal'
            }
        ].filter(task => task.visible);
    },

    getCaTasksFinalChecks: ({decisions, tasks, allowedTransition}) => {
        const {
            bassReferralNeeded,
            bassWithdrawn,
            bassAccepted,
            curfewAddressApproved,
            addressUnsuitable,
            optedOut
        } = decisions;

        const {bassAreaCheck} = tasks;
        const bassAreaChecked = bassAreaCheck === 'DONE';
        const bassExcluded = ['Unavailable', 'Unsuitable'].includes(bassAccepted);
        const bassChecksDone = bassReferralNeeded && bassAreaChecked && !bassWithdrawn && !bassExcluded;

        return [
            {
                title: 'Proposed curfew address',
                label: curfewAddress.getLabel,
                action: curfewAddress.getCaProcessingAction,
                visible: !bassReferralNeeded && allowedTransition !== 'caToRo'
            },
            {
                task: 'proposedAddressTask',
                visible: allowedTransition === 'caToRo'
            },
            {
                title: 'BASS address',
                label: bassOffer.getLabel,
                action: bassOffer.getAction,
                visible: bassReferralNeeded
            },
            {
                title: 'Risk management',
                label: riskManagement.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/risk/riskManagement/',
                    text: 'View/Edit'
                },
                visible: curfewAddressApproved || bassChecksDone || addressUnsuitable
            },
            {
                title: 'Victim liaison',
                label: victimLiaison.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/victim/victimLiaison/',
                    text: 'View/Edit'
                },
                visible: curfewAddressApproved || bassChecksDone
            },
            {
                title: 'Curfew hours',
                label: curfewHours.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/curfew/curfewHours/',
                    text: 'View/Edit'
                },
                visible: curfewAddressApproved || bassChecksDone
            },
            {
                title: 'Additional conditions',
                label: additionalConditions.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/review/conditions/',
                    text: 'View'
                },
                visible: curfewAddressApproved || bassChecksDone
            },
            {
                title: 'Reporting instructions',
                label: reportingInstructions.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/review/reporting/',
                    text: 'View'
                },
                visible: curfewAddressApproved || bassChecksDone
            },
            {
                task: 'finalChecksTask',
                visible: curfewAddressApproved || bassChecksDone
            },
            {
                title: 'Postpone or refuse',
                label: postponement.getLabel,
                action: postponement.getAction,
                visible: curfewAddressApproved || bassChecksDone
            },
            {
                task: 'HDCRefusalTask',
                visible: true
            },
            {
                task: 'caSubmitApprovalTask',
                visible: !optedOut && allowedTransition !== 'caToDmRefusal' && allowedTransition !== 'caToRo'
            },
            {
                task: 'caSubmitRefusalTask',
                visible: !optedOut && allowedTransition === 'caToDmRefusal'
            },
            {
                task: 'caSubmitAddressReviewTask',
                visible: !bassReferralNeeded && !optedOut && allowedTransition === 'caToRo'
            },
            {
                task: 'caSubmitBassReviewTask',
                visible: bassReferralNeeded && !optedOut && allowedTransition === 'caToRo'
            }
        ].filter(task => task.visible);
    },

    getCaTasksPostApproval: ({decisions, tasks, allowedTransition}) => {
        const {
            curfewAddressApproved,
            addressUnsuitable,
            eligible,
            bassReferralNeeded,
            bassAccepted,
            bassWithdrawn,
            dmRefused
        } = decisions;

        const {
            bassOffer
        } = tasks;

        const bassExcluded = ['Unavailable', 'Unsuitable'].includes(bassAccepted);
        const bassOfferMade = bassReferralNeeded && bassOffer === 'DONE' && !bassWithdrawn && !bassExcluded;

        return [
            {
                task: 'eligibilitySummaryTask',
                visible: curfewAddressApproved || bassOfferMade
            },
            {
                task: 'proposedAddressTask',
                visible: eligible && allowedTransition === 'caToRo'
            },
            {
                task: 'bassAddressTask',
                visible: bassReferralNeeded && eligible && allowedTransition !== 'caToRo'
            },
            {
                title: 'Proposed curfew address',
                label: curfewAddress.getLabel,
                action: curfewAddress.getCaPostApprovalAction,
                visible: !bassReferralNeeded && eligible && allowedTransition !== 'caToRo'
            },
            {
                title: 'Risk management',
                label: riskManagement.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/risk/riskManagement/',
                    text: 'View/Edit'
                },
                visible: eligible && (curfewAddressApproved || bassOfferMade || addressUnsuitable)
            },
            {
                title: 'Victim liaison',
                label: victimLiaison.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/victim/victimLiaison/',
                    text: 'View/Edit'
                },
                visible: eligible && (curfewAddressApproved || bassOfferMade)
            },
            {
                title: 'Curfew hours',
                label: curfewHours.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/curfew/curfewHours/',
                    text: 'View/Edit'
                },
                visible: eligible && (curfewAddressApproved || bassOfferMade)
            },
            {
                title: 'Additional conditions',
                label: additionalConditions.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/licenceConditions/standard/',
                    text: 'View/Edit'
                },
                visible: eligible && (curfewAddressApproved || bassOfferMade)
            },
            {
                title: 'Reporting instructions',
                label: reportingInstructions.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/reporting/reportingInstructions/',
                    text: 'View/Edit'
                },
                visible: eligible && (curfewAddressApproved || bassOfferMade)
            },
            {
                task: 'finalChecksTask',
                visible: eligible && (curfewAddressApproved || bassOfferMade)
            },
            {
                title: 'Postpone or refuse',
                label: postponement.getLabel,
                action: postponement.getAction,
                visible: eligible && (curfewAddressApproved || bassOfferMade)
            },
            {
                task: 'HDCRefusalTask',
                visible: eligible && !dmRefused
            },
            {
                task: 'caSubmitApprovalTask',
                visible: eligible && allowedTransition === 'caToDm'
            },
            {
                task: 'caSubmitRefusalTask',
                visible: eligible && allowedTransition === 'caToDmRefusal'
            },
            {
                task: 'caSubmitBassReviewTask',
                visible: eligible && bassReferralNeeded && allowedTransition === 'caToRo'
            },
            {
                task: 'caSubmitAddressReviewTask',
                visible: eligible && !bassReferralNeeded && allowedTransition === 'caToRo'
            },
            {
                task: 'createLicenceTask',
                visible: eligible &&
                    (curfewAddressApproved || bassOfferMade) &&
                    !['caToDm', 'caToDmRefusal', 'caToRo'].includes(allowedTransition)
            },
            {
                task: 'informOffenderTask',
                visible: !eligible
            }
        ].filter(task => task.visible);
    }
};
