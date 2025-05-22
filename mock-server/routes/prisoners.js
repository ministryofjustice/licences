const express = require('express')

const router = express.Router()

const prisoners = [
  {
    offenderNo: '111111',
    title: 'Mr',
    suffix: 'string',
    firstName: 'ORUS',
    middleNames: 'string',
    lastName: 'MROLKIRG',
    dateOfBirth: '1945-12-03',
    gender: 'Male',
    sexCode: 'string',
    nationalities: 'string',
    currentlyInPrison: 'string',
    latestBookingId: 1,
    latestLocationId: 'OUT',
    latestLocation: 'OUT',
    internalLocation: 'string',
    pncNumber: '111111',
    croNumber: '222222',
    ethnicity: 'White British',
    birthCountry: 'Great Britain',
    religion: 'None',
    convictedStatus: 'string',
    imprisonmentStatus: 'string',
    receptionDate: '19/01/1983',
    maritalStatus: 'M',
    currentWorkingFirstName: 'Orus',
    currentWorkingLastName: 'Mrolkirg',
    currentWorkingBirthDate: 'string',
  },
  {
    offenderNo: '222222',
    title: 'Mr',
    suffix: 'string',
    firstName: 'UGAN',
    middleNames: 'string',
    lastName: 'QEMPURK',
    dateOfBirth: '1960-12-03',
    gender: 'Male',
    sexCode: 'string',
    nationalities: 'string',
    currentlyInPrison: 'string',
    latestBookingId: 2,
    latestLocationId: 'OUT',
    latestLocation: 'OUT',
    internalLocation: 'string',
    pncNumber: '333333',
    croNumber: '444444',
    ethnicity: 'White British',
    birthCountry: 'Great Britain',
    religion: 'None',
    convictedStatus: 'string',
    imprisonmentStatus: 'string',
    receptionDate: '19/01/1990',
    maritalStatus: 'M',
    currentWorkingFirstName: 'Ugan',
    currentWorkingLastName: 'Qempurk',
    currentWorkingBirthDate: 'string',
  },
]

router.get('/', (req, res) => {
  const { offenderNo, lastName, firstName } = req.query
  res.send(
    prisoners.filter((prisoner) => {
      if (offenderNo) {
        return offenderNo === prisoner.offenderNo
      }
      if (lastName) {
        if (!firstName) {
          return lastName.toString().toUpperCase() === prisoner.lastName.toUpperCase()
        }
        return (
          lastName === prisoner.lastName.toUpperCase() &&
          prisoner.firstName.toUpperCase().includes(firstName.toString())
        )
      }
      return undefined
    })
  )
})

module.exports = router
