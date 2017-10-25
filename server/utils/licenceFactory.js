module.exports = {
    createLicenceObject,
    createAddressObject,
    createReportingInstructionsObject
};

function createLicenceObject(object) {

    const acceptedAttributes = Object.keys(licenceModel);

    return filteredToAttributes(object, acceptedAttributes);
}

function createAddressObject(object) {
    const acceptedAttributes = Object.keys(licenceModel.dischargeAddress);

    return filteredToAttributes(object, acceptedAttributes);
}

function createReportingInstructionsObject(object) {
    const acceptedAttributes = Object.keys(licenceModel.reporting);

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
    firstName: '',
    lastName: '',
    nomisId: '',
    establishment: '',
    dischargeDate: '',
    additionalConditions: [],
    dischargeAddress: {
        address1: '',
        address2: '',
        address3: '',
        postCode: ''
    },
    reporting: {
        name: '',
        address1: '',
        address2: '',
        address3: '',
        postCode: '',
        contactNumber: '',
        date: '',
        time: ''
    }
};
