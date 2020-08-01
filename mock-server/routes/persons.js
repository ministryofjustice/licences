const express = require('express')

const router = express.Router()

router.get('/:bookingId/identifiers', (req, res) => {
  res.send([
    {
      identifierType: 'EXTERNAL_REL',
      identifierValue: 'DELIUS_ID',
    },
  ])
})

module.exports = router
