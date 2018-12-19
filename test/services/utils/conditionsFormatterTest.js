const {formatConditionsInput} = require('../../../server/services/utils/conditionsFormatter');

describe('conditionsValidator', () => {
    it('should reformat date fields to dd/mm/yyyy format', () => {
        const inputObject = {
            appointmentDay: '23',
            appointmentMonth: '12',
            appointmentYear: '2017'
        };

        const conditionsSelected = [
            {field_position: {appointmentDate: 0}}
        ];

        expect(formatConditionsInput(inputObject, conditionsSelected).appointmentDate).to.eql('23/12/2017');
    });
});
