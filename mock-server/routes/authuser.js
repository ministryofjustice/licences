const express = require('express')
/** @type {any} */
const { jwtDecode } = require('jwt-decode')

const router = express.Router()
const profiles = {
  CA_RO_DM: {
    name: 'Wuror Gul',
    username: 'CA_RO_DM_USER',
    email: 'CARODM@work',
    activeCaseLoadId: 'BEL',
    authSource: 'nomis',
  },
  CA: {
    name: 'Kamak Haz',
    username: 'CA_USER_TEST',
    email: 'CA-DEMO@work',
    activeCaseLoadId: 'BEL',
    authSource: 'nomis',
  },
  RO: {
    name: 'Oshust Hanten',
    username: 'AUTH_RO_USER_TEST',
    email: 'RO_USER@work',
    authSource: 'nomis',
  },
  DM: {
    name: 'Hekowo Fann',
    username: 'DM_USER_TEST',
    email: 'DM_USER@work',
    activeCaseLoadId: 'BEL',
    authSource: 'nomis',
  },
  NOMIS: {
    name: 'Nawo Mrorann',
    username: 'NOMIS_BATCHLOAD',
    email: 'BATCHLOAD_USER@work',
    activeCaseLoadId: 'BEL',
  },
  NONE: {
    name: 'Nawo Mrorann',
    username: 'NONE',
    email: 'BATCHLOAD_USER@work',
    activeCaseLoadId: 'BEL',
  },
  READONLY: {
    name: 'Licence Only',
    username: 'LICENCE_READONLY',
    email: 'LICENCE_READONLY@work',
    activeCaseLoadId: 'BEL',
  },
}

const roles = {
  CA_RO_DM: [
    {
      roleCode: 'LICENCE_CA',
    },
    {
      roleCode: 'LICENCE_RO',
    },
    {
      roleCode: 'LICENCE_DM',
    },
  ],
  CA: [
    {
      roleCode: 'LICENCE_CA',
    },
  ],
  RO: [
    {
      roleCode: 'LICENCE_RO',
    },
  ],
  DM: [
    {
      roleCode: 'LICENCE_DM',
    },
  ],
  NOMIS: [
    {
      roleCode: 'NOMIS_BATCHLOAD',
    },
  ],
  NONE: [],
  READONLY: [
    {
      roleCode: 'LICENCE_READONLY',
    },
  ],
}

const findFirstFromToken = (token, roleHash) => {
  // Authorization expected to be of form 'Bearer x'
  const accessToken = token.split(' ')[1]
  try {
    // try for a real jwt to get the roles from
    /** @type {any} */
    const jwt = jwtDecode(accessToken)
    const found = Object.entries(roleHash).find(([key, _]) => jwt.user_name.includes(key))
    return found ? found[1] : undefined
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
router.get('/users/me', (req, res) => {
  const profile = getProfile(req.headers.authorization)
  res.send(profile)
})

router.get('/users/me/roles', (req, res) => {
  const role = getRoleCode(req.headers.authorization)
  res.send(role)
})

module.exports = router
