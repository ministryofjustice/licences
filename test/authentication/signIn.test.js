const nock = require('nock')
const signInService = require('../../server/authentication/signInService')
const config = require('../../server/config')

describe('signInService', () => {
  let fakeOauth
  let service
  let in15Mins
  let realDateNow

  beforeEach(() => {
    fakeOauth = nock(`${config.nomis.authUrl}`)
    service = signInService()
    in15Mins = new Date('May 31, 2018 12:15:00').getTime()
    realDateNow = Date.now.bind(global.Date)
    const time = new Date('May 31, 2018 12:00:00')
    in15Mins = new Date('May 31, 2018 12:15:00').getTime()
    // @ts-ignore
    global.Date = jest.fn(() => time)
  })

  afterEach(() => {
    nock.cleanAll()
    global.Date.now = realDateNow
  })

  describe('getRefreshedToken', () => {
    test('should get and return new token using refresh token when not RO', async () => {
      fakeOauth.post(`/oauth/token`, 'grant_type=refresh_token&refresh_token=refresh').reply(200, {
        token_type: 'type',
        access_token: 'token',
        refresh_token: 'refreshed',
        expires_in: '1200',
      })

      const newToken = await service.getRefreshedToken({ username: 'un', role: 'CA', refreshToken: 'refresh' })

      expect(newToken).toEqual({ refreshToken: 'refreshed', refreshTime: in15Mins, token: 'token' })
    })
  })

  describe('get client credentials tokens', () => {
    test('should get anonymous client credentials without a username', async () => {
      fakeOauth.post(`/oauth/token`, 'grant_type=client_credentials').reply(200, {
        token_type: 'type',
        access_token: 'token',
        refresh_token: 'refreshed',
        expires_in: '1200',
      })

      const newToken = await service.getAnonymousClientCredentialsTokens()

      expect(newToken).toEqual({ refreshToken: 'refreshed', expiresIn: '1200', token: 'token' })
    })

    test('Authorization header should not be included in error', async () => {
      fakeOauth.post(`/oauth/token`, 'grant_type=client_credentials').reply(401, {})

      try {
        await service.getAnonymousClientCredentialsTokens()
        expect('Unexpected').toEqual('Failure') // Fail if service doesn't throw...
      } catch (e) {
        expect(e.message).toEqual('Unauthorized')
      }
    })

    test('should pass username for regular client credentials token', async () => {
      fakeOauth.post(`/oauth/token`, 'grant_type=client_credentials&username=testuser').reply(200, {
        token_type: 'type',
        access_token: 'token',
        refresh_token: 'refreshed',
        expires_in: '1200',
      })

      const newToken = await service.getClientCredentialsTokens('testuser')

      expect(newToken).toEqual({ refreshToken: 'refreshed', expiresIn: '1200', token: 'token' })
    })
  })
})
