const express = require('express')

const router = express.Router()

// test users - these passwords are fake
const users = {
  CA_RO_DM_USER: 'password123456',
  LICENCE_READONLY_TEST: 'password123456',
  CA_USER_TEST: 'password123456',
  CA_USER_MULTI: 'password123456',
  AUTH_RO_USER_TEST: 'password123456',
  RO_USER_MULTI: 'password123456',
  RO_USER_TEST: 'password123456',
  DM_USER_TEST: 'password123456',
  DM_USER_MULTI: 'password123456',
  NONE: 'licences123456',
}

const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')

// Unsigned JWT: the app and the other mocks only decode the payload, they never verify the signature
const createToken = (username) => {
  const payload = {
    user_name: username,
    scope: ['read', 'write'],
    auth_source: 'nomis',
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  }
  return `${base64Url({ alg: 'none', typ: 'JWT' })}.${base64Url(payload)}.`
}

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const loginPage = ({ redirect_uri: redirectUri, state, error }) => `<!DOCTYPE html>
<html>
  <head><title>Mock sign in</title></head>
  <body>
    <h1>Sign in</h1>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
    <form method="post" action="/auth/oauth/authorize">
      <input type="hidden" name="redirect_uri" value="${escapeHtml(redirectUri)}" />
      <input type="hidden" name="state" value="${escapeHtml(state)}" />
      <label for="username">Username</label>
      <input id="username" name="username" type="text" />
      <label for="password">Password</label>
      <input id="password" name="password" type="password" />
      <input id="submit" type="submit" value="Sign in" />
    </form>
  </body>
</html>`

// Real auth redirects to /login; the Geb SigninPage asserts on that URL
router.get('/oauth/authorize', (req, res) => {
  // @ts-ignore
  const query = new URLSearchParams(req.query).toString()
  res.redirect(`/auth/login?${query}`)
})

router.get('/login', (req, res) => {
  // @ts-ignore
  res.send(loginPage(req.query))
})

router.post('/oauth/authorize', (req, res) => {
  const { username, password, redirect_uri: redirectUri, state } = req.body
  const name = String(username || '').toUpperCase()

  if (!users[name] || users[name] !== password) {
    return res.status(401).send(loginPage({ redirect_uri: redirectUri, state, error: 'Invalid credentials' }))
  }

  const target = new URL(redirectUri)
  target.searchParams.set('code', name)
  if (state) target.searchParams.set('state', state)
  return res.redirect(target.toString())
})

router.post('/oauth/token', (req, res) => {
  const { grant_type: grantType, code, username } = req.body
  const user = grantType === 'authorization_code' ? code : username

  res.send({
    access_token: createToken(user || 'CLIENT'),
    token_type: 'bearer',
    expires_in: 3600,
    scope: 'read write',
    user_name: user,
    auth_source: 'nomis',
    jti: '11111-22222-3333-4444-55555',
  })
})

router.get('/logout', (req, res) => {
  // @ts-ignore
  res.redirect(req.query.redirect_uri || '/')
})

// @ts-ignore
router.get('/health/ping', (req, res) => {
  res.send({ status: 'UP' })
})

module.exports = router
