const fiveMinutesBefore = require('../utils/fiveMinutesBefore')
const allowedRoles = require('./roles')
const logger = require('../../log')

module.exports = (userService, audit) => {
  const getUser = async (token, refreshToken, expiresIn, username) => {
    const userProfile = await userService.getUserProfile(token, refreshToken, username)

    if (!allowedRoles.includes(userProfile.role)) {
      throw new Error('Login error - no acceptable role')
    }

    const userDetail = userProfile.staffId || userProfile.username || userProfile.lastName || 'no user id'
    audit.record('LOGIN', userDetail)

    return {
      token,
      refreshToken,
      expiresIn,
      refreshTime: fiveMinutesBefore(expiresIn),
      ...userProfile,
    }
  }

  const init = async (accessToken, refreshToken, params, profile, done) => {
    try {
      const user = await getUser(accessToken, refreshToken, params.expires_in, params.user_name)
      return done(null, user)
    } catch (error) {
      logger.error('Sign in error ', error.stack)
      return done(null, false, { message: 'A system error occurred; please try again later' })
    }
  }

  return { init }
}
