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

  const sections = {
    bassArea: isBass,
    approvedPremisesAddress: isAp,
    curfewAddress: !isBass && !isAp,
    riskManagement: (isAddressRisk || !isRejectedAddress) && !isAp,
    victimLiaison: isValidAddress,
    curfewHours: isValidAddress,
    additionalConditions: isValidAddress,
    reportingInstructions: isValidAddress,
  }

  return sections
}
