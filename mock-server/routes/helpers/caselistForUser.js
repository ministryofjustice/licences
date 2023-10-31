/** @type {any} */
const { jwtDecode } = require('jwt-decode')
const hdcDemoCandidates = require('../stubs/hdcDemoCandidates')
const hdcTestCandidates = require('../stubs/hdcTestCandidates')
const hdcMultiCandidates = require('../stubs/hdcMultiCandidates')

module.exports = (token) => {
  const accessToken = token.split(' ')[1]

  let username
  try {
    // try for a real jwt to get the roles from
    /** @type {any} */
    const jwt = jwtDecode(accessToken)
    username = jwt.user_name
  } catch (error) {
    // otherwise fallback to grabbing username from token
    username = accessToken.replace('-token', '')
  }

  if (username.includes('_TEST') || username.startsWith('UOF_')) {
    return hdcTestCandidates
  }

  if (username.includes('_MULTI')) {
    return hdcMultiCandidates
  }

  return hdcDemoCandidates
}
