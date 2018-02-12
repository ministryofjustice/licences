const {getTaskData, allCompletedState} = require('../../server/utils/licenceTaskState');
const {expect} = require('../testSetup');

describe('getTaskData', () => {

    it('should show curfewAddress STARTED when curfewAddresReview section present', () => {
        const licence = {
            licence: {
                licenceConditions: {curfewAddressReview: {}}
            }
        };

        expect(getTaskData(licence).curfewAddress.state).to.eql('STARTED');
    });

    it('should show licenceConditions DONE when additionalConditionsRequired is no', () => {
        const licence = {
            licence: {
                licenceConditions: {standardConditions: {additionalConditionsRequired: 'No'}}
            }
        };

        expect(getTaskData(licence).additionalConditions.state).to.eql('DONE');
    });

    it('should show riskManagement STARTED when riskManagement section present', () => {
        const licence = {
            licence: {
                licenceConditions: {riskManagement: {}}
            }
        };

        expect(getTaskData(licence).riskManagement.state).to.eql('STARTED');
    });

    it('should show reportingInstructions STARTED when reportingInstructions section present', () => {
        const licence = {
            licence: {
                reportingInstructions: {}
            }
        };

        expect(getTaskData(licence).reportingInstructions.state).to.eql('STARTED');
    });

    it('should show readyToSubmit true when all tasks STARTED', () => {
        const licence = {
            licence: {
                licenceConditions: {
                    riskManagement: {},
                    curfewAddressReview: {},
                    standardConditions: {additionalConditionsRequired: 'No'}
                }
            }
        };

        expect(getTaskData(licence).readyToSubmit).to.eql(true);
    });

    it('should show readyToSubmit false when any tasks not started', () => {
        const licence = {
            licence: {
                licenceConditions: {
                    riskManagement: {},
                    standardConditions: {additionalConditionsRequired: 'No'}
                }
            }
        };

        expect(getTaskData(licence).readyToSubmit).to.eql(false);
    });

});

describe('isCompletedState', () => {

    const unstarted = {state: 'UNSTARTED'};
    const started = {state: 'STARTED'};

    it('should show readyToSubmit true when all tasks STARTED', () => {
        expect(allCompletedState([started, started, started])).to.eql(true);
    });

    it('should show readyToSubmit false when any tasks not started', () => {
        expect(allCompletedState([started, started, unstarted])).to.eql(false);
    });
});
