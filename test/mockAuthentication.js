const session = require('cookie-session')
const passport = require('passport')

const auth = require('../server/authentication/auth')

const setupMockAuthentication = (app, signInService, userService, audit) => {
    auth.init(signInService, userService, audit, 'local')
    app.use(
        session({
            secret: 'test',
            resave: false,
            saveUninitialized: true,
        })
    )
    app.use(passport.initialize())
    app.use(passport.session())
}

module.exports.authenticationMiddleware = () => {
    return (req, res, next) => next()
}

module.exports.setupMockAuthentication = setupMockAuthentication
