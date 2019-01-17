const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const formConfig = require('./config/finalChecks');

module.exports = ({licenceService}) => (router, audited) => {

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'finalChecks'});

    router.get('/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};


