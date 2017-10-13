const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

module.exports = function createRouter() {
    const router = express.Router();

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/', (req, res) => {
        res.render('login');
    });

    router.use(bodyParser.urlencoded({extended: true}));

    router.post('/', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

    return router;
};
