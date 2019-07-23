const versionInfo = require('../../server/utils/versionInfo')

describe('versionInfo', () => {
  describe('allValuesEmpty', () => {
    it('should return approved version details if they exist', () => {
      expect(
        versionInfo({
          version: 1.0,
          versionDetails: { version: 1, vary_version: 0 },
          approvedVersionDetails: { version: 1, vary_version: 0 },
        }).lastVersion
      ).to.eql({ version: 1, vary_version: 0 })
    })

    it('should return as new version if no approved version', () => {
      expect(
        versionInfo({
          version: 1.0,
          versionDetails: { version: 1, vary_version: 0 },
          approvedVersionDetails: {},
        }).isNewVersion
      ).to.eql(true)
    })

    it('should return as new version if current version is ahead of approved', () => {
      expect(
        versionInfo({
          version: 1.0,
          versionDetails: { version: 2, vary_version: 0 },
          approvedVersionDetails: { version: 1, vary_version: 0 },
        }).isNewVersion
      ).to.eql(true)
    })

    it('should return as new version if current vary_version is ahead of approved', () => {
      expect(
        versionInfo({
          version: 1.0,
          versionDetails: { version: 1, vary_version: 1 },
          approvedVersionDetails: { version: 1, vary_version: 0 },
        }).isNewVersion
      ).to.eql(true)
    })

    it('should return new template label', () => {
      expect(
        versionInfo(
          {
            version: 1.0,
            versionDetails: { version: 1, vary_version: 1 },
            approvedVersionDetails: { version: 1, vary_version: 0 },
          },
          'hdc_ap_pss'
        ).templateLabel
      ).to.eql('Basic licence with top-up supervision')
    })

    it('should return template label stored on version', () => {
      expect(
        versionInfo(
          {
            version: 1.0,
            versionDetails: { version: 1, vary_version: 1 },
            approvedVersionDetails: { version: 1, vary_version: 0, template: 'hdc_yn' },
          },
          'hdc_ap_pss'
        ).lastTemplateLabel
      ).to.eql('Young person’s licence')
    })

    it('should return new template if passed in is different to previous', () => {
      expect(
        versionInfo(
          {
            version: 1.0,
            versionDetails: { version: 1, vary_version: 1 },
            approvedVersionDetails: { version: 1, vary_version: 0, template: 'hdc_yn' },
          },
          'hdc_ap_pss'
        ).isNewTemplate
      ).to.eql(true)
    })

    it('should return not new template if passed in is same as previous', () => {
      expect(
        versionInfo(
          {
            version: 1.0,
            versionDetails: { version: 1, vary_version: 1 },
            approvedVersionDetails: { version: 1, vary_version: 0, template: 'hdc_yn' },
          },
          'hdc_yn'
        ).isNewTemplate
      ).to.eql(false)
    })
  })
})
