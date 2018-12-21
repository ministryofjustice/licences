const createConditionsService = require('../../server/services/conditionsService');
const {
    additionalConditionsObject,
    additionalConditionsObjectNoResideSelected,
    additionalConditionsObjectDateSelected
} = require('../stubs/conditions');

describe('conditionsService', () => {
    let licenceClient;
    let service;

    beforeEach(() => {
        licenceClient = {
            getStandardConditions: sinon.stub().resolves({a: 'b'}),
            getAdditionalConditions: sinon.stub().resolves([{text: 'v', user_input: {}}])
        };

        service = createConditionsService(licenceClient);
    });

    describe('getStandardConditions', () => {
        it('should request standard conditions from client', () => {
            service.getStandardConditions();

            expect(licenceClient.getStandardConditions).to.be.calledOnce();
        });

        it('should return the conditions', () => {
            return expect(service.getStandardConditions()).to.eventually.eql({a: 'b'});
        });

        it('should throw if error getting conditions', () => {
            licenceClient.getStandardConditions.rejects();
            return expect(service.getStandardConditions()).to.eventually.be.rejected();
        });
    });

    describe('getAdditionalConditions', () => {

        it('should split the conditions by group and subgroup', () => {
            return expect(service.getAdditionalConditions()).to.eql(additionalConditionsObject);
        });

        it('should populate inputs if licence is passed in', () => {

            const licence = {
                licenceConditions: {
                    additional: {NORESIDE: {notResideWithAge: 12, notResideWithGender: 'Female'}}
                }
            };

            return expect(service.getAdditionalConditions(licence)).to.eql(additionalConditionsObjectNoResideSelected);

        });

        it('should split the appointmentDate into day, month, year', () => {

            const licence = {
                licenceConditions: {
                    additional: {ATTENDDEPENDENCY: {appointmentDate: '12/03/1985'}}
                }
            };

            return expect(service.getAdditionalConditions(licence)).to.eql(additionalConditionsObjectDateSelected);
        });
    });

    describe('populateLicenceWithConditions', () => {
        it('should return the licence if conditions not required', () => {
            const licence = {licenceConditions: {
                standard: {additionalConditionsRequired: 'No'},
                additional: {1: {}},
                bespoke: []
            }};
            licenceClient.getAdditionalConditions.resolves([{
                id: 1,
                user_input: null,
                text: 'The condition',
                field_position: null,
                group_name: 'group',
                subgroup_name: 'subgroup'
            }]);

            return expect(service.populateLicenceWithConditions(licence)).to.eventually.eql(licence);
        });

        it('should return licence if no additional conditions', () => {
            const licence = {licenceConditions: {}};
            licenceClient.getAdditionalConditions.resolves([{
                id: 1,
                user_input: null,
                text: 'The condition',
                field_position: null,
                group_name: 'group',
                subgroup_name: 'subgroup'
            }]);

            return expect(service.populateLicenceWithConditions(licence)).to.eventually.eql({
                licenceConditions: {}
            });
        });

    });
});
