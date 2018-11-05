const {asyncMiddleware} = require('../utils/middleware');

module.exports = ({userService}) => router => {

    router.get('/', asyncMiddleware(async (req, res) => {
        const allRoles = await userService.getAllRoles(req.user);

        res.render(`user/admin`, {allRoles, user: req.user});
    }));

    router.post('/', asyncMiddleware(async (req, res) => {
        await userService.setRole(req.body.role, req.user);

        res.redirect('/user');
    }));

    return router;
};
