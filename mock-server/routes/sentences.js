const express = require('express')

const router = express.Router()
const getCaselist = require('./helpers/caselistForUser')
const hdcSearchableCanditates = require('./stubs/hdcSearchableCandidates')

router.get('/', (req, res) => {
  res.send([hdcSearchableCanditates.find((candidate) => candidate.offenderNo === req.query.offenderNo)])
})

router.get('/home-detention-curfew-candidates', (req, res) => {
  const caselist = getCaselist(req.headers.authorization)

  res.send(caselist)
})

router.post('/bookings', (req, res) => {
  const bookingNumbers = req.body.map(Number)
  if (bookingNumbers.includes(1)) {
    return res.send([
      {
        bookingId: 1,
        offenderNo: 'A111111',
        firstName: 'ORUS',
        lastName: 'MROLKIRG',
        dateOfBirth: '1950-10-22',
        agencyLocationId: 'out',
        agencyLocationDesc: 'Licence Auto Test Prison',
        internalLocationDesc: 'A-1-1',
        facialImageId: 7,
        sentenceDetail: {
          bookingId: 1,
          conditionalReleaseDate: '2015-11-14',
          homeDetentionCurfewEligibilityDate: '2016-11-14',
          automaticReleaseDate: '2020-02-02',
          homeDetentionCurfewActualDate: '2020-09-13',
          sentenceStartDate: '2010-05-24',
          sentenceExpiryDate: '2020-05-24',
          licenceExpiryDate: '2020-05-02',
          topupSupervisionExpiryDate: '2020-10-15',
        },
      },
    ])
  }
  if (bookingNumbers.includes(2)) {
    return res.send([
      {
        bookingId: 2,
        offenderNo: 'A111111',
        firstName: 'UGAN',
        lastName: 'QEMPURK',
        dateOfBirth: '1950-10-22',
        agencyLocationId: 'out',
        agencyLocationDesc: 'Licence Auto Test Prison',
        internalLocationDesc: 'A-1-1',
        facialImageId: 8,
        sentenceDetail: {
          bookingId: 2,
          conditionalReleaseDate: '2015-11-14',
          homeDetentionCurfewEligibilityDate: '2016-11-14',
          automaticReleaseDate: '2020-02-02',
          homeDetentionCurfewActualDate: '2020-09-13',
          sentenceStartDate: '2010-05-24',
          sentenceExpiryDate: '2020-05-24',
          licenceExpiryDate: '2020-05-02',
          topupSupervisionExpiryDate: '2020-10-15',
        },
        released: 'true',
      },
    ])
  }

  const caselist = getCaselist(req.headers.authorization)
  // @ts-ignore
  const candidates = caselist.filter((candidate) => bookingNumbers.includes(candidate.bookingId))

  return res.send(candidates)
})

router.get('/bookings/:bookingId/aliases', (req, res) => {
  res.send([
    {
      firstName: 'Uvorrd',
      middleName: 'string',
      lastName: 'Wackazh',
      age: 0,
      dob: '2018-01-11',
      gender: 'string',
      ethnicity: 'string',
      nameType: 'string',
      createDate: '2018-01-11',
    },
  ])
})

router.put('/booking/:bookingId/home-detention-curfews/latest/approval-status', (req, res) => {
  const { approvalStatus, date } = req.body
  const { bookingId } = req.params

  res.send({
    approvalStatus,
    date,
    bookingId,
  })
})

router.put('/booking/:bookingId/home-detention-curfews/latest/checks-passed', (req, res) => {
  const { passed, date } = req.body
  const { bookingId } = req.params

  res.send({
    passed,
    date,
    bookingId,
  })
})

module.exports = router
