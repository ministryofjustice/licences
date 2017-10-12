const createReportingService = require('../../server/services/reportingInstructionsService');
const service = createReportingService();
const {expect} = require('../testSetup');

describe('reportingInstructionsService', () => {

    describe('getExistingInputs', () => {
        it('should return existing inputs ', () => {
            const data = service.getExistingInputs();

            expect(data).to.be.an('object');
        });
    });
});
