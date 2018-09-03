const express = require('express');
const {async, authorisationMiddleware} = require('../../utils/middleware');
const {firstItem} = require('../../utils/functionalHelpers');

module.exports = function(
    {logger, userService, authenticationMiddleware}) {

    const router = express.Router();
    router.use(authenticationMiddleware());
    router.use(authorisationMiddleware);

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/', (req, res) => {
        res.redirect('/admin/roUsers');
    });

    router.get('/roUsers', async(async (req, res) => {
        const roUsers = await userService.getRoUsers();
        return res.render('admin/users/list', {roUsers, heading: 'All RO users'});
    }));

    router.post('/roUsers', async(async (req, res) => {
        const {searchTerm} = req.body;

        if (searchTerm.trim() === '') {
            return res.redirect('/admin/roUsers');
        }

        const roUsers = await userService.findRoUsers(searchTerm);

        return res.render('admin/users/list', {roUsers, heading: 'Search results'});
    }));

    router.get('/roUsers/edit/:nomisId', async(async (req, res) => {
        const {nomisId} = req.params;
        const roUser = await userService.getRoUser(nomisId);
        const errors = firstItem(req.flash('errors')) || {};
        return res.render('admin/users/edit', {roUser, errors});
    }));

    router.post('/roUsers/edit/:nomisId', async(async (req, res) => {
        const {nomisId} = req.params;
        const {deliusId, first, last} = req.body;

        if (deliusId.trim() === '') {
            req.flash('errors', {deliusId: 'Delius staff id is required'});
            return res.redirect(`/admin/roUsers/edit/${nomisId}`);
        }

        await userService.updateRoUser(nomisId, deliusId, first, last);

        res.redirect('/admin/roUsers');
    }));

    router.get('/roUsers/delete/:nomisId', async(async (req, res) => {
        const {nomisId} = req.params;
        const roUser = await userService.getRoUser(nomisId);
        return res.render('admin/users/delete', {roUser});
    }));

    router.post('/roUsers/delete/:nomisId', async(async (req, res) => {
        const {nomisId} = req.params;

        await userService.deleteRoUser(nomisId);

        res.redirect('/admin/roUsers');
    }));

    router.get('/roUsers/add', async(async (req, res) => {
        const errors = firstItem(req.flash('errors')) || {};
        return res.render('admin/users/add', {errors});
    }));

    router.post('/roUsers/add', async(async (req, res) => {
        const {nomisId, deliusId, first, last} = req.body;

        if (nomisId.trim() === '' || deliusId.trim() === '') {
            req.flash('errors', {nomisId: 'Enter nomis ID and Delius ID'});
            return res.redirect('/admin/roUsers/add');
        }

        try {
            await userService.addRoUser(nomisId, deliusId, first, last);
            res.redirect('/admin/roUsers');

        } catch (error) {
            req.flash('errors', {nomisId: error.message});
            return res.redirect('/admin/roUsers/add');
        }
    }));

    return router;
};
