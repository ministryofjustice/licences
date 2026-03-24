module.exports = {
  getReviewSections,
}

function getReviewSections({ decisions }) {
  if (!decisions) {
    return {}
  }

  const isBass = decisions.bassReferralNeeded === true
  const isAp = decisions.approvedPremisesRequired === true
  const isAddressRisk = decisions.addressUnsuitable === true
  const isRejectedAddress = decisions.curfewAddressRejected === true || decisions.bassAreaNotSuitable === true
  const isValidAddress = !isRejectedAddress || isAp
  const useCvlForLicenceCreation = decisions.useCvlForLicenceCreation === true

  const sections = {
    bassArea: isBass,
    approvedPremisesAddress: isAp,
    curfewAddress: !isBass && !isAp,
    riskManagement: (isAddressRisk || !isRejectedAddress) && !isAp,
    victimLiaison: isValidAddress,
    curfewHours: isValidAddress && !useCvlForLicenceCreation,
    additionalConditions: isValidAddress && !useCvlForLicenceCreation,
    reportingInstructions: isValidAddress && !useCvlForLicenceCreation,
  }

  return sections
}
