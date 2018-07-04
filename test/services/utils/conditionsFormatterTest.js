const {formatConditionsInput} = require('../../../server/services/utils/conditionsFormatter');

describe('conditionsValidator', () => {
    it('should reformat date fields to iso date', () => {
        const inputObject = {
            appointmentDate: '23/12/2017'
        };

        const conditionsSelected = [
            {field_position: {appointmentDate: 0}}
        ];

        expect(formatConditionsInput(inputObject, conditionsSelected).appointmentDate).to.eql('2017-12-23');
    });
});
