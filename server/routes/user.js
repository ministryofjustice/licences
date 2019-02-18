const { asyncMiddleware } = require('../utils/middleware')

module.exports = ({ userService }) => router => {
    router.get(
        '/',
        asyncMiddleware(async (req, res) => {
            const [allRoles, allCaseLoads] = await Promise.all([
                userService.getAllRoles(res.locals.token),
                userService.getAllCaseLoads(res.locals.token),
            ])

            res.render(`user/admin`, { allRoles, allCaseLoads, user: req.user })
        })
    )

    router.post(
        '/',
        asyncMiddleware(async (req, res) => {
            if (req.body.role !== req.user.role) {
                await userService.setRole(req.body.role, req.user)
            }

            if (req.body.caseLoad !== req.user.activeCaseLoad.caseLoadId) {
                await userService.setActiveCaseLoad(req.body.caseLoad, req.user, res.locals.token)
            }

            res.redirect('/user')
        })
    )

    return router
}
