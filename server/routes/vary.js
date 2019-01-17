const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const {pickBy, getFieldName, isEmpty, firstItem} = require('../utils/functionalHelpers');
const formConfig = require('./config/vary');

module.exports = ({licenceService, prisonerService}) => (router, audited) => {
    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'vary'});

    router.get('/licenceDetails/:bookingId', asyncMiddleware(async (req, res) => {
        const {bookingId} = req.params;
        // page should only be viewed if no licence
        if (res.locals.licenceStatus.stage !== 'UNSTARTED') {
           return res.redirect(`/hdc/taskList/${bookingId}`);
        }

        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, res.locals.token);
        const errorObject = firstItem(req.flash('errors')) || {};
        const userInput = firstItem(req.flash('userInput')) || {};

        res.render('vary/licenceDetails', {
            prisonerInfo,
            bookingId,
            errorObject,
            userInput
        });
    }));

    router.post('/licenceDetails/:bookingId', asyncMiddleware(async (req, res) => {
        const {bookingId} = req.body;

        const expectedFields = formConfig.licenceDetails.fields.map(getFieldName);
        const inputForExpectedFields = pickBy((val, key) => expectedFields.includes((key)), req.body);
        const errors = licenceService.validateForm({
            formResponse: inputForExpectedFields,
            pageConfig: formConfig.licenceDetails
        });

        if (!isEmpty(errors)) {
            req.flash('errors', errors);
            req.flash('userInput', inputForExpectedFields);
            return res.redirect(`/hdc/vary/licenceDetails/${bookingId}`);
        }

        await licenceService.createLicenceFromFlatInput(req.body, bookingId, res.locals.licence.licence);
        const nextPath = req.body.additionalConditions === 'Yes' ? 'licenceConditions/additionalConditions' : 'taskList';
        res.redirect(`/hdc/${nextPath}/${bookingId}`);
    }));

    router.get('/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};
