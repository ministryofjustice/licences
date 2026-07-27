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
    jest.isolateModules(() => {
      delete require.cache[require.resolve('../../../server/config')]
      delete require.cache[require.resolve('../../../server/services/config/conditionsConfig')]
    })
    // eslint-disable-next-line global-require
    return require('../../../server/services/config/conditionsConfig')
  }

  describe('standardConditions changing based on progressionModelPolicyStartDate', () => {
    it('should use v2 standard conditions when policy date not set', () => {
      delete process.env.PROGRESSION_MODEL_POLICY_START_DATE

      const { standardConditions } = loadConditionsConfig()

      expect(standardConditions).toHaveLength(9)
      expect(standardConditions[0].text).toContain('Be of good behaviour')
    })

    it('should use v2 standard conditions when policy date is in the future', () => {
      process.env.PROGRESSION_MODEL_POLICY_START_DATE = '2999-01-01'

      const { standardConditions } = loadConditionsConfig()

      expect(standardConditions).toHaveLength(9)
      expect(standardConditions[0].text).toContain('Be of good behaviour')
    })

    it('should use v4 standard conditions when policy date is in the past', () => {
      process.env.PROGRESSION_MODEL_POLICY_START_DATE = '2000-01-01'

      const { standardConditions } = loadConditionsConfig()

      expect(standardConditions).toHaveLength(8)
      expect(standardConditions[0].text).toContain('Behave well in a way that supports')
    })

    it('should use v4 standard conditions when policy date is today', () => {
      const [today] = new Date().toISOString().split('T')
      process.env.PROGRESSION_MODEL_POLICY_START_DATE = today

      const { standardConditions } = loadConditionsConfig()

      expect(standardConditions).toHaveLength(8)
      expect(standardConditions[0].text).toContain('Behave well in a way that supports')
    })
  })
})
