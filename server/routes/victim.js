const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const formConfig = require('./config/victim');

module.exports = ({licenceService}) => (router, audited) => {

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'victim'});

    router.get('/victim/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/victim/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    router.get('/victim/:formName/:action/:bookingId', asyncMiddleware(standard.get));
    router.post('/victim/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};
