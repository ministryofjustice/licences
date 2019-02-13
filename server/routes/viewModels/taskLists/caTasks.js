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
    }
};
