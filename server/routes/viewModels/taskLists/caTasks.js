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
            {task: 'eligibilityTask'},
            {task: 'informOffenderTask'},
            {task: 'proposedAddressTask'},
            {task: 'caSubmitRefusalTask'},
            {task: 'caSubmitBassReviewTask'},
            {task: 'caSubmitAddressReviewTask'}
        ].filter(task => {
            if (task.task === 'informOffenderTask') {
                return eligibilityDone && optOutUnstarted && !optedOut;
            }

            if (task.task === 'proposedAddressTask') {
                return eligible;
            }

            if (task.task === 'caSubmitRefusalTask') {
                return allowedTransition === 'caToDmRefusal';
            }

            if (task.task === 'caSubmitBassReviewTask') {
                return optOutRefused && bassReferralNeeded && allowedTransition !== 'caToDmRefusal';
            }

            if (task.task === 'caSubmitAddressReviewTask') {
                return optOutRefused && !bassReferralNeeded && allowedTransition !== 'caToDmRefusal';
            }

            return true;
        });
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
                action: curfewAddress.getCaProcessingAction
            },
            {task: 'proposedAddressTask'},
            {
                title: 'BASS address',
                label: bassOffer.getLabel,
                action: bassOffer.getAction,
                filters: ['bassReferralNeeded']
            },
            {
                title: 'Risk management',
                label: riskManagement.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/risk/riskManagement/',
                    text: 'View/Edit'
                },
                filters: ['addressOrBassChecksDoneOrUnsuitable']
            },
            {
                title: 'Victim liaison',
                label: victimLiaison.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/victim/victimLiaison/',
                    text: 'View/Edit'
                },
                filters: ['addressOrBassChecksDone']
            },
            {
                title: 'Curfew hours',
                label: curfewHours.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/curfew/curfewHours/',
                    text: 'View/Edit'
                },
                filters: ['addressOrBassChecksDone']
            },
            {
                title: 'Additional conditions',
                label: additionalConditions.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/review/conditions/',
                    text: 'View'
                },
                filters: ['addressOrBassChecksDone']
            },
            {
                title: 'Reporting instructions',
                label: reportingInstructions.getLabel,
                action: {
                    type: 'btn-secondary',
                    href: '/hdc/review/reporting/',
                    text: 'View'
                },
                filters: ['addressOrBassChecksDone']
            },
            {task: 'finalChecksTask', filters: ['addressOrBassChecksDone']},
            {
                title: 'Postpone or refuse',
                label: postponement.getLabel,
                action: postponement.getAction,
                filters: ['addressOrBassChecksDone']
            },
            {task: 'HDCRefusalTask', filters: []},
            {task: 'caSubmitApprovalTask', filters: ['!optedOut', '!caToDmRefusal', '!caToRo']},
            {task: 'caSubmitRefusalTask', filters: ['!optedOut', 'caToDmRefusal']},
            {task: 'caSubmitAddressReviewTask', filters: ['!optedOut', 'caToRo', '!bassReferralNeeded']},
            {task: 'caSubmitBassReviewTask', filters: ['!optedOut', 'caToRo', 'bassReferralNeeded']}
        ].filter(task => {
            if (task.title === 'Proposed curfew address') {
                return !bassReferralNeeded && allowedTransition !== 'caToRo';
            }

            if (task.task === 'proposedAddressTask') {
                return allowedTransition === 'caToRo';
            }

            if (task.title === 'BASS address') {
                return bassReferralNeeded;
            }

            if (task.title === 'Risk management') {
                return curfewAddressApproved || bassChecksDone || addressUnsuitable;
            }

            if ([
                'Victim liaison',
                'Curfew hours',
                'Additional conditions',
                'Reporting instructions',
                'Postpone or refuse'
            ].includes(task.title) || task.task === 'finalChecksTask') {
                return curfewAddressApproved || bassChecksDone;
            }

            if (task.task === 'caSubmitApprovalTask') {
                return !optedOut && allowedTransition !== 'caToDmRefusal' && allowedTransition !== 'caToRo';
            }

            if (task.task === 'caSubmitRefusalTask') {
                return !optedOut && allowedTransition === 'caToDmRefusal';
            }

            if (task.task === 'caSubmitAddressReviewTask') {
                return !bassReferralNeeded && !optedOut && allowedTransition === 'caToRo';
            }

            if (task.task === 'caSubmitBassReviewTask') {
                return bassReferralNeeded && !optedOut && allowedTransition === 'caToRo';
            }

            return true;
        });

    }
};
