const { isApplicationRole } = require('./roles')
const logger = require('../../log')

module.exports = (userService, audit) => {
  const getUser = async (token, expiresIn, username) => {
    const userProfile = await userService.getUserProfile(token, username)

    if (!isApplicationRole(userProfile.role)) {
      throw new Error('Login error - no acceptable role')
    }

    const userDetail = userProfile.staffId || userProfile.username || userProfile.lastName || 'no user id'
    audit.record('LOGIN', userDetail)

    return {
      token,
      expiresIn,
      ...userProfile,
    }
  }

  const init = async (accessToken, refreshToken, params, profile, done) => {
    try {
      const user = await getUser(accessToken, params.expires_in, params.user_name)
      return done(null, user)
    } catch (error) {
      logger.error(`Sign in error for user: '${params.user_name}'`, error.stack)
      return done(null, false, { message: 'A system error occurred; please try again later' })
    }
  }

  return { init }
}
