const express = require('express')
const jwtDecode = require('jwt-decode')

const router = express.Router()
const profiles = {
  CA: {
    name: 'Catherine Amos',
    username: 'CA_USER_TEST',
    email: 'CA-DEMO@work',
    activeCaseLoadId: 'BEL',
  },
  RO: {
    name: 'Ryan Orton',
    username: 'AUTH_RO_USER_TEST',
    email: 'RO_USER@work',
  },
  DM: {
    name: 'Diane Matthews',
    username: 'DM_USER_TEST',
    email: 'DM_USER@work',
    activeCaseLoadId: 'BEL',
  },
  NOMIS: {
    nomis: 'Norman Bates',
    username: 'NOMIS_BATCHLOAD',
    email: 'BATCHLOAD_USER@work',
    activeCaseLoadId: 'BEL',
  },
  NONE: {
    name: 'Norman Bates',
    username: 'NONE',
    email: 'BATCHLOAD_USER@work',
    activeCaseLoadId: 'BEL',
  },
}

const roles = {
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
}

const findFirstFromToken = (token, roleHash) => {
  // Authorization expected to be of form 'Bearer x'
  const accessToken = token.split(' ')[1]
  try {
    // try for a real jwt to get the roles from
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

module.exports = router
