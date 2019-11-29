module.exports = {
  addressReview: { type: 'caToRo', receiver: 'RO', notificationType: 'RO_NEW' },
  bassReview: { type: 'caToRo', receiver: 'RO', notificationType: 'RO_NEW' },
  finalChecks: { type: 'roToCa', receiver: 'CA', notificationType: 'CA_RETURN' },
  approval: { type: 'caToDm', receiver: 'DM', notificationType: 'DM_NEW' },
  decided: { type: 'dmToCa', receiver: 'CA', notificationType: 'CA_DECISION' },
  return: { type: 'dmToCaReturn', receiver: 'CA', notificationType: 'DM_TO_CA_RETURN' },
  refusal: { type: 'caToDmRefusal', receiver: 'DM', notificationType: 'DM_NEW' },
  addressRejected: { type: 'roToCaAddressRejected', receiver: 'CA', notificationType: 'CA_RETURN' },
  bassAreaRejected: { type: 'roToCaAddressRejected', receiver: 'CA', notificationType: 'CA_RETURN' },
  optedOut: { type: 'roToCaOptedOut', receiver: 'CA', notificationType: 'CA_RETURN' },
}
