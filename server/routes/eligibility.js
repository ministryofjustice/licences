const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');

module.exports = ({licenceService}) => (router, audited) => {

    const formConfig = require('./config/eligibility');
    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'eligibility'});

    router.get('/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};
