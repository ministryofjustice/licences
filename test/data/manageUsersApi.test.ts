import nock from 'nock'
import config from '../../server/config'
import manageUsersApi from '../../server/data/manageUsersApi'
import { unauthorisedError } from '../../server/utils/errors'

describe('manageUsersApi', () => {
  let fakemanageUsers
  let client

  beforeEach(() => {
    fakemanageUsers = nock(`${config.manageUsersApi.apiUrl}`)
    client = manageUsersApi('token')
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getLoggedInUserInfo', () => {
    test('should throw error when no token', () => {
      const badClient = manageUsersApi(undefined)
      return expect(badClient.getLoggedInUserInfo()).rejects.toThrow(unauthorisedError())
    })

    test('should return data from api', async () => {
      fakemanageUsers.get('/users/me').reply(200, { username: 'result' })

      return expect(client.getLoggedInUserInfo()).resolves.toEqual({ username: 'result' })
    })

    test('should reject if api fails', () => {
      fakemanageUsers.get('/users/me').thrice().reply(500)

      return expect(client.getLoggedInUserInfo()).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getUserRoles', () => {
    test('should throw error when no token', () => {
      const badClient = manageUsersApi(undefined)
      return expect(badClient.getUserRoles()).rejects.toThrow(unauthorisedError())
    })

    test('should return data from api', async () => {
      fakemanageUsers.get('/users/me/roles').reply(200, { username: 'result' })

      return expect(client.getUserRoles()).resolves.toEqual({ username: 'result' })
    })

    test('should reject if api fails', () => {
      fakemanageUsers.get('/users/me/roles').thrice().reply(500)

      return expect(client.getUserRoles()).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })
})
