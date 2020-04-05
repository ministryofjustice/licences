const passport = require('passport')
const OauthStrategy = require('passport-oauth2').Strategy
const strategies = require('./authInit')
const config = require('../config')
const { generateOauthClientToken } = require('./oauth')

const authenticationMiddleware = (signInService) => {
  return async (req, res, next) => {
    if (req.isAuthenticated()) {
      const { role, username, token } = req.user
      if (role !== 'RO') {
        res.locals.token = token
        return next()
      }
      const systemToken = await signInService.getClientCredentialsTokens(username)
      res.locals.token = systemToken.token
      return next()
    }

    // stash target url in session to return to
    req.session.returnTo = req.originalUrl
    const redirectPath = '/login'
    return res.redirect(redirectPath)
  }
}

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

const init = (userService, audit) => {
  passport.use(
    new OauthStrategy(
      {
        authorizationURL: `${config.nomis.authExternalUrl}/oauth/authorize`,
        tokenURL: `${config.nomis.authUrl}/oauth/token`,
        clientID: config.nomis.apiClientId,
        clientSecret: config.nomis.apiClientSecret,
        callbackURL: `${config.domain}/login/callback`,
        state: true,
        customHeaders: { Authorization: generateOauthClientToken() },
      },
      strategies(userService, audit).init
    )
  )
}

module.exports.init = init
module.exports.authenticationMiddleware = authenticationMiddleware
