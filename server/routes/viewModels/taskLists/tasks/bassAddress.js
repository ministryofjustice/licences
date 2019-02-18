const { standardAction } = require('./utils/actions')

module.exports = {
    getLabel: ({ decisions, tasks }) => {
        const { bassAreaNotSuitable, bassWithdrawn, bassWithdrawalReason, bassAccepted } = decisions
        const { bassOffer, bassAddress } = tasks

        if (bassAreaNotSuitable) {
            return 'BASS area rejected'
        }

        if (bassWithdrawn) {
            return bassWithdrawalReason === 'offer' ? 'BASS offer withdrawn' : 'BASS request withdrawn'
        }

        if (bassOffer === 'DONE') {
            if (bassAccepted === 'Yes') {
                return bassAddress === 'DONE' ? 'Offer made and address provided' : 'Offer made, awaiting address'
            }
            return bassAccepted === 'Unsuitable' ? 'WARNING||Not suitable for BASS' : 'WARNING||Address not available'
        }

        return 'Not completed'
    },

    getCaAction: ({ tasks }) => {
        const { bassAddress } = tasks
        return standardAction(bassAddress, '/hdc/bassReferral/bassOffer/')
    },
}
