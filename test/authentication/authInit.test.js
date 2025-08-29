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
    signInService.getClientCredentialsTokens = jest.fn().mockReturnValue('cdt')
    userService.getUserProfile = jest.fn().mockReturnValue({ name: 'someone', role: 'CA', staffId: 'sid' })
    audit.record = jest.fn()
  })

  describe('init', () => {
    test('should get the user profile from user service', async () => {
      await service.init('t', null, { expires_in: '1200', user_name: 'un' }, {}, done)
      expect(userService.getUserProfile).toHaveBeenCalledWith('t', 'un')
    })

    test('should audit the login', async () => {
      await service.init('t', null, { expires_in: '1200', user_name: 'un' }, {}, done)
      expect(audit.record).toHaveBeenCalledWith('LOGIN', 'sid')
    })

    test('should call done if there is an error obtaining user', async () => {
      userService.getUserProfile.mockRejectedValue({})
      await service.init('t', null, { expires_in: '1200', user_name: 'un' }, {}, done)
      expect(done).toHaveBeenCalledWith(null, false, { message: 'A system error occurred; please try again later' })
    })
  })
})
