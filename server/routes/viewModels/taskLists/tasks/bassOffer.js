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
                return 'Not suitable for BASS';
            }
            return 'Address not available';
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
            return {
                text: 'Change',
                href: '/hdc/bassReferral/bassOffer/',
                type: 'link'
            };
        }

        if (bassAreaCheck === 'DONE') {
            if (bassOffer === 'UNSTARTED') {
                return {text: 'Start now', href: '/hdc/bassReferral/bassOffer/', type: 'btn'};
            }
            if (bassOffer === 'DONE') {
                return {text: 'Change', href: '/hdc/bassReferral/bassOffer/', type: 'link'};
            }
            return {text: 'Continue', href: '/hdc/bassReferral/bassOffer/', type: 'btn'};
        }

        if ([optOut, curfewAddress, bassRequest].every(task => task === 'UNSTARTED')) {
            return {text: 'Start now', href: '/hdc/proposedAddress/curfewAddressChoice/', type: 'btn'};
        }

        if ([optOut, curfewAddress, bassRequest].every(task => task === 'DONE')) {
            return {text: 'Change', href: '/hdc/proposedAddress/curfewAddressChoice/', type: 'link'};
        }

        return {text: 'Continue', href: '/hdc/proposedAddress/curfewAddressChoice/', type: 'btn'};
    }
};
