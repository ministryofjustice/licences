const {asyncMiddleware} = require('../utils/middleware');

module.exports = ({signInService}) => router => {

    router.get('/', asyncMiddleware(async (req, res) => {
        const allRoles = await signInService.getAllRoles(req.user);

        res.render(`user/admin`, {allRoles, user: req.user});
    }));

    router.post('/', asyncMiddleware(async (req, res) => {
        await signInService.setRole(req.body.role, req.user);

        res.redirect('/user');
    }));

    return router;
};
