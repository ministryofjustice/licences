const logger = require('../../log')

module.exports = function ensureHttps(req, res, next) {
  if (req.secure) {
    return next()
  }
  const redirectUrl = `https://${req.hostname}${req.url}`
  logger.info(`Redirecting to ${redirectUrl}`)

  return res.redirect(redirectUrl)
}
