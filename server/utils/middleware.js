module.exports = {
    asyncMiddleware,
    checkLicenceMiddleWare,
    checkLicenceReviewMiddleWare
};

function asyncMiddleware(fn) {
    return (req, res, next) => {
        Promise
            .resolve(fn(req, res, next))
            .catch(next);
    };
}

function checkLicenceMiddleWare(licenceService) {
    return async (req, res, next) => {
        try {

            const nomisId = req.params.nomisId;
            const licence = await licenceService.getLicence(nomisId);

            if (!licence) {
                return res.redirect('/');
            }

            res.locals.licence = licence;
            next();

        } catch (error) {
            // TODO proper error handling
            console.error('Error collecting licence from checkLicence');
            res.redirect('/');
        }
    };
}

function checkLicenceReviewMiddleWare(licenceService) {
    return async (req, res, next) => {
        try {
            const nomisId = req.params.nomisId;
            const licence = await licenceService.getLicence(nomisId, {populateConditions: true});

            if (!licence) {
                return res.redirect('/');
            }

            res.locals.licence = licence;
            next();

        } catch (error) {
            // TODO proper error handling
            console.error('Error collecting licence from checkLicence');
            res.redirect('/');
        }
    };
}
