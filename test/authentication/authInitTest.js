const authInit = require('../../server/authentication/authInit')

describe('strategiesTest', () => {
  let service
  let done
  let clock
  let in15Mins

  const signInService = {}
  const userService = {}
  const audit = {}

  beforeEach(() => {
    service = authInit(userService, audit)
    done = sinon.stub()
    signInService.getClientCredentialsTokens = sinon.stub().resolves({ token: 'cdt' })
    userService.getUserProfile = sinon.stub().resolves({ name: 'someone', role: 'CA', staffId: 'sid' })
    audit.record = sinon.stub()
    clock = sinon.useFakeTimers(new Date('May 31, 2018 12:00:00').getTime())
    in15Mins = new Date('May 31, 2018 12:15:00').getTime()
  })

  afterEach(() => {
    clock.restore()
  })

  describe('init', () => {
    it('should get the user profile from user service', async () => {
      await service.init('t', 'rt', { expires_in: '1200', user_name: 'un' }, {}, done)
      expect(userService.getUserProfile).to.be.calledOnce()
      expect(userService.getUserProfile).to.be.calledWith('t', 'rt', 'un')
    })

    it('should call done with the user object if the user is not an RO', async () => {
      await service.init('t', 'rt', { expires_in: '1200', user_name: 'un' }, {}, done)
      expect(done).to.be.calledOnce()
      expect(done).to.be.calledWith(null, {
        token: 't',
        refreshToken: 'rt',
        expiresIn: '1200',
        refreshTime: in15Mins,
        staffId: 'sid',
        name: 'someone',
        role: 'CA',
      })
    })

    it('should audit the login', async () => {
      await service.init('t', 'rt', { expires_in: '1200', user_name: 'un' }, {}, done)
      expect(audit.record).to.be.calledOnce()
      expect(audit.record).to.be.calledWith('LOGIN', 'sid')
    })

    it('should call done if there is an error obtaining user', async () => {
      userService.getUserProfile.rejects()
      await service.init('t', 'rt', { expires_in: '1200', user_name: 'un' }, {}, done)
      expect(done).to.be.calledOnce()
      expect(done).to.be.calledWith(null, false, { message: 'A system error occurred; please try again later' })
    })
  })
})
