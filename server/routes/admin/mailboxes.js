const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')
const { firstItem } = require('../../utils/functionalHelpers')

module.exports = ({ configClient }) => (router, audited) => {
  router.use(authorisationMiddleware)

  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      const mailboxes = await configClient.getAllMailboxes()
      return res.render('admin/mailboxes/list', { mailboxes })
    })
  )

  router.get(
    '/edit/:id',
    asyncMiddleware(async (req, res) => {
      const { id } = req.params
      const mailbox = await configClient.getMailbox(id)
      const errors = firstItem(req.flash('errors')) || {}
      const userInput = firstItem(req.flash('userInput')) || null

      return res.render('admin/mailboxes/mailboxDetails', { mailbox, errors, userInput })
    })
  )

  router.post('/edit/:id', async (req, res) => {
    const { id } = req.params
    const userInput = req.body

    const error = validateMailboxInputs(userInput)
    if (error) {
      req.flash('errors', error)
      req.flash('userInput', userInput)
      return res.redirect(`/admin/mailboxes/edit/${id}`)
    }

    try {
      await configClient.updateMailbox(id, userInput)
    } catch (dbError) {
      if (dbError.code === '23505') {
        req.flash('errors', { email: 'Duplicate entry' })
      } else {
        req.flash('errors', { email: dbError.message })
      }

      req.flash('userInput', userInput)
      return res.redirect(`/admin/mailboxes/edit/${id}`)
    }

    res.redirect('/admin/mailboxes')
  })

  router.get(
    '/delete/:id',
    asyncMiddleware(async (req, res) => {
      const { id } = req.params
      const mailbox = await configClient.getMailbox(id)
      return res.render('admin/mailboxes/delete', { mailbox })
    })
  )

  router.post(
    '/delete/:id',
    audited,
    asyncMiddleware(async (req, res) => {
      const { id } = req.params
      await configClient.deleteMailbox(id)
      res.redirect('/admin/mailboxes')
    })
  )

  router.get('/add', async (req, res) => {
    const errors = firstItem(req.flash('errors')) || {}
    const userInput = firstItem(req.flash('userInput')) || null

    return res.render('admin/mailboxes/mailboxDetails', { errors, userInput })
  })

  router.post('/add', audited, async (req, res) => {
    const userInput = req.body

    const error = validateMailboxInputs(userInput)
    if (error) {
      req.flash('errors', error)
      req.flash('userInput', userInput)
      return res.redirect('/admin/mailboxes/add')
    }

    try {
      await configClient.addMailbox(userInput)
      return res.redirect('/admin/mailboxes')
    } catch (dbError) {
      if (dbError.code === '23505') {
        req.flash('errors', { email: 'Duplicate entry' })
      } else {
        req.flash('errors', { email: dbError.message })
      }
      req.flash('userInput', userInput)
      return res.redirect('/admin/mailboxes/add')
    }
  })

  function validateMailboxInputs(userInput) {
    if (!userInput.email || userInput.email.trim() === '') {
      return { email: 'Email is required' }
    }
    if (!userInput.establishment || userInput.establishment.trim() === '') {
      return { establishment: 'Establishment code is required' }
    }
    if (!userInput.role || !['CA', 'DM'].includes(userInput.role)) {
      return { role: 'Valid role is required' }
    }
  }

  return router
}
