const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')
const { firstItem } = require('../../utils/functionalHelpers')

module.exports =
  ({ userAdminService, signInService, migrationService }) =>
  (router, audited) => {
    router.use(authorisationMiddleware)

    router.get(
      '/',
      asyncMiddleware(async (req, res) => {
        const roUsers = await userAdminService.getRoUsers()
        return res.render('admin/users/list', { roUsers, heading: 'RO users' })
      })
    )

    router.post(
      '/',
      asyncMiddleware(async (req, res) => {
        const { searchTerm } = req.body

        if (!searchTerm || searchTerm.trim() === '') {
          return res.redirect('/admin/roUsers')
        }

        const roUsers = await userAdminService.findRoUsers(searchTerm)

        return res.render('admin/users/list', { roUsers, heading: 'Search results' })
      })
    )

    router.get(
      '/edit/:nomisId',
      asyncMiddleware(async (req, res) => {
        const { nomisId } = req.params
        const roUser = await userAdminService.getRoUser(nomisId)
        const errors = firstItem(req.flash('errors')) || {}
        const userInput = firstItem(req.flash('userInput')) || null

        return res.render('admin/users/roUserDetails', { roUser, errors, userInput })
      })
    )

    router.get(
      '/migrate/:nomisId',
      asyncMiddleware(async (req, res) => {
        const { nomisId } = req.params

        const token = await signInService.getClientCredentialsTokens(req.user.username)
        const results = await migrationService.getStaffDetails(token.token, nomisId)

        const errors = firstItem(req.flash('errors')) || {}
        const userInput = firstItem(req.flash('userInput')) || null
        return res.render('admin/users/migrate', { ...results, errors, userInput })
      })
    )

    router.get(
      '/migrate',
      asyncMiddleware(async (req, res) => {
        const { limit, offset } = req.query
        const token = await signInService.getClientCredentialsTokens(req.user.username)
        const results = await migrationService.getAll(token.token, {
          limit: limit ? parseInt(limit, 10) : 20,
          offset: offset ? parseInt(offset, 10) : 0,
        })
        return res.json(results)
      })
    )

    router.post(
      '/assign-role/:nomisId',
      asyncMiddleware(async (req, res) => {
        const { nomisId } = req.params
        await migrationService.addRoRole(nomisId)
        return res.redirect(`/admin/roUsers/migrate/${nomisId}`)
      })
    )

    router.post(
      '/disable-auth/:nomisId',
      asyncMiddleware(async (req, res) => {
        const { nomisId } = req.params
        const token = await signInService.getClientCredentialsTokens(req.user.username)
        await migrationService.disableAuthAccount(token.token, nomisId)
        return res.redirect(`/admin/roUsers/migrate/${nomisId}`)
      })
    )

    router.post(
      '/enable-auth/:nomisId',
      asyncMiddleware(async (req, res) => {
        const { nomisId } = req.params
        const token = await signInService.getClientCredentialsTokens(req.user.username)
        await migrationService.enableAuthAccount(token.token, nomisId)
        return res.redirect(`/admin/roUsers/migrate/${nomisId}`)
      })
    )

    router.post('/edit/:originalNomisId', audited, async (req, res) => {
      const { originalNomisId } = req.params
      const userInput = req.body

      const error = validateIdentifiers(userInput)
      if (error) {
        req.flash('errors', error)
        req.flash('userInput', userInput)
        return res.redirect(`/admin/roUsers/edit/${originalNomisId}`)
      }

      try {
        await userAdminService.updateRoUser(res.locals.token, originalNomisId, userInput)
      } catch (apiError) {
        req.flash('errors', { nomisId: apiError.message })
        req.flash('userInput', userInput)
        return res.redirect(`/admin/roUsers/edit/${originalNomisId}`)
      }

      return res.redirect('/admin/roUsers')
    })

    router.get(
      '/delete/:nomisId',
      asyncMiddleware(async (req, res) => {
        const { nomisId } = req.params
        const roUser = await userAdminService.getRoUser(nomisId)
        return res.render('admin/users/delete', { roUser })
      })
    )

    router.get('/verify/', audited, async (req, res) => {
      const { nomisUserName } = req.query

      try {
        const userInfo = await userAdminService.verifyUserDetails(res.locals.token, nomisUserName)
        return res.json(userInfo)
      } catch (error) {
        return res.status(404).json('not found')
      }
    })

    router.get('/add', async (req, res) => {
      const errors = firstItem(req.flash('errors')) || {}
      const userInput = firstItem(req.flash('userInput')) || null

      return res.render('admin/users/roUserDetails', { errors, userInput })
    })

    router.post('/add', audited, async (req, res) => {
      const userInput = req.body

      const error = validateIdentifiers(userInput)
      if (error) {
        req.flash('errors', error)
        req.flash('userInput', userInput)
        return res.redirect('/admin/roUsers/add')
      }

      try {
        await userAdminService.addRoUser(res.locals.token, userInput)
        return res.redirect('/admin/roUsers')
      } catch (apiError) {
        req.flash('errors', { nomisId: apiError.message })
        req.flash('userInput', userInput)
        return res.redirect('/admin/roUsers/add')
      }
    })

    function validateIdentifiers(userInput) {
      if (!userInput.nomisId || userInput.nomisId.trim() === '') {
        return { nomisId: 'Nomis id is required' }
      }
      if (!userInput.deliusId || userInput.deliusId.trim() === '') {
        return { deliusId: 'Delius staff id is required' }
      }
      return null
    }

    return router
  }
