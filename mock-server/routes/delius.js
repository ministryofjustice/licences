const express = require('express')
const probationAreas = require('./stubs/probationAreas')

const teamC01T04 = {
  code: 'C01T04',
  description: 'OMU A',
  telephone: '01234567890',
  localAdminUnit: { code: 'ABC124', description: 'ABC124 delivery unit' },
}

const deliusTeams = [teamC01T04]

const AUTH_RO_USER_TEST = {
  username: 'AUTH_RO_USER_TEST',
  code: 'DELIUS_ID_TEST',
  staffId: 1,
  email: 'hdc_test+RO_USER_TEST@digital.justice.gov.uk',
  name: {
    forenames: 'FIRSTA',
    surname: 'LASTA',
  },
  teams: deliusTeams,
}

const RO_USER_TEST = {
  username: 'RO_USER_TEST',
  code: 'AUTH_DELIUS_ID_TEST',
  staffId: 2,
  email: 'hdc_test+RO_USER_TEST@digital.justice.gov.uk',
  name: {
    forenames: 'FIRSTA',
    surname: 'LASTA',
  },
  teams: deliusTeams,
}

const RO_USER = {
  username: 'RO_USER',
  code: 'DELIUS_ID',
  staffId: 3,
  email: 'hdc_test+RO_USER@digital.justice.gov.uk',
  name: {
    forenames: 'JESSY',
    surname: 'SMITH',
  },
  teams: deliusTeams,
}

const staffDetailsByUsername = {
  AUTH_RO_USER_TEST,
  RO_USER_TEST,
  RO_USER,
}

/*
const staffDetailsByStaffCode = {
  DELIUS_ID_TEST: RO_USER_TEST,
  DELIUS_ID: RO_USER,
}
*/

const staffDetailsByStaffIdentifier = {
  1: AUTH_RO_USER_TEST,
  2: RO_USER_TEST,
  3: RO_USER,
}

const router = express.Router()

router.get('/staff', (req, res) => {
  const { username, id } = req.query
  if (username) {
    const staffDetails = staffDetailsByUsername[username]
    if (staffDetails) {
      res.send(staffDetails)
      return
    }
  } else if (id) {
    const staffDetails = staffDetailsByStaffIdentifier[id]
    if (staffDetails) {
      res.send(staffDetails)
      return
    }
  }
  res.sendStatus(404)
})

/*
router.get('/staff/staffCode/:staffCode', (req, res) => {
  const { staffCode } = req.params
  const staffDetails = staffDetailsByStaffCode[staffCode]
  if (staffDetails) {
    res.send(staffDetails)
  } else {
    res.sendStatus(404)
  }
})

router.get('/staff/staffCode/:staffCode/managedOffenders', (req, res) => {
  const { staffCode } = req.params

  const offenders = [
    {
      staffCode,
      offenderId: 1234567,
      nomsNumber: 'A5001DY',
      crnNumber: 1234567,
      offenderSurname: 'Helkarci',
      isCurrentRo: true,
      isCurrentOm: true,
      isCurrentPom: true,
      omStartDate: '01/01/2001',
      omEndDate: '01/01/2001',
    },
  ]

  res.send(offenders)
})
*/

router.get('/managedPrisonerIds', (req, res) => {
  res.send(['A5001DY'])
})

router.get('/case/:nomsNumber/communityManager', (req, res) => {
  res.send({
    code: 'DELIUS_ID',
    staffId: 2,
    name: { forenames: 'Gripol', surname: 'Mrahi' },
    team: teamC01T04,
    provider: { code: 'ABC', description: 'ABC probation area' },
    localAdminUnit: { code: 'ABC124', description: 'ABC124 delivery unit' },
    isUnallocated: false,
  })
})

router.get('/providers', (req, res) => {
  // return all probation areas
  const allProbationAreas = probationAreas.map((probArea) => ({
    code: probArea.code,
    description: probArea.description,
  }))
  res.send(allProbationAreas)
})

router.get('/providers/:code', (req, res) => {
  // return the LDUs for a specific probation area
  const { code: probationAreaCode } = req.params
  const probationArea = probationAreas.filter((probArea) => probArea.code === probationAreaCode)
  const response = {
    code: probationArea[0].code,
    description: probationArea[0].description,
    localAdminUnits: probationArea[0].ldus,
  }
  res.send(response)
})

module.exports = router
