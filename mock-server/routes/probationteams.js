const express = require('express')

const router = express.Router()

router.get('/probation-areas/:probationAreaCode/local-delivery-units/:localDeliveryUnitCode', (req, res) => {
  const { probationAreaCode, localDeliveryUnitCode } = req.params

  res.set('Content-Type', 'application/json')

  const response = {
    probationAreaCode,
    localDeliveryUnitCode,
    functionalMailbox: `${probationAreaCode}_${localDeliveryUnitCode}@probationteams.com`,
  }
  res.send(response)
})

module.exports = router
