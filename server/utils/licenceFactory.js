module.exports = {
    createLicenceObject
};

function createLicenceObject(object) {

    const acceptedAttributes = Object.keys(licenceModel);

    return Object.keys(object).reduce((licenceBuilt, key) => {
        if(acceptedAttributes.includes(key)) {
            const value = object[key] || '';
            return {...licenceBuilt, ...{[key]: value}};
        }
        return licenceBuilt;
    }, {});
}

// licence structure example
const licenceModel = {
    firstName: 'David',
    lastName: 'Bryanston',
    nomisId: 'A6627JH',
    establishment: 'HMP birmingham',
    dischargeDate: '2017-07-10',
    additionalConditions: [

    ],
    dischargeAddress: {
        line1: '19 Grantham Road',
        line2: 'Sparbrook',
        line3: '',
        postCode: 'B11 1LX',
        contact: 'Alison Andrews',
        contactNumber: '07889814455',
        homeAddress: false,
        reason: 'This is my sister\'s place and she\'s happy for me to stay for a few months'
    },
    reporting: {
        name: '',
        address: {
            line1: '19 Grantham Road',
            line2: 'Sparbrook',
            line3: '',
            postCode: 'B11 1LX'
        },
        contactNumber: '0121 248 6400',
        dateTime: ''
    }
};
