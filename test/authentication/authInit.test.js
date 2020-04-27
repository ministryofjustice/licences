const authInit = require('../../server/authentication/authInit')

describe('strategiesTest', () => {
  let service
  let done

  const signInService = {}
  const userService = {}
  const audit = {}

  beforeEach(() => {
    service = authInit(userService, audit)
    done = jest.fn()
    signInService.getClientCredentialsTokens = jest.fn().mockReturnValue({ token: 'cdt' })
    userService.getUserProfile = jest.fn().mockReturnValue({ name: 'someone', role: 'CA', staffId: 'sid' })
    audit.record = jest.fn()
  })

  describe('init', () => {
    test('should get the user profile from user service', async () => {
      await service.init('t', 'rt', { expires_in: '1200', user_name: 'un' }, {}, done)
      expect(userService.getUserProfile).toHaveBeenCalledWith('t', 'rt', 'un')
    })

    describe('refresh', () => {
      let realDateNow
      let in15Mins

      beforeEach(() => {
        in15Mins = new Date('May 31, 2018 12:15:00').getTime()
        const time = new Date('May 31, 2018 12:00:00')

        realDateNow = Date.now.bind(global.Date)
        // @ts-ignore
        global.Date = jest.fn(() => time)
      })

      afterEach(() => {
        global.Date.now = realDateNow
      })

      test('should call done with the user object if the user is not an RO', async () => {
        await service.init('t', 'rt', { expires_in: '1200', user_name: 'un' }, {}, done)
        expect(done).toHaveBeenCalledWith(null, {
          token: 't',
          refreshToken: 'rt',
          expiresIn: '1200',
          refreshTime: in15Mins,
          staffId: 'sid',
          name: 'someone',
          role: 'CA',
        })
      })
    })

    test('should audit the login', async () => {
      await service.init('t', 'rt', { expires_in: '1200', user_name: 'un' }, {}, done)
      expect(audit.record).toHaveBeenCalledWith('LOGIN', 'sid')
    })

    test('should call done if there is an error obtaining user', async () => {
      userService.getUserProfile.mockRejectedValue({})
      await service.init('t', 'rt', { expires_in: '1200', user_name: 'un' }, {}, done)
      expect(done).toHaveBeenCalledWith(null, false, { message: 'A system error occurred; please try again later' })
    })
  })
})
