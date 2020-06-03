const nock = require('nock')

const config = require('../../server/config')
const { buildRestClient, clientCredentialsTokenSource } = require('../../server/data/restClientBuilder')
const { createDeliusClient } = require('../../server/data/deliusClient')

describe('deliusClient', () => {
  let fakeDelius
  let deliusClient
  let signInService

  beforeEach(() => {
    fakeDelius = nock(`${config.delius.apiUrl}${config.delius.apiPrefix}`)
    signInService = {
      getAnonymousClientCredentialsTokens: jest.fn().mockResolvedValue({ token: 'token' }),
    }
    const restClient = buildRestClient(
      clientCredentialsTokenSource(signInService, 'delius'),
      `${config.delius.apiUrl}${config.delius.apiPrefix}`,
      'Delius community API',
      { timeout: config.delius.timeout, agent: config.delius.agent }
    )
    deliusClient = createDeliusClient(restClient)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('deliusClient', () => {
    test('should throw error on GET when no token', () => {
      signInService.getAnonymousClientCredentialsTokens.mockReturnValue(null)
      return expect(deliusClient.getROPrisoners('1')).rejects.toThrow('Error obtaining OAuth token')
    })
  })

  describe('getStaffByStaffCode', () => {
    test('should return data from api', () => {
      fakeDelius.get(`/staff/staffCode/1`).reply(200, { key: 'value' })

      return expect(deliusClient.getStaffDetailsByStaffCode('1')).resolves.toStrictEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeDelius.get(`/staff/staffCode/1`).thrice().reply(500, '1')

      return expect(deliusClient.getStaffDetailsByStaffCode('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getStaffByUsername', () => {
    test('should return data from api', () => {
      fakeDelius.get(`/staff/username/1`).reply(200, { key: 'value' })

      return expect(deliusClient.getStaffDetailsByUsername('1')).resolves.toStrictEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeDelius.get(`/staff/username/1`).thrice().reply(500)

      return expect(deliusClient.getStaffDetailsByUsername('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getROPrisoners', () => {
    test('should return data from api', () => {
      fakeDelius.get(`/staff/staffCode/1/managedOffenders`).reply(200, { key: 'value' })

      return expect(deliusClient.getROPrisoners('1')).resolves.toStrictEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeDelius.get(`/staff/staffCode/1/managedOffenders`).thrice().reply(500)

      return expect(deliusClient.getROPrisoners('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getAllOffenderManagers', () => {
    test('should return data from api', () => {
      fakeDelius.get(`/offenders/nomsNumber/1/allOffenderManagers`).reply(200, [{ key: 'value' }])

      return expect(deliusClient.getAllOffenderManagers('1')).resolves.toStrictEqual([{ key: 'value' }])
    })

    test('should return undefined when not found', () => {
      fakeDelius.get(`/offenders/nomsNumber/1/allOffenderManagers`).reply(404)

      return expect(deliusClient.getAllOffenderManagers('1')).resolves.toBeUndefined()
    })

    test('should reject if api fails', () => {
      fakeDelius.get(`/offenders/nomsNumber/1/allOffenderManagers`).thrice().reply(500)

      return expect(deliusClient.getAllOffenderManagers('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getAllProbationAreas', () => {
    test('should return list of all probation areas', () => {
      fakeDelius
        .get(`/probationAreas?excludeEstablishments=true&active=true`)
        .reply(200, [{ code: 'some code', description: 'some description' }])

      return expect(deliusClient.getAllProbationAreas()).resolves.toStrictEqual([
        { code: 'some code', description: 'some description' },
      ])
    })
  })

  describe('getAllLdusForProbationArea', () => {
    test('should return list of all probation codes', () => {
      fakeDelius
        .get(`/probationAreas/code/N02/localDeliveryUnits`)
        .reply(200, { content: [{ code: 'some code', description: 'some description' }] })

      return expect(deliusClient.getAllLdusForProbationArea('N02')).resolves.toStrictEqual({
        content: [{ code: 'some code', description: 'some description' }],
      })
    })

    test('Probation code not known to Delius', () => {
      fakeDelius.get(`/probationAreas/code/N02/localDeliveryUnits`).reply(404)

      return expect(deliusClient.getAllLdusForProbationArea('N02')).resolves.toStrictEqual({ content: [] })
    })
  })

  describe('getAllTeamsForLdu', () => {
    test('should return list of all probation codes', () => {
      fakeDelius
        .get('/probationAreas/code/N02/localDeliveryUnits/code/LDU/teams')
        .reply(200, { content: [{ code: 'some code', description: 'some description' }] })

      return expect(deliusClient.getAllTeamsForLdu('N02', 'LDU')).resolves.toStrictEqual({
        content: [{ code: 'some code', description: 'some description' }],
      })
    })

    test('LDU not known to Delius: 200, but no "content" field', () => {
      fakeDelius.get('/probationAreas/code/N02/localDeliveryUnits/code/LDU/teams').reply(200, {
        pageable: 'INSTANCE',
        totalElements: 0,
        last: true,
        totalPages: 1,
        sort: {
          sorted: false,
          unsorted: true,
          empty: true,
        },
        first: true,
        number: 0,
        size: 0,
        numberOfElements: 0,
        empty: true,
      })

      return expect(deliusClient.getAllTeamsForLdu('N02', 'LDU')).resolves.toStrictEqual({ content: [] })
    })

    test('LDU not known to Delius: 404', () => {
      fakeDelius.get('/probationAreas/code/N02/localDeliveryUnits/code/LDU/teams').reply(404)

      return expect(deliusClient.getAllTeamsForLdu('N02', 'LDU')).resolves.toStrictEqual({ content: [] })
    })
  })

  describe('addResponsbileOfficerRole', () => {
    test('should return data from api', () => {
      fakeDelius.put(`/users/bobUser/roles/${config.delius.responsibleOfficerRoleId}`).reply(200)

      // The only place where addResponsibleOfficerRole is used is in roNotificationHandler.assignDeliusRoRole
      // The assignDeliusRoRole function ignores the return value.
      return expect(deliusClient.addResponsibleOfficerRole('bobUser')).resolves.toBeUndefined()
    })

    test('should ignore errors', () => {
      fakeDelius.put(`/users/bobUser/roles/${config.delius.responsibleOfficerRoleId}`).reply(500)

      return expect(deliusClient.addResponsibleOfficerRole('bobUser')).resolves.toBeUndefined()
    })
  })
})
