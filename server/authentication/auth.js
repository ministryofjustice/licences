const passport = require('passport')
const OauthStrategy = require('passport-oauth2').Strategy
const querystring = require('querystring')
const strategies = require('./authInit')
const config = require('../config')
const { generateOauthClientToken } = require('./oauth')

const authenticationMiddleware = (signInService, tokenVerifier) => {
  return async (req, res, next) => {
    if (req.isAuthenticated() && (await tokenVerifier.verify(res.locals.user.token))) {
      const { role, username, token } = req.user
      if (role !== 'RO') {
        res.locals.token = token
        return next()
      }
      const systemToken = await signInService.getClientCredentialsTokens(username)
      res.locals.token = systemToken
      return next()
    }

    return req.logout(() => {
      const query = querystring.stringify({ returnTo: req.originalUrl })
      return res.redirect(`/login?${query}`)
    })
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
