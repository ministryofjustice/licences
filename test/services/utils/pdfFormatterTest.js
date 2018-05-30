const {formatPdfData} = require('../../../server/services/utils/pdfFormatter');
const {expect} = require('../../testSetup');

describe('pdfFormatter', () => {

    function formatWith({
                            templateName = 'hdc_ap_pss',
                            nomisId = '',
                            licence = {},
                            prisonerInfo = {},
                            establishment = {},
                            image = '',
                            placeholder = 'PLACEHOLDER'
                        }) {
        return formatPdfData(templateName, nomisId, {licence, prisonerInfo, establishment}, image, placeholder);
    }

    it('should give placeholders and display names for everything when all inputs missing', () => {

        const data = formatWith({});

        expect(data.values).to.eql(allValuesEmpty);
        expect(data.missing).to.eql(displayNames);
    });

    it('should join offender names using spaces', () => {

        const prisonerInfo = {
            firstName: 'first',
            middleName: 'second',
            lastName: 'third'
        };

        const data = formatWith({prisonerInfo: prisonerInfo});

        expect(data.values.OFF_NAME).to.eql('first second third');
        expect(data.missing).to.not.have.property('OFF_NAME');
    });

    it('should join offender names using spaces, omitting blanks', () => {

        const prisonerInfo = {
            firstName: 'first',
            middleName: '',
            lastName: 'third'
        };

        const data = formatWith({prisonerInfo: prisonerInfo});

        expect(data.values.OFF_NAME).to.eql('first third');
        expect(data.missing).to.not.have.property('OFF_NAME');
    });

    it('should take first establishment phone number', () => {

        const establishment = {
            phones: [{number: 111}, {number: 222}]
        };

        const data = formatWith({establishment: establishment});

        expect(data.values.EST_PHONE).to.eql('111');
        expect(data.missing).to.not.have.property('EST_PHONE');
    });

    it('should convert image to base64 string', () => {

        const data = formatWith({image: 'IMAGE INPUT'});

        expect(data.values.OFF_PHOTO).to.eql('IMAGE INPUT'.toString('base64'));
        expect(data.missing).to.not.have.property('OFF_PHOTO');
    });

    it('should join reporting address elements using new lines, omitting blanks', () => {

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

        const data = formatWith({licence: licence});

        expect(data.values.REPORTING_ADDRESS).to.eql('first\ntown\npost');
        expect(data.missing).to.not.have.property('REPORTING_ADDRESS');
    });

    it('should join curfew address elements using new lines, omitting blanks', () => {

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

        const data = formatWith({licence: licence});

        expect(data.values.CURFEW_ADDRESS).to.eql('first\nsecond\npost');
        expect(data.missing).to.not.have.property('CURFEW_ADDRESS');
    });

    it('should join conditions with newlines, terminated by semi-colons, with roman numeral index', () => {

        const licence = {
            licenceConditions: [
                {content: [{text: 'first condition'}]},
                {content: [{text: 'second condition'}]},
                {content: [{variable: 'third condition'}]}
            ]
        };
        const expected = 'viii. first condition;\n\nix. second condition;\n\nx. third condition;';

        const data = formatWith({licence: licence});

        expect(data.values.CONDITIONS).to.eql(expected);
        expect(data.missing).to.not.have.property('CONDITIONS');
    });

    it('should join conditions except exclusions', () => {

        const licence = {
            licenceConditions: [
                {id: 'INCLUDED_1', content: [{text: 'first included condition'}]},
                {id: 'ATTENDSAMPLE', content: [{text: 'excluded condition'}]},
                {id: 'INCLUDED_2', content: [{variable: 'second included condition'}]}
            ]
        };
        const expected = 'viii. first included condition;\n\nix. second included condition;';

        const data = formatWith({licence: licence});

        expect(data.values.CONDITIONS).to.eql(expected);
        expect(data.missing).to.not.have.property('CONDITIONS');
    });

    it('should join PSS conditions only for inclusions', () => {

        const licence = {
            licenceConditions: [
                {id: 'ATTENDSAMPLE', content: [{text: 'first PSS condition'}]},
                {id: 'NOT_A_PSS_CONDITION', content: [{text: 'excluded condition'}]},
                {id: 'ATTENDDEPENDENCY', content: [{variable: 'second PSS condition'}]}
            ]
        };
        const expected = 'ix. first PSS condition;\n\nx. second PSS condition;';

        const data = formatWith({licence: licence});

        expect(data.values.PSS).to.eql(expected);
        expect(data.missing).to.not.have.property('PSS');
    });

    it('should skip placeholder when standard conditions only', () => {

        const licence = {
            licenceConditions: {standard: {additionalConditionsRequired: 'No'}}
        };

        const data = formatWith({licence: licence});

        expect(data.values.CONDITIONS).to.eql('');
        expect(data.values.PSS).to.eql('');
        expect(data.missing['CONDITIONS']).to.eql(displayNames['CONDITIONS']);
        expect(data.missing['PSS']).to.eql(displayNames['PSS']);
    });

    it('should skip placeholder when additional conditions empty', () => {

        const licence = {
            licenceConditions: []
        };

        const data = formatWith({licence: licence});

        expect(data.values.CONDITIONS).to.eql('');
        expect(data.values.PSS).to.eql('');
        expect(data.missing['CONDITIONS']).to.eql(displayNames['CONDITIONS']);
        expect(data.missing['PSS']).to.eql(displayNames['PSS']);
    });
});

const allValuesEmpty = {
    CONDITIONS: '',
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
    PSS: '',
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
    PSS: 'Post-sentence supervision conditions',
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
