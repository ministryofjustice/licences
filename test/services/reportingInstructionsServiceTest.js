const createReportingService = require('../../server/services/reportingInstructionsService');
const service = createReportingService();
const chai = require('chai');
const expect = chai.expect;

describe('reportingInstructionsService', () => {

    describe('getExistingInputs', () => {
        it('should return existing inputs ', () => {
            const data = service.getExistingInputs();

            expect(data).to.be.an('object');
        });
    });
});
