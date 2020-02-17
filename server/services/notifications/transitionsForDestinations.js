module.exports = {
  addressReview: { type: 'caToRo', sender: 'CA', receiver: 'RO', notificationType: 'RO_NEW' },
  bassReview: { type: 'caToRo', sender: 'CA', receiver: 'RO', notificationType: 'RO_NEW' },
  finalChecks: { type: 'roToCa', sender: 'RO', receiver: 'CA', notificationType: 'CA_RETURN' },
  approval: { type: 'caToDm', sender: 'CA', receiver: 'DM', notificationType: 'DM_NEW' },
  decided: { type: 'dmToCa', sender: 'DM', receiver: 'CA', notificationType: 'CA_DECISION' },
  return: { type: 'dmToCaReturn', sender: 'DM', receiver: 'CA', notificationType: 'DM_TO_CA_RETURN' },
  refusal: { type: 'caToDmRefusal', sender: 'CA', receiver: 'DM', notificationType: 'DM_NEW' },
  addressRejected: { type: 'roToCaAddressRejected', sender: 'RO', receiver: 'CA', notificationType: 'CA_RETURN' },
  bassAreaRejected: { type: 'roToCaAddressRejected', sender: 'RO', receiver: 'CA', notificationType: 'CA_RETURN' },
  optedOut: { type: 'roToCaOptedOut', sender: 'RO', receiver: 'CA', notificationType: 'CA_RETURN' },
}
