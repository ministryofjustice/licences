module.exports = {
  templates: [
    {
      id: 'hdc_ap',
      label: 'Basic licence',
      version: '1.0',
      validForOldOffence: true,
    },
    {
      id: 'hdc_ap_pss',
      label: 'Basic licence with top-up supervision',
      version: '1.0',
      validForOldOffence: true,
    },
    {
      id: 'hdc_pss',
      label: 'Top up supervision licence',
      version: '1.0',
      validForOldOffence: true,
    },
    {
      id: 'hdc_u12',
      label: 'Under 12 month licence',
      version: '1.0',
      validForOldOffence: false,
    },
    {
      id: 'hdc_yn',
      label: 'Young person’s licence',
      version: '1.0',
      validForOldOffence: false,
    },
  ],
  templatesForOldOffence: ['hdc_ap', 'hdc_ap_pss', 'hdc_pss'],
}
