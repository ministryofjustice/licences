const { standardAction } = require('./utils/actions')

module.exports = {
  getLabel: ({ decisions, tasks }) => {
    const { bassAreaSpecified, bassAreaSuitable, approvedPremisesRequired } = decisions
    const { bassAreaCheck, approvedPremisesAddress } = tasks

    if (bassAreaCheck === 'DONE' && approvedPremisesAddress !== 'DONE') {
      if (bassAreaSpecified) {
        return bassAreaSuitable ? 'BASS area suitable' : 'BASS area is not suitable'
      }
      if (!bassAreaSpecified && approvedPremisesRequired === true) {
        return 'Approved premises required'
      }
      return 'No specific BASS area requested'
    }

    if (approvedPremisesAddress === 'DONE') {
      return 'Approved premises required'
    }
    return 'Not completed'
  },

  getRoAction: ({ tasks }) => {
    const { bassAreaCheck, approvedPremisesAddress } = tasks
    if (approvedPremisesAddress === 'DONE') {
      return standardAction(approvedPremisesAddress, '/hdc/bassReferral/bassAreaCheck/')
    }
    return standardAction(bassAreaCheck, '/hdc/bassReferral/bassAreaCheck/')
  },
}
