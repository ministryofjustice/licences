const express = require('express')
const fs = require('fs')

const hdcDemoCandidates = require('./stubs/hdcDemoCandidates')
const hdcTestCandidates = require('./stubs/hdcTestCandidates')
const hdcMultiCandidates = require('./stubs/hdcMultiCandidates')

const router = express.Router()

const allCandidates = [...hdcDemoCandidates, ...hdcTestCandidates, ...hdcMultiCandidates]

router.get('/:bookingId', (req, res) => {
  res.send({ offenderNo: '111111' })
})

router.get('/offenderNo/:offenderNo', (req, res) => {
  const { offenderNo } = req.params
  const found = allCandidates.find((candidate) => candidate.offenderNo === offenderNo) || {
    bookingId: 0,
    offenderNo: null,
  }
  res.send({ offenderNo: found.offenderNo, bookingId: found.bookingId })
})

router.get('/:bookingId/aliases', (req, res) => {
  res.send([
    {
      firstName: 'Marky',
      middleName: 'string',
      lastName: 'Andrews',
      age: 0,
      dob: '2018-01-11',
      gender: 'string',
      ethnicity: 'string',
      nameType: 'string',
      createDate: '2018-01-11',
    },
  ])
})

router.get('/:bookingId/identifiers', (req, res) => {
  res.send([
    {
      type: 'PNC',
      value: 'PNC/A0001XX',
      issuedAuthorityText: 'issuedBySomeone',
      issuedDate: '01-01-2001',
      caseloadType: 'INST',
    },
    {
      type: 'CRO',
      value: 'CRO/A0001XX',
      issuedAuthorityText: 'issuedBySomeone',
      issuedDate: '01-01-2001',
      caseloadType: 'INST',
    },
    {
      type: 'middleName',
      value: 'Middle',
      issuedAuthorityText: 'issuedBySomeone',
      issuedDate: '01-01-2001',
      caseloadType: 'INST',
    },
  ])
})

router.get('/:bookingId/mainOffence', (req, res) => {
  const crimes = [
    {
      bookingId: 1200635,
      offenceDescription:
        "Cause exceed max permitted wt of artic' vehicle - No of axles/configuration (No MOT/Manufacturer's Plate)",
    },
  ]

  res.send(crimes)
})

router.get('/:bookingId/relationships', (req, res) => {
  res.send([
    {
      lastName: 'Orton',
      firstName: 'Ryan',
      middleName: 'string',
      contactType: 'string',
      contactTypeDescription: 'string',
      relationship: 'string',
      relationshipDescription: 'string',
      emergencyContact: true,
      nextOfKin: true,
      relationshipId: 0,
      personId: 123,
    },
  ])
})

router.get('/offenderNo/:imageId/image/data', (req, res) => {
  const src = fs.createReadStream(`routes/images/person.png`)
  src.pipe(res)
})

module.exports = router
