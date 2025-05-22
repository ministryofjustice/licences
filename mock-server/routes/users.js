const express = require('express')
const { jwtDecode } = require('jwt-decode')

const router = express.Router()
const profiles = {
  CA: {
    firstName: 'Kamak',
    lastName: 'Haz',
    staffId: '100',
    email: 'CA-DEMO@work',
    activeCaseLoadId: 'BEL',
  },
  RO: {
    firstName: 'Oshust',
    lastName: 'Hanten',
    staffId: '1',
    email: 'RO_USER@work',
    activeCaseLoadId: 'BEL',
  },
  DM: {
    firstName: 'Hekowo',
    lastName: 'Fann',
    staffId: '3',
    email: 'DM_USER@work',
    activeCaseLoadId: 'BEL',
  },
  NOMIS: {
    firstName: 'Nawo',
    lastName: 'Mrorann',
    staffId: '4',
    email: 'BATCHLOAD_USER@work',
    activeCaseLoadId: 'BEL',
  },
  NONE: {
    firstName: 'Nawo',
    lastName: 'Mrorann',
    staffId: '4',
    email: 'BATCHLOAD_USER@work',
    activeCaseLoadId: 'BEL',
  },
}

const roles = {
  CA: [
    {
      roleCode: 'LEI_LICENCE_CA',
    },
    {
      roleCode: 'LICENCE_RO',
    },
    {
      roleCode: 'LEI_LICENCE_DM',
    },
  ],
  RO: [
    {
      roleId: 0,
      roleName: 'string',
      roleCode: 'LEI_LICENCE_RO',
      parentRoleCode: 'string',
    },
    {
      roleId: 0,
      roleName: 'string',
      roleCode: 'LICENCE_RO',
      parentRoleCode: 'string',
    },
  ],
  DM: [
    {
      roleId: 0,
      roleName: 'string',
      roleCode: 'LEI_LICENCE_DM',
      parentRoleCode: 'string',
    },
  ],
  NOMIS: [
    {
      roleCode: 'NOMIS_BATCHLOAD',
    },
  ],
  NONE: [],
}

const findFirstFromToken = (token, roleHash) => {
  // Authorization expected to be of form 'Bearer x'
  const accessToken = token.split(' ')[1]
  try {
    // try for a real jwt to get the roles from
    /** @type {any} */
    const jwt = jwtDecode(accessToken)
    const lookup = jwt.user_name.substring(0, 2)
    return roleHash[lookup]
  } catch (error) {
    // otherwise fallback to a ca_token, ro_token, dm_token
    const lookup = accessToken.substring(0, accessToken.indexOf('_'))
    return roleHash[lookup]
  }
}

const getRoleCode = (token) => {
  const roleCode = findFirstFromToken(token, roles)
  return roleCode || []
}

const getProfile = (token) => findFirstFromToken(token, profiles)

router.get('/me', (req, res) => {
  const profile = getProfile(req.headers.authorization)
  res.send(profile)
})

router.get('/me/roles', (req, res) => {
  const role = getRoleCode(req.headers.authorization)
  res.send(role)
})

router.get('/me/caseLoads', (req, res) => {
  res.send([
    {
      caseLoadId: 'DEF',
      description: 'Askham Grange',
      type: 'string',
      caseloadFunction: 'string',
    },
    {
      caseLoadId: 'BEL',
      description: 'Belmarsh',
      type: 'string',
      caseloadFunction: 'string',
      currentlyActive: true,
    },
  ])
})

router.put('/me/activeCaseLoad', (req, res) => {
  res.send({
    caseLoadId: req.body.caseLoadId,
  })
})

module.exports = router
