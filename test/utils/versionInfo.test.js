const versionInfo = require('../../server/utils/versionInfo')

describe('versionInfo', () => {
  describe('allValuesEmpty', () => {
    test('should return approved version details if they exist', () => {
      expect(
        versionInfo({
          version: 1.0,
          versionDetails: { version: 1, vary_version: 0 },
          approvedVersionDetails: { version: 1, vary_version: 0 },
          licence: {},
        }).lastVersion
      ).toEqual({ version: 1, vary_version: 0 })
    })

    test('should return as new version if no approved version', () => {
      expect(
        versionInfo({
          version: 1.0,
          versionDetails: { version: 1, vary_version: 0 },
          approvedVersionDetails: {},
          licence: {},
        }).isNewVersion
      ).toBe(true)
    })

    test('should return as new version if current version is ahead of approved', () => {
      expect(
        versionInfo({
          version: 1.0,
          versionDetails: { version: 2, vary_version: 0 },
          approvedVersionDetails: { version: 1, vary_version: 0 },
          licence: {},
        }).isNewVersion
      ).toBe(true)
    })

    test('should return as new version if current vary_version is ahead of approved', () => {
      expect(
        versionInfo({
          version: 1.0,
          versionDetails: { version: 1, vary_version: 1 },
          approvedVersionDetails: { version: 1, vary_version: 0 },
          licence: {},
        }).isNewVersion
      ).toBe(true)
    })

    test('should return new template label', () => {
      expect(
        versionInfo({
          version: 1.0,
          versionDetails: { version: 1, vary_version: 1 },
          approvedVersionDetails: { version: 1, vary_version: 0 },
          licence: { document: { template: { decision: 'hdc_ap_pss' } } },
        }).templateLabel
      ).toBe('Basic licence with top-up supervision')
    })

    test('should return template label stored on version', () => {
      expect(
        versionInfo({
          version: 1.0,
          versionDetails: { version: 1, vary_version: 1 },
          approvedVersionDetails: { version: 1, vary_version: 0, template: 'hdc_yn' },
          licence: {},
        }).lastTemplateLabel
      ).toBe('Young person’s licence')
    })

    test('should return new template if passed in is different to previous', () => {
      expect(
        versionInfo({
          version: 1.0,
          versionDetails: { version: 1, vary_version: 1 },
          approvedVersionDetails: { version: 1, vary_version: 0, template: 'hdc_yn' },
          licence: {},
        }).isNewTemplate
      ).toBe(true)
    })

    test('should return not new template if passed in is same as previous', () => {
      expect(
        versionInfo({
          version: 1.0,
          versionDetails: { version: 1, vary_version: 1 },
          approvedVersionDetails: { version: 1, vary_version: 0, template: 'hdc_yn' },
          licence: { document: { template: { decision: 'hdc_yn' } } },
        }).isNewTemplate
      ).toBe(false)
    })
  })
})
