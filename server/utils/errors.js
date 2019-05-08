module.exports = {
  unauthorisedError,
  nomisPushError,
}

function unauthorisedError() {
  const error = new Error('Unauthorised access')
  error.status = 403
  return error
}

function nomisPushError(type) {
  const error = new Error('Nomis Push Conflict')
  error.name = 'NomisPushConflict'
  error.type = type
  return error
}
