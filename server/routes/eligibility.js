const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');

module.exports = ({licenceService}) => (router, audited) => {

    const formConfig = require('./config/eligibility');
    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'eligibility'});

    router.get('/eligibility/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/eligibility/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};
