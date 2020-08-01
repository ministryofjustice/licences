const express = require('express')

const router = express.Router()
const fs = require('fs')

router.get('/:imageId', (req, res) => {
  const { imageId } = req.params

  res.send({
    imageId,
    captureDate: '2017-07-05',
    imageView: 'view',
    imageOrientation: 'orientation',
    imageType: 'type',
    objectId: 0,
    imageData: 'data',
  })
})

router.get('/:imageId/data', (req, res) => {
  const src = fs.createReadStream(`mock-server/routes/images/person.png`)
  src.pipe(res)
})

module.exports = router
