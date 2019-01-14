const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const formConfig = require('./config/vary');

module.exports = ({licenceService}) => (router, audited) => {
    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'vary'});

    router.get('/vary/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/vary/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};
