import nock from 'nock'
import SignInService from '../../server/authentication/signInService'
import config from '../../server/config'
import TokenStore from '../../server/data/tokenStore'

jest.mock('../../server/data/tokenStore')

describe('signInService', () => {
  let fakeOauth
  let service
  let in15Mins
  let realDateNow

  let tokenStore = new TokenStore(null) as jest.Mocked<TokenStore>

  beforeEach(() => {
    fakeOauth = nock(`${config.nomis.authUrl}`)
    service = new SignInService(tokenStore)
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
    tokenStore.getToken.mockReset()
    tokenStore.setToken.mockReset()
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

      expect(newToken).toEqual('token')

      expect(tokenStore.getToken).toHaveBeenCalledWith('%ANONYMOUS%')
      expect(tokenStore.setToken).toHaveBeenCalledWith('%ANONYMOUS%', 'token', 1140)
    })

    test('Authorization header should not be included in error', async () => {
      fakeOauth.post(`/oauth/token`, 'grant_type=client_credentials').reply(401, {})

      try {
        await service.getAnonymousClientCredentialsTokens()
        expect('Unexpected').toEqual('Failure') // Fail if service doesn't throw...
      } catch (e) {
        expect(e.message).toEqual('Unauthorised access')
        expect(e.status).toEqual(401)
      }
    })

    test('when cached should not query auth for anonymous client creds', async () => {
      tokenStore.getToken.mockResolvedValue('token-2')

      const newToken = await service.getAnonymousClientCredentialsTokens()

      expect(newToken).toEqual('token-2')

      expect(tokenStore.getToken).toHaveBeenCalledWith('%ANONYMOUS%')
      expect(tokenStore.setToken).not.toHaveBeenCalled()
    })

    test('should pass username for regular client credentials token', async () => {
      fakeOauth.post(`/oauth/token`, 'grant_type=client_credentials&username=testuser').reply(200, {
        token_type: 'type',
        access_token: 'token',
        refresh_token: 'refreshed',
        expires_in: '1200',
      })

      const newToken = await service.getClientCredentialsTokens('testuser')

      expect(newToken).toEqual('token')

      expect(tokenStore.getToken).toHaveBeenCalledWith('testuser')
      expect(tokenStore.setToken).toHaveBeenCalledWith('testuser', 'token', 1140)
    })

    test('when cached should not query auth for client creds', async () => {
      tokenStore.getToken.mockResolvedValue('token-2')

      const newToken = await service.getClientCredentialsTokens('testuser')

      expect(newToken).toEqual('token-2')

      expect(tokenStore.getToken).toHaveBeenCalledWith('testuser')
      expect(tokenStore.setToken).not.toHaveBeenCalled()
    })
  })
})
