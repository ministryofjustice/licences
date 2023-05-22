module.exports = {
  isAcceptedAddress,
}

function isAcceptedAddress({ consent, consentHavingSpoken, electricity }, addressSuitable, offenderIsOccupier) {
  if (offenderIsOccupier) {
    return electricity === 'Yes' && addressSuitable === 'Yes'
  }

  return (consent === 'Yes' || consentHavingSpoken === 'Yes') && electricity === 'Yes' && addressSuitable === 'Yes'
}
