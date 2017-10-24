module.exports = {
    createLicenceObject,
    createAddressObject
};

function createLicenceObject(object) {

    const acceptedAttributes = Object.keys(licenceModel);

    return filteredToAttributes(object, acceptedAttributes);
}

function createAddressObject(object) {
    const acceptedAttributes = Object.keys(licenceModel.dischargeAddress);

    return filteredToAttributes(object, acceptedAttributes);
}

const filteredToAttributes = (input, acceptedKeys) => {
    return Object.keys(input).reduce((objectBuilt, key) => {
        if(acceptedKeys.includes(key)) {
            const value = input[key] || '';
            return {...objectBuilt, ...{[key]: value}};
        }
        return objectBuilt;
    }, {});
};

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
        address1: '19 Grantham Road',
        address2: 'Sparbrook',
        address3: '',
        postCode: 'B11 1LX'
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
