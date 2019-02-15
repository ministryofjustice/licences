const postponement = require('../taskLists/tasks/postponement');
const bassOffer = require('../taskLists/tasks/bassOffer');
const bassAddress = require('../taskLists/tasks/bassAddress');
const curfewAddress = require('../taskLists/tasks/curfewAddress');
const riskManagement = require('../taskLists/tasks/riskManagement');
const victimLiaison = require('../taskLists/tasks/victimLiaison');
const curfewHours = require('../taskLists/tasks/curfewHours');
const additionalConditions = require('../taskLists/tasks/additionalConditions');
const reportingInstructions = require('../taskLists/tasks/reportingInstructions');
const proposedAddress = require('../taskLists/tasks/proposedAddress');
const caSubmitAddressReview = require('../taskLists/tasks/caSubmitAddressReview');
const caSubmitRefusal = require('../taskLists/tasks/caSubmitRefusal');
const caSubmitBassReview = require('../taskLists/tasks/caSubmitBassReview');

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
                title: 'Inform the offender',
                label: 'You should now tell the offender using the relevant HDC form from NOMIS',
                action: {
                    type: 'btn-secondary',
                    href: '/caseList/active',
                    text: 'Back to case list'
                },
                visible: eligibilityDone && optOutUnstarted && !optedOut
            },
            {
                title: 'Curfew address',
                label: proposedAddress.getLabel({decisions, tasks}),
                action: proposedAddress.getCaAction({decisions, tasks}),
                visible: eligible
            },
            {
                title: 'Submit to decision maker',
                label: caSubmitRefusal.getLabel({decisions}),
                action: caSubmitRefusal.getCaAction({decisions}),
                visible: allowedTransition === 'caToDmRefusal'
            },
            {
                title: 'Send for BASS area checks',
                label: caSubmitBassReview.getLabel({decisions, tasks}),
                action: caSubmitBassReview.getCaAction({decisions, tasks}),
                visible: optOutRefused && bassReferralNeeded && allowedTransition !== 'caToDmRefusal'
            },
            {
                title: 'Submit curfew address',
                label: caSubmitAddressReview.getLabel({tasks}),
                action: caSubmitAddressReview.getCaAction({decisions, tasks}),
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
                label: curfewAddress.getLabel({decisions, tasks}),
                action: curfewAddress.getCaProcessingAction({decisions, tasks}),
                visible: !bassReferralNeeded && allowedTransition !== 'caToRo'
            },
            {
                title: 'Curfew address',
                label: proposedAddress.getLabel({decisions, tasks}),
                action: proposedAddress.getCaAction({decisions, tasks}),
                visible: allowedTransition === 'caToRo'
            },
            {
                title: 'BASS address',
                label: bassOffer.getLabel({decisions, tasks}),
                action: bassOffer.getAction({decisions, tasks}),
                visible: bassReferralNeeded
            },
            {
                title: 'Risk management',
                label: riskManagement.getLabel({decisions, tasks}),
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/risk/riskManagement/',
                    text: 'View/Edit'
                },
                visible: curfewAddressApproved || bassChecksDone || addressUnsuitable
            },
            {
                title: 'Victim liaison',
                label: victimLiaison.getLabel({decisions, tasks}),
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/victim/victimLiaison/',
                    text: 'View/Edit'
                },
                visible: curfewAddressApproved || bassChecksDone
            },
            {
                title: 'Curfew hours',
                label: curfewHours.getLabel({decisions, tasks}),
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/curfew/curfewHours/',
                    text: 'View/Edit'
                },
                visible: curfewAddressApproved || bassChecksDone
            },
            {
                title: 'Additional conditions',
                label: additionalConditions.getLabel({decisions, tasks}),
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/review/conditions/',
                    text: 'View'
                },
                visible: curfewAddressApproved || bassChecksDone
            },
            {
                title: 'Reporting instructions',
                label: reportingInstructions.getLabel({decisions, tasks}),
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
                label: postponement.getLabel({decisions, tasks}),
                action: postponement.getAction({decisions, tasks}),
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
                title: 'Submit to decision maker',
                label: caSubmitRefusal.getLabel({decisions}),
                action: caSubmitRefusal.getCaAction({decisions}),
                visible: !optedOut && allowedTransition === 'caToDmRefusal'
            },
            {
                title: 'Submit curfew address',
                label: caSubmitAddressReview.getLabel({tasks}),
                action: caSubmitAddressReview.getCaAction({decisions, tasks}),
                visible: !bassReferralNeeded && !optedOut && allowedTransition === 'caToRo'
            },
            {
                title: 'Send for BASS area checks',
                label: caSubmitBassReview.getLabel({decisions, tasks}),
                action: caSubmitBassReview.getCaAction({decisions, tasks}),
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
                title: 'Curfew address',
                label: proposedAddress.getLabel({decisions, tasks}),
                action: proposedAddress.getCaAction({decisions, tasks}),
                visible: eligible && allowedTransition === 'caToRo'
            },
            {
                title: 'BASS address',
                label: bassAddress.getLabel({decisions, tasks}),
                action: bassAddress.getCaAction({tasks}),
                visible: bassReferralNeeded && eligible && allowedTransition !== 'caToRo'
            },
            {
                title: 'Proposed curfew address',
                label: curfewAddress.getLabel({decisions, tasks}),
                action: curfewAddress.getCaPostApprovalAction({decisions, tasks}),
                visible: !bassReferralNeeded && eligible && allowedTransition !== 'caToRo'
            },
            {
                title: 'Risk management',
                label: riskManagement.getLabel({decisions, tasks}),
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/risk/riskManagement/',
                    text: 'View/Edit'
                },
                visible: eligible && (curfewAddressApproved || bassOfferMade || addressUnsuitable)
            },
            {
                title: 'Victim liaison',
                label: victimLiaison.getLabel({decisions, tasks}),
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/victim/victimLiaison/',
                    text: 'View/Edit'
                },
                visible: eligible && (curfewAddressApproved || bassOfferMade)
            },
            {
                title: 'Curfew hours',
                label: curfewHours.getLabel({decisions, tasks}),
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/curfew/curfewHours/',
                    text: 'View/Edit'
                },
                visible: eligible && (curfewAddressApproved || bassOfferMade)
            },
            {
                title: 'Additional conditions',
                label: additionalConditions.getLabel({decisions, tasks}),
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/licenceConditions/standard/',
                    text: 'View/Edit'
                },
                visible: eligible && (curfewAddressApproved || bassOfferMade)
            },
            {
                title: 'Reporting instructions',
                label: reportingInstructions.getLabel({decisions, tasks}),
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
                label: postponement.getLabel({decisions, tasks}),
                action: postponement.getAction({decisions, tasks}),
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
                title: 'Submit to decision maker',
                label: caSubmitRefusal.getLabel({decisions}),
                action: caSubmitRefusal.getCaAction({decisions}),
                visible: eligible && allowedTransition === 'caToDmRefusal'
            },
            {
                title: 'Send for BASS area checks',
                label: caSubmitBassReview.getLabel({decisions, tasks}),
                action: caSubmitBassReview.getCaAction({decisions, tasks}),
                visible: eligible && bassReferralNeeded && allowedTransition === 'caToRo'
            },
            {
                title: 'Submit curfew address',
                label: caSubmitAddressReview.getLabel({tasks}),
                action: caSubmitAddressReview.getCaAction({decisions, tasks}),
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
