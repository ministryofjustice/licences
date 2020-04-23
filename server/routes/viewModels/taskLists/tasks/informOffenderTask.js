module.exports = ({ visible }) => ({
  title: 'Inform the offender',
  label: 'You should now tell the offender using the relevant HDC form from NOMIS',
  action: {
    type: 'btn-secondary',
    href: '/caseList/active',
    text: 'Back to case list',
  },
  visible,
})
