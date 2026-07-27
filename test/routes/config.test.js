describe('hdcInCvlNationalRoleOut Config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const loadConfig = () => {
    let config

    jest.isolateModules(() => {
      // eslint-disable-next-line global-require
      config = require('../../server/config').default
    })

    if (!config) {
      throw new Error('Config was not loaded')
    }

    return /** @type {any} */ (config)
  }

  it('should be active when the rollout date is in the past', () => {
    // Given
    process.env.HDC_IN_CVL_NATIONAL_ROLE_OUT_DATE = '2000-01-01'

    // When
    const config = loadConfig()

    // Then
    expect(config.hdcInCvlNationalRoleOut.isActive()).toBe(true)
  })

  it('should not be active when the rollout date is in the future', () => {
    // Given
    process.env.HDC_IN_CVL_NATIONAL_ROLE_OUT_DATE = '2999-01-01'

    // When
    const config = loadConfig()

    // Then
    expect(config.hdcInCvlNationalRoleOut.isActive()).toBe(false)
  })

  it('should have a null and not enabled roleOutDate when the env var is not set', () => {
    // Given
    delete process.env.HDC_IN_CVL_NATIONAL_ROLE_OUT_DATE

    // When
    const config = loadConfig()

    // Then
    expect(config.hdcInCvlNationalRoleOut.dateObj).toBeNull()
    expect(config.hdcInCvlNationalRoleOut.isActive()).toBe(false)
  })

  it('should have a null and not enabled when the env var is not a date', () => {
    // Given
    process.env.HDC_IN_CVL_NATIONAL_ROLE_OUT_DATE = 'some-invalid-date'

    // When
    const config = loadConfig()

    // Then
    expect(config.hdcInCvlNationalRoleOut.dateObj).toBeNull()
    expect(config.hdcInCvlNationalRoleOut.isActive()).toBe(false)
  })

  it('should be active when the rollout date is today', () => {
    // Given
    const [today] = new Date().toISOString().split('T')
    process.env.HDC_IN_CVL_NATIONAL_ROLE_OUT_DATE = today

    // When
    const config = loadConfig()

    // Then
    expect(config.hdcInCvlNationalRoleOut.isActive()).toBe(true)
  })
})

describe('progressionModelPolicyStartDate Config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const loadConfig = () => {
    let config

    jest.isolateModules(() => {
      // eslint-disable-next-line global-require
      config = require('../../server/config').default
    })

    if (!config) {
      throw new Error('Config was not loaded')
    }

    return /** @type {any} */ (config)
  }

  it('should be active when the policy start date is in the past', () => {
    // Given
    process.env.PROGRESSION_MODEL_POLICY_START_DATE = '2000-01-01'

    // When
    const config = loadConfig()

    // Then
    expect(config.progressionModelPolicyStartDate.isActive()).toBe(true)
  })

  it('should not be active when the policy start date is in the future', () => {
    // Given
    process.env.PROGRESSION_MODEL_POLICY_START_DATE = '2999-01-01'

    // When
    const config = loadConfig()

    // Then
    expect(config.progressionModelPolicyStartDate.isActive()).toBe(false)
  })

  it('should have a null and not enabled when the env var is not set', () => {
    // Given
    delete process.env.PROGRESSION_MODEL_POLICY_START_DATE

    // When
    const config = loadConfig()

    // Then
    expect(config.progressionModelPolicyStartDate.dateObj).toBeNull()
    expect(config.progressionModelPolicyStartDate.isActive()).toBe(false)
  })

  it('should have a null and not enabled when the env var is not a valid date', () => {
    // Given
    process.env.PROGRESSION_MODEL_POLICY_START_DATE = 'invalid-date'

    // When
    const config = loadConfig()

    // Then
    expect(config.progressionModelPolicyStartDate.dateObj).toBeNull()
    expect(config.progressionModelPolicyStartDate.isActive()).toBe(false)
  })

  it('should be active when the policy start date is today', () => {
    // Given
    const [today] = new Date().toISOString().split('T')
    process.env.PROGRESSION_MODEL_POLICY_START_DATE = today

    // When
    const config = loadConfig()

    // Then
    expect(config.progressionModelPolicyStartDate.isActive()).toBe(true)
  })
})
