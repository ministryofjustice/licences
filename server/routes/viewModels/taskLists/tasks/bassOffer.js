const {standardAction, change} = require('./utils/actions');

module.exports = {
    getLabel: ({decisions, tasks}) => {
        const {bassAreaNotSuitable, bassWithdrawn, bassWithdrawalReason, bassAccepted, bassAreaSuitable} = decisions;
        const {bassOffer, bassAreaCheck} = tasks;

        if (bassAreaNotSuitable) {
            return 'BASS area rejected';
        }

        if (bassWithdrawn) {
            if (bassWithdrawalReason === 'offer') {
                return 'BASS offer withdrawn';
            }
            return 'BASS request withdrawn';
        }

        if (bassOffer === 'DONE') {
            if (bassAccepted === 'Yes') {
                return 'Offer made';
            }
            // TODO warning box
            if (bassAccepted === 'Unsuitable') {
                return 'WARNING||Not suitable for BASS';
            }
            return 'WARNING||Address not available';
        }

        if (bassAreaCheck === 'DONE' && bassAreaSuitable) {
            return 'Not completed';

        }

        return 'BASS referral requested';
    },

    getAction: ({decisions, tasks}) => {
        const {bassWithdrawn} = decisions;
        const {bassAreaCheck, bassOffer, optOut, curfewAddress, bassRequest} = tasks;

        if (bassWithdrawn) {
            return change('/hdc/bassReferral/bassOffer/');
        }

        if (bassAreaCheck === 'DONE') {
            return standardAction(bassOffer, '/hdc/bassReferral/bassOffer/');
        }

        if ([optOut, curfewAddress, bassRequest].every(task => task === 'UNSTARTED')) {
            return {text: 'Start now', href: '/hdc/proposedAddress/curfewAddressChoice/', type: 'btn'};
        }

        if ([optOut, curfewAddress, bassRequest].every(task => task === 'DONE')) {
            return change('/hdc/proposedAddress/curfewAddressChoice/');
        }

        return {text: 'Continue', href: '/hdc/proposedAddress/curfewAddressChoice/', type: 'btn'};
    }
};
