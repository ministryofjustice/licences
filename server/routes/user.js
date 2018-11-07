const {asyncMiddleware} = require('../utils/middleware');

module.exports = ({userService}) => router => {

    router.get('/', asyncMiddleware(async (req, res) => {

        const [allRoles, allCaseLoads] = await Promise.all([
            userService.getAllRoles(req.user),
            userService.getAllCaseLoads(req.user.token)
        ]);

        res.render(`user/admin`, {allRoles, allCaseLoads, user: req.user});
    }));

    router.post('/', asyncMiddleware(async (req, res) => {
        if (req.body.role !== req.user.role) {
            await userService.setRole(req.body.role, req.user);
        }

        if (req.body.caseLoad !== req.user.activeCaseLoad.caseLoadId) {
            await userService.setActiveCaseLoad(req.body.caseLoad, req.user);
        }

        res.redirect('/user');
    }));

    return router;
};
