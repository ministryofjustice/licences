const { standardAction } = require('../utils/actions')

const getLabel = ({ decisions, tasks }) => {
  const { bassAreaSpecified, bassAreaSuitable, approvedPremisesRequired } = decisions
  const { bassAreaCheck, approvedPremisesAddress } = tasks

  if (bassAreaCheck === 'DONE' && approvedPremisesAddress !== 'DONE') {
    if (bassAreaSpecified) {
      return bassAreaSuitable ? 'CAS2 area suitable' : 'CAS2 area is not suitable'
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
}

module.exports = ({ decisions, tasks }) => {
  const { bassAreaCheck, approvedPremisesAddress } = tasks
  return {
    title: 'CAS2 area check',
    label: getLabel({ decisions, tasks }),
    action:
      approvedPremisesAddress === 'DONE'
        ? standardAction(approvedPremisesAddress, '/hdc/bassReferral/bassAreaCheck/')
        : standardAction(bassAreaCheck, '/hdc/bassReferral/bassAreaCheck/'),
  }
}
