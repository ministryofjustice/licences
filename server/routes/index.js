'use strict';

let passport = require('passport');
let express = require('express');
let logger = require('../../log.js');


// eslint-disable-next-line
let router = express.Router();

router.get('/', function(req, res) {
    logger.info('GET / - Authenticated: ' + req.isAuthenticated());
    return res.render('index');
});

const oauth = passport.authenticate('oauth2', {
    callbackURL: '/authentication',
    failureRedirect: '/unauthorised'
});

router.get('/login', oauth);

router.get('/authentication', oauth,
    function(req, res) {
        logger.info('Authentication callback', {user: req.user, authenticated: req.isAuthenticated()});
        return res.redirect('/loggedin');
    }
);

router.get('/logout', function(req, res) {
    if (req.user) {
        logger.info('Logging out', {user: req.user.email});
        let profileLink = req.user.profileLink;
        req.logout();
        res.redirect(profileLink);
    } else {
        res.redirect('/login');
    }
});

router.get('/feedback', function(req, res, next) {
    return res.render('feedback', {
        returnURL: req.get('referer')
    });
});

module.exports = router;
