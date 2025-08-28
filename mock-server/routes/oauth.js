const express = require('express')

const router = express.Router()

const getToken = (username) => `${username}-token`

/* GET users listing. */
router.post('/token', (req, res) => {
  const token = getToken(req.body.username)

  res.send({
    access_token: token,
    token_type: 'bearer',
    expires_in: 1199,
    scope: 'read write',
    internalUser: true,
    jti: '91687796-3f69-441c-aaa9-1de7e314eee9',
  })
})

module.exports = router
