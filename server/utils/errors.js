module.exports = {
  unauthorisedError,
  forbiddenError,
  nomisPushError,
}

function unauthorisedError() {
  /** @type {any} */
  const error = new Error('Unauthorised access')
  error.status = 401
  return error
}

function forbiddenError() {
  /** @type {any} */
  const error = new Error('Forbidden access')
  error.status = 403
  return error
}

function nomisPushError(type) {
  /** @type {any} */
  const error = new Error('Nomis Push Conflict')
  error.name = 'NomisPushConflict'
  error.type = type
  return error
}
