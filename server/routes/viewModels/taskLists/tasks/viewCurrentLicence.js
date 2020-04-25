module.exports = (approvedVersion) => () => ({
  title: 'View current licence',
  label: `Licence version ${approvedVersion}`,
  action: {
    type: 'btn',
    text: 'View',
    href: `/hdc/pdf/create/`,
    newTab: true,
  },
})
