const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const { domain } = require('../config')

module.exports = () => {
  const router = express.Router()

  router.use((req, res, next) => {
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }
    next()
  })

  router.get('/', (req, res) => {
    const errors = req.flash('error')
    res.render('login', { errors })
  })

  router.use(bodyParser.urlencoded({ extended: true }))

  router.post('/', (req, res) => {
    const target = getTarget(req.query.target)

    return passport.authenticate('local', {
      successRedirect: target,
      failureRedirect: '/login',
      failureFlash: true,
    })(req, res)
  })

  return router
}

function getTarget(target) {
  if (target && target.match(/^\/(?!\/)/)) {
    return `${domain}${target}`
  }

  return '/caseList/active'
}
