const express = require('express')

const router = express.Router()

router.get('/prison/:agencyLocationId', (req, res) => {
  res.send({
    agencyId: 'LT1',
    addressType: 'BUS',
    premise: 'HMP Albany',
    city: 'Testington',
    locality: 'Testville',
    country: 'England',
    postCode: 'AB1 1AB',
    phones: [
      {
        number: '0111 999 999',
        type: 'BUS',
        ext: '999',
      },
      {
        number: '0222 999 999',
        type: 'FAX',
        ext: '999',
      },
    ],
  })
})

module.exports = router
