const createConditionsService = require('../../server/services/conditionsService');
const {expect, sandbox} = require('../testSetup');

describe('licenceDetailsService', () => {

    const licenceClient = {
        getStandardConditions: sandbox.stub().returnsPromise().resolves({a: 'b'}),
        getAdditionalConditions: sandbox.stub().returnsPromise().resolves([{TEXT: {value: 'v'}}])
    };

    const service = createConditionsService(licenceClient);

    afterEach(() => {
        sandbox.reset();
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
        it('should request additional conditions from client', () => {
            service.getAdditionalConditions();

            expect(licenceClient.getAdditionalConditions).to.be.calledOnce();
        });

        it('should return the conditions', () => {
            return expect(service.getAdditionalConditions()).to.eventually.eql([{TEXT: {value: 'v'}}]);
        });

        it('should throw if error getting conditions', () => {
            licenceClient.getAdditionalConditions.rejects();
            return expect(service.getAdditionalConditions()).to.eventually.be.rejected();
        });

        it('should add UI data to a condition', () => {
            licenceClient.getAdditionalConditions.resolves([{TEXT: {value: 'text [INSERT NAME]'}}]);

            const expected = [{
                TEXT: {value: 'text [INSERT NAME]'},
                FORM_ITEMS: [{label: 'Name', type: 'FREE_TEXT'}]
            }];

            return expect(service.getAdditionalConditions()).to.eventually.eql(expected);
        });

        it('should add each UI data to condition ', () => {
            licenceClient.getAdditionalConditions.resolves([
                {TEXT: {value: 'text [INSERT NAME] more text [INSERT AGE]'}}
            ]);

            const expected = [{
                TEXT: {value: 'text [INSERT NAME] more text [INSERT AGE]'},
                FORM_ITEMS: [{label: 'Name', type: 'FREE_TEXT'}, {label: 'Age', type: 'NUMBER'}]
            }];

            return expect(service.getAdditionalConditions()).to.eventually.eql(expected);
        });

        it('should add UI data to each condition ', () => {
            licenceClient.getAdditionalConditions.resolves([
                {TEXT: {value: 'text [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT]'}},
                {TEXT: {value: 'text [QUANTITY HERE], f [WOMEN / MEN / WOMEN OR MEN] text'}}
            ]);

            const expected = [
                {
                    TEXT: {value: 'text [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT]'},
                    FORM_ITEMS: [
                        {label: 'Name of social services dept', type: 'FREE_TEXT'}
                    ]
                },
                {
                    TEXT: {value: 'text [QUANTITY HERE], f [WOMEN / MEN / WOMEN OR MEN] text'},
                    FORM_ITEMS: [
                        {label: 'Quantity', type: 'NUMBER'},
                        {type: 'RADIO', options: ['WOMEN', 'MEN', 'WOMEN OR MEN']}
                    ]
                }
            ];

            return expect(service.getAdditionalConditions()).to.eventually.eql(expected);
        });
    });

});
