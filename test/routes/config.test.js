describe('hdcInCvlNationalRoleOut Config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should be active when the rollout date is in the past', () => {
    // Given
    process.env.HDC_IN_CVL_NATIONAL_ROLE_OUT_DATE = '2000-01-01'

    // When
    const config = require('../../server/config').default

    // Then
    expect(config.hdcInCvlNationalRoleOut.isActive()).toBe(true)
  })

  it('should not be active when the rollout date is in the future', () => {
    // Given
    process.env.HDC_IN_CVL_NATIONAL_ROLE_OUT_DATE = '2999-01-01'

    // When
    const config = require('../../server/config').default

    // Then
    expect(config.hdcInCvlNationalRoleOut.isActive()).toBe(false)
  })

  it('should have a null and not enabled roleOutDate when the env var is not set', () => {
    // Given
    delete process.env.HDC_IN_CVL_NATIONAL_ROLE_OUT_DATE

    // When
    const config = require('../../server/config').default

    // Then
    expect(config.hdcInCvlNationalRoleOut.roleOutDate).toBeNull()
    expect(config.hdcInCvlNationalRoleOut.isActive()).toBe(false)
  })

  it('should have a null and not enabled when the env var is not a date', () => {
    // Given
    process.env.HDC_IN_CVL_NATIONAL_ROLE_OUT_DATE = 'some-invalid-date'

    // When
    const config = require('../../server/config').default

    // Then
    expect(config.hdcInCvlNationalRoleOut.roleOutDate).toBeNull()
    expect(config.hdcInCvlNationalRoleOut.isActive()).toBe(false)
  })

  it('should be active when the rollout date is today', () => {
    // Given
    process.env.HDC_IN_CVL_NATIONAL_ROLE_OUT_DATE = new Date().toISOString().split('T')[0]

    // When
    const config = require('../../server/config').default

    // Then
    expect(config.hdcInCvlNationalRoleOut.isActive()).toBe(true)
  })
})