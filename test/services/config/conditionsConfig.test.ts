
describe('conditionsConfig', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const loadConditionsConfig = () => {
    let config

    jest.isolateModules(() => {
      // eslint-disable-next-line global-require
      config = require('../../../server/config')
    })

    return config.default
  }

  describe('standardConditions changing based on progressionModelPolicyStartDate', () => {

    it('should use v2 standard conditions when policy date not set', () => {
      delete process.env.PROGRESSION_MODEL_POLICY_START_DATE
      const config = loadConditionsConfig()

      expect(config.progressionModelPolicyStartDate.isActive()).toBe(false)
    })

    it('should use v2 standard conditions when policy date is in the future', () => {
      process.env.PROGRESSION_MODEL_POLICY_START_DATE = '2999-01-01'
      const config = loadConditionsConfig()

      expect(config.progressionModelPolicyStartDate.isActive()).toBe(false)
    })


    it('should use v4 standard conditions when policy date is in the past', () => {
      process.env.PROGRESSION_MODEL_POLICY_START_DATE = '2000-01-01'
      const config = loadConditionsConfig()

      expect(config.progressionModelPolicyStartDate.isActive()).toBe(true)
    })

    it('should use v4 standard conditions when policy date is today', () => {
      const [today] = new Date().toISOString().split('T')
      process.env.PROGRESSION_MODEL_POLICY_START_DATE = today
      const config = loadConditionsConfig()
      expect(config.progressionModelPolicyStartDate.isActive()).toBe(true)
    })
  })
})
