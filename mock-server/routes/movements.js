const express = require('express')

const router = express.Router()

const movements = [
  {
    offenderNo: '1',
    createDateTime: '2019-01-30T16:24:36.770Z',
    fromAgency: 'string',
    fromAgencyDescription: 'Peckham',
    toAgency: 'string',
    toAgencyDescription: 'string',
    fromCity: 'string',
    toCity: 'string',
    movementType: 'REL',
    movementTypeDescription: 'Released',
    directionCode: 'string',
    movementTime: {
      hour: 0,
      minute: 0,
      second: 0,
      nano: 0,
    },
    movementReason: 'string',
    commentText: 'string',
  },
  {
    offenderNo: '2',
    createDateTime: '2019-01-30T16:24:36.770Z',
    fromAgency: 'string',
    fromAgencyDescription: 'Peckham',
    toAgency: 'string',
    toAgencyDescription: 'string',
    fromCity: 'string',
    toCity: 'string',
    movementType: 'REL',
    movementTypeDescription: 'Released',
    directionCode: 'string',
    movementTime: {
      hour: 0,
      minute: 0,
      second: 0,
      nano: 0,
    },
    movementReason: 'string',
    commentText: 'string',
  },
]

router.post('/offenders', (req, res) => {
  res.send(movements)
})

module.exports = router
