const nock = require('nock')
const signInService = require('../../server/authentication/signInService')
const config = require('../../server/config')

describe('signInService', () => {
  let fakeOauth
  let service
  let clock
  let in15Mins

  beforeEach(() => {
    fakeOauth = nock(`${config.nomis.authUrl}`)
    service = signInService()
    clock = sinon.useFakeTimers(new Date('May 31, 2018 12:00:00').getTime())
    in15Mins = new Date('May 31, 2018 12:15:00').getTime()
  })

  afterEach(() => {
    nock.cleanAll()
    clock.restore()
  })

  describe('getRefreshedToken', () => {
    it('should get and return new token using refresh token when not RO', async () => {
      fakeOauth.post(`/oauth/token`, 'grant_type=refresh_token&refresh_token=refresh').reply(200, {
        token_type: 'type',
        access_token: 'token',
        refresh_token: 'refreshed',
        expires_in: '1200',
      })

      const newToken = await service.getRefreshedToken({ username: 'un', role: 'CA', refreshToken: 'refresh' })

      expect(newToken).to.be.eql({ refreshToken: 'refreshed', refreshTime: in15Mins, token: 'token' })
    })
  })
})
