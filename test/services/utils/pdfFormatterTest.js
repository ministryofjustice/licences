const {getValues} = require('../../../server/services/utils/pdfFormatter');
const {expect} = require('../../testSetup');

describe('pdfFormatter', () => {

    function callGetValues({
                               nomisId = '',
                               licence = {},
                               prisonerInfo = {},
                               establishment = {},
                               image = '',
                               placeholder = 'PLACEHOLDER'
                           }) {
        return getValues(nomisId, {licence, prisonerInfo, establishment}, image, placeholder);
    }

    it('should give placeholders and display names for everything when all inputs missing', () => {

        const data = callGetValues({});

        expect(data.values).to.eql(allValuesEmpty);
        expect(data.missing).to.eql(displayNames);
    });

    it('should join offender names together with spaces', () => {

        const prisonerInfo = {
            firstName: 'first',
            middleName: 'second',
            lastName: 'third'
        };

        const data = callGetValues({prisonerInfo: prisonerInfo});

        expect(data.values.OFF_NAME).to.eql('first second third');
        expect(data.missing).to.not.have.property('OFF_NAME');
    });

    it('should join offender names together with spaces omitting blanks', () => {

        const prisonerInfo = {
            firstName: 'first',
            middleName: '',
            lastName: 'third'
        };

        const data = callGetValues({prisonerInfo: prisonerInfo});

        expect(data.values.OFF_NAME).to.eql('first third');
        expect(data.missing).to.not.have.property('OFF_NAME');
    });

    it('should take first establishment phone number', () => {

        const establishment = {
            phones: [{number: 111}, {number: 222}]
        };

        const data = callGetValues({establishment: establishment});

        expect(data.values.EST_PHONE).to.eql('111');
        expect(data.missing).to.not.have.property('EST_PHONE');
    });

    it('should convert image to base64 string', () => {

        const data = callGetValues({image: 'IMAGE INPUT'});

        expect(data.values.OFF_PHOTO).to.eql('IMAGE INPUT'.toString('base64'));
        expect(data.missing).to.not.have.property('OFF_PHOTO');
    });

    it('should join reporting address elements together with new lines omitting blanks', () => {

        const licence = {
            reporting: {
                reportingInstructions: {
                    buildingAndStreet1: 'first',
                    buildingAndStreet2: '',
                    townOrCity: 'town',
                    postcode: 'post'
                }
            }
        };

        const data = callGetValues({licence: licence});

        expect(data.values.REPORTING_ADDRESS).to.eql('first\ntown\npost');
        expect(data.missing).to.not.have.property('REPORTING_ADDRESS');
    });

    it('should join curfew address elements together with new lines omitting blanks', () => {

        const licence = {
            proposedAddress: {
                curfewAddress: {
                    addresses: [{
                        addressLine1: 'first',
                        addressLine2: 'second',
                        addressTown: '',
                        postCode: 'post'
                    }]
                }
            }
        };

        const data = callGetValues({licence: licence});

        expect(data.values.CURFEW_ADDRESS).to.eql('first\nsecond\npost');
        expect(data.missing).to.not.have.property('CURFEW_ADDRESS');
    });
});

const allValuesEmpty = {
    CONDITIONS: 'PLACEHOLDER',
    CURFEW_ADDRESS: 'PLACEHOLDER',
    CURFEW_FIRST_FROM: 'PLACEHOLDER',
    CURFEW_FIRST_UNTIL: 'PLACEHOLDER',
    CURFEW_FRI_FROM: 'PLACEHOLDER',
    CURFEW_FRI_UNTIL: 'PLACEHOLDER',
    CURFEW_MON_FROM: 'PLACEHOLDER',
    CURFEW_MON_UNTIL: 'PLACEHOLDER',
    CURFEW_SAT_FROM: 'PLACEHOLDER',
    CURFEW_SAT_UNTIL: 'PLACEHOLDER',
    CURFEW_SUN_FROM: 'PLACEHOLDER',
    CURFEW_SUN_UNTIL: 'PLACEHOLDER',
    CURFEW_THU_FROM: 'PLACEHOLDER',
    CURFEW_THU_UNTIL: 'PLACEHOLDER',
    CURFEW_TUE_FROM: 'PLACEHOLDER',
    CURFEW_TUE_UNTIL: 'PLACEHOLDER',
    CURFEW_WED_FROM: 'PLACEHOLDER',
    CURFEW_WED_UNTIL: 'PLACEHOLDER',
    EST_PHONE: 'PLACEHOLDER',
    EST_PREMISE: 'PLACEHOLDER',
    MONITOR: 'PLACEHOLDER',
    OFF_BOOKING: 'PLACEHOLDER',
    OFF_CRO: 'PLACEHOLDER',
    OFF_DOB: 'PLACEHOLDER',
    OFF_NAME: 'PLACEHOLDER',
    OFF_NOMS: 'PLACEHOLDER',
    OFF_PHOTO: 'PLACEHOLDER',
    OFF_PNC: 'PLACEHOLDER',
    REPORTING_ADDRESS: 'PLACEHOLDER',
    REPORTING_AT: 'PLACEHOLDER',
    REPORTING_NAME: 'PLACEHOLDER',
    REPORTING_ON: 'PLACEHOLDER',
    SENT_CRD: 'PLACEHOLDER',
    SENT_HDCAD: 'PLACEHOLDER',
    SENT_LED: 'PLACEHOLDER',
    SENT_SED: 'PLACEHOLDER',
    SENT_TUSED: 'PLACEHOLDER'
};

const displayNames = {
    CONDITIONS: 'Additional conditions',
    CURFEW_ADDRESS: 'Curfew address',
    CURFEW_FIRST_FROM: 'Curfew first night from',
    CURFEW_FIRST_UNTIL: 'Curfew first night until',
    CURFEW_FRI_FROM: 'Curfew Friday from',
    CURFEW_FRI_UNTIL: 'Curfew Friday until',
    CURFEW_MON_FROM: 'Curfew Monday from',
    CURFEW_MON_UNTIL: 'Curfew Monday until',
    CURFEW_SAT_FROM: 'Curfew Saturday from',
    CURFEW_SAT_UNTIL: 'Curfew Saturday until',
    CURFEW_SUN_FROM: 'Curfew Sunday from',
    CURFEW_SUN_UNTIL: 'Curfew Sunday until',
    CURFEW_THU_FROM: 'Curfew Thursday from',
    CURFEW_THU_UNTIL: 'Curfew Thursday until',
    CURFEW_TUE_FROM: 'Curfew Tuesday from',
    CURFEW_TUE_UNTIL: 'Curfew Tuesday until',
    CURFEW_WED_FROM: 'Curfew Wednesday from',
    CURFEW_WED_UNTIL: 'Curfew Wednesday until',
    EST_PHONE: 'Prison telephone number',
    EST_PREMISE: 'Prison name',
    MONITOR: 'Monitoring company telephone number',
    OFF_BOOKING: 'Offender booking ID',
    OFF_CRO: 'Offender CRO',
    OFF_DOB: 'Offender date of birth',
    OFF_NAME: 'Offender name',
    OFF_NOMS: 'Offender Noms ID',
    OFF_PNC: 'Offender PNC',
    REPORTING_ADDRESS: 'Reporting address',
    REPORTING_AT: 'Reporting at',
    REPORTING_NAME: 'Reporting name',
    REPORTING_ON: 'Reporting on',
    SENT_CRD: 'CRD',
    SENT_HDCAD: 'HDCAD',
    SENT_LED: 'LED',
    SENT_SED: 'SED',
    SENT_TUSED: 'TUSED'
};
