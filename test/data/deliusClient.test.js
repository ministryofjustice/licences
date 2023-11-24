const nock = require('nock')

const config = require('../../server/config')
const { buildRestClient, clientCredentialsTokenSource } = require('../../server/data/restClientBuilder')
const { DeliusClient } = require('../../server/data/deliusClient')
const SignInService = require('../../server/authentication/signInService')

jest.mock('../../server/authentication/signInService')

describe('deliusClient', () => {
  let fakeDelius
  let deliusClient
  let signInService

  beforeEach(() => {
    fakeDelius = nock(config.delius.apiUrl)
    signInService = new SignInService(null)
    signInService.getAnonymousClientCredentialsTokens = jest.fn().mockResolvedValue('token')
    const restClient = buildRestClient(
      clientCredentialsTokenSource(signInService, 'delius'),
      config.delius.apiUrl,
      'Delius Integration API',
      { timeout: config.delius.timeout, agent: config.delius.agent }
    )
    deliusClient = new DeliusClient(restClient)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('deliusClient', () => {
    test('should throw error on GET when no token', () => {
      signInService.getAnonymousClientCredentialsTokens.mockReturnValue(null)
      return expect(deliusClient.getManagedPrisonerIdsByStaffId(1)).rejects.toThrow('Error obtaining OAuth token')
    })
  })

  describe('getStaffBystaffIdentifier', () => {
    test('should return data from api', () => {
      fakeDelius.get(`/staff?id=1`).reply(200, { key: 'value' })

      return expect(deliusClient.getStaffDetailsByStaffIdentifier(1)).resolves.toStrictEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeDelius.get(`/staff?id=1`).thrice().reply(500, '1')

      return expect(deliusClient.getStaffDetailsByStaffIdentifier(1)).rejects.toStrictEqual(
        Error('Internal Server Error')
      )
    })
  })

  describe('getStaffByUsername', () => {
    test('should return data from api', () => {
      fakeDelius.get(`/staff?username=1`).reply(200, { key: 'value' })

      return expect(deliusClient.getStaffDetailsByUsername('1')).resolves.toStrictEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeDelius.get(`/staff?username=1`).thrice().reply(500)

      return expect(deliusClient.getStaffDetailsByUsername('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getROPrisoners', () => {
    test('should return data from api', () => {
      fakeDelius.get(`/managedPrisonerIds?staffId=1`).reply(200, { key: 'value' })

      return expect(deliusClient.getManagedPrisonerIdsByStaffId(1)).resolves.toStrictEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeDelius.get(`/managedPrisonerIds?staffId=1`).thrice().reply(500)

      return expect(deliusClient.getManagedPrisonerIdsByStaffId(1)).rejects.toStrictEqual(
        Error('Internal Server Error')
      )
    })
  })

  describe('getAllOffenderManagers', () => {
    test('should return data from api', () => {
      fakeDelius.get(`/case/1/communityManager`).reply(200, [{ key: 'value' }])

      return expect(deliusClient.getCommunityManager('1')).resolves.toStrictEqual([{ key: 'value' }])
    })

    test('should return undefined when not found', () => {
      fakeDelius.get(`/case/1/communityManager`).reply(404)

      return expect(deliusClient.getCommunityManager('1')).resolves.toBeUndefined()
    })

    test('should reject if api fails', () => {
      fakeDelius.get(`/case/1/communityManager`).thrice().reply(500)

      return expect(deliusClient.getCommunityManager('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getAllProbationAreas', () => {
    test('should return list of all probation areas', () => {
      fakeDelius.get(`/providers`).reply(200, [{ code: 'some code', description: 'some description' }])

      return expect(deliusClient.getAllProbationAreas()).resolves.toStrictEqual([
        { code: 'some code', description: 'some description' },
      ])
    })
  })

  describe('getAllLdusForProbationArea', () => {
    test('should return list of all probation codes', () => {
      fakeDelius.get(`/providers/N02`).reply(200, { content: [{ code: 'some code', description: 'some description' }] })

      return expect(deliusClient.getProbationArea('N02')).resolves.toStrictEqual({
        content: [{ code: 'some code', description: 'some description' }],
      })
    })

    test('Probation code not known to Delius', () => {
      fakeDelius.get(`/providers/N02`).reply(404)

      return expect(deliusClient.getProbationArea('N02')).resolves.toStrictEqual({ localAdminUnits: [] })
    })
  })

  describe('getAllTeamsForLdu', () => {
    test('should return list of all probation codes', () => {
      fakeDelius
        .get('/providers/N02/localAdminUnits/LDU')
        .reply(200, { localAdminUnits: [{ code: 'some code', description: 'some description' }] })

      return expect(deliusClient.getLduWithTeams('N02', 'LDU')).resolves.toStrictEqual({
        localAdminUnits: [{ code: 'some code', description: 'some description' }],
      })
    })

    test('LDU not known to Delius: 404', () => {
      fakeDelius.get('/providers/N02/localAdminUnits/LDU').reply(404)

      return expect(deliusClient.getLduWithTeams('N02', 'LDU')).resolves.toStrictEqual({ teams: [] })
    })
  })

  describe('addResponsbileOfficerRole', () => {
    test('should return data from api', () => {
      fakeDelius.put(`/users/bobUser/roles/${config.delius.responsibleOfficerRoleId}`).reply(200)

      return expect(deliusClient.addResponsibleOfficerRole('bobUser')).resolves.toBeUndefined()
    })

    test('should ignore errors', () => {
      fakeDelius.put(`/users/bobUser/roles/${config.delius.responsibleOfficerRoleId}`).reply(500)

      return expect(deliusClient.addResponsibleOfficerRole('bobUser')).resolves.toBeUndefined()
    })
  })

  describe('addRole', () => {
    test('should return data from api', () => {
      fakeDelius.put(`/users/bobUser/roles/CODE-1`).reply(200)

      return expect(deliusClient.addRole('bobUser', 'CODE-1')).resolves.toBeUndefined()
    })

    test('should ignore errors', () => {
      fakeDelius.put(`/users/bobUser/roles/CODE-1`).reply(500)

      return expect(deliusClient.addRole('bobUser', 'CODE-1')).resolves.toBeUndefined()
    })
  })

  describe('getUser', () => {
    test('should return data from api', () => {
      fakeDelius.get(`/users/bobUser/details`).reply(200, { username: 'aaa' })

      return expect(deliusClient.getUser('bobUser')).resolves.toStrictEqual({ username: 'aaa' })
    })
  })
})
