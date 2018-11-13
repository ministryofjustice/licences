const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const formConfig = require('./config/reporting');

module.exports = ({licenceService}) => (router, audited) => {

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'reporting'});

    router.get('/reporting/:formName/:action/:bookingId', asyncMiddleware(standard.get));
    router.post('/reporting/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post));

    router.get('/reporting/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/reporting/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};
