const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const formConfig = require('./config/risk');

module.exports = ({licenceService}) => (router, audited) => {

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'risk'});

    router.get('/risk/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/risk/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    router.get('/risk/:formName/:action/:bookingId', asyncMiddleware(standard.get));
    router.post('/risk/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};
