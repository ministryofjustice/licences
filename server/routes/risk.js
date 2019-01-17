const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const formConfig = require('./config/risk');

module.exports = ({licenceService}) => (router, audited) => {

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'risk'});

    router.get('/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    router.get('/:formName/:action/:bookingId', asyncMiddleware(standard.get));
    router.post('/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};
