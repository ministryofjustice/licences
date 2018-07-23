const EST_PREMISE = {
    paths: [['establishment', 'premise']],
    displayName: 'Prison name'
};

const EST_PHONE = {
    paths: [['establishment', 'phones', 0, 'number']],
    displayName: 'Prison telephone number'
};

const OFF_NAME = {
    paths: [
        ['prisonerInfo', 'firstName'],
        ['prisonerInfo', 'middleName'],
        ['prisonerInfo', 'lastName']
    ],
    separator: ' ',
    displayName: 'Offender name'
};

const OFF_DOB = {
    paths: [['prisonerInfo', 'dateOfBirth']],
    displayName: 'Offender date of birth'
};

const OFF_PHOTO = {
    paths: [['photo']],
    displayName: 'Offender photograph'
};

const OFF_BOOKING = {
    paths: [['prisonerInfo', 'bookingId']],
    displayName: 'Offender booking ID'
};

const OFF_NOMS = {
    paths: [['nomisId']],
    displayName: 'Offender Noms ID'
};

const OFF_CRO = {
    paths: [['prisonerInfo', 'CRO']],
    displayName: 'Offender CRO'
};

const OFF_PNC = {
    paths: [['prisonerInfo', 'PNC']],
    displayName: 'Offender PNC'
};

const SENT_HDCAD = {
    paths: [['prisonerInfo', 'sentenceDetail', 'homeDetentionCurfewActualDate']],
    displayName: 'HDCAD'
};

const SENT_CRD = {
    paths: [['prisonerInfo', 'sentenceDetail', 'releaseDate']],
    displayName: 'CRD'
};

const SENT_LED = {
    paths: [['prisonerInfo', 'sentenceDetail', 'licenceExpiryDate']],
    displayName: 'LED'
};

const SENT_SED = {
    paths: [['prisonerInfo', 'sentenceDetail', 'sentenceExpiryDate']],
    displayName: 'SED'
};

const SENT_TUSED = {
    paths: [['prisonerInfo', 'sentenceDetail', 'topupSupervisionExpiryDate']],
    displayName: 'TUSED'
};

const REPORTING_NAME = {
    paths: [['licence', 'reporting', 'reportingInstructions', 'name']],
    displayName: 'Reporting name'
};

const REPORTING_ADDRESS = {
    paths: [
        ['licence', 'reporting', 'reportingInstructions', 'buildingAndStreet1'],
        ['licence', 'reporting', 'reportingInstructions', 'buildingAndStreet2'],
        ['licence', 'reporting', 'reportingInstructions', 'townOrCity'],
        ['licence', 'reporting', 'reportingInstructions', 'postcode']
    ],
    separator: '\n',
    displayName: 'Reporting address'
};

const REPORTING_AT = {
    paths: [['licence', 'reporting', 'reportingInstructions', 'at']],
    displayName: 'Reporting at'
};

const REPORTING_ON = {
    paths: [['licence', 'reporting', 'reportingInstructions', 'on']],
    displayName: 'Reporting on'
};

const CURFEW_ADDRESS = {
    paths: [
        ['licence', 'proposedAddress', 'curfewAddress', 'addresses', 0, 'addressLine1'],
        ['licence', 'proposedAddress', 'curfewAddress', 'addresses', 0, 'addressLine2'],
        ['licence', 'proposedAddress', 'curfewAddress', 'addresses', 0, 'addressTown'],
        ['licence', 'proposedAddress', 'curfewAddress', 'addresses', 0, 'postCode']
    ],
    separator: '\n',
    displayName: 'Curfew address'
};

const CURFEW_FIRST_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'firstNightFrom']],
    displayName: 'Curfew first night from'
};
const CURFEW_FIRST_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'firstNightUntil']],
    displayName: 'Curfew first night until'
};
const CURFEW_MON_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'mondayFrom']],
    displayName: 'Curfew Monday from'
};
const CURFEW_MON_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'mondayUntil']],
    displayName: 'Curfew Monday until'
};
const CURFEW_TUE_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'tuesdayFrom']],
    displayName: 'Curfew Tuesday from'
};
const CURFEW_TUE_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'tuesdayUntil']],
    displayName: 'Curfew Tuesday until'
};
const CURFEW_WED_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'wednesdayFrom']],
    displayName: 'Curfew Wednesday from'
};
const CURFEW_WED_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'wednesdayUntil']],
    displayName: 'Curfew Wednesday until'
};
const CURFEW_THU_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'thursdayFrom']],
    displayName: 'Curfew Thursday from'
};
const CURFEW_THU_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'thursdayUntil']],
    displayName: 'Curfew Thursday until'
};
const CURFEW_FRI_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'fridayFrom']],
    displayName: 'Curfew Friday from'
};
const CURFEW_FRI_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'fridayUntil']],
    displayName: 'Curfew Friday until'
};
const CURFEW_SAT_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'saturdayFrom']],
    displayName: 'Curfew Saturday from'
};
const CURFEW_SAT_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'saturdayUntil']],
    displayName: 'Curfew Saturday until'
};
const CURFEW_SUN_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'sundayFrom']],
    displayName: 'Curfew Sunday from'
};
const CURFEW_SUN_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'sundayUntil']],
    displayName: 'Curfew Sunday until'
};

const MONITOR = {
    paths: [['licence', 'monitoring', 'telephone']],
    displayName: 'Monitoring company telephone number'
};

const OFFENDER = {
    OFF_NAME,
    OFF_DOB,
    OFF_PHOTO,
    OFF_BOOKING,
    OFF_NOMS,
    OFF_CRO,
    OFF_PNC
};

const CURFEW_HOURS = {
    CURFEW_MON_FROM,
    CURFEW_MON_UNTIL,
    CURFEW_TUE_FROM,
    CURFEW_TUE_UNTIL,
    CURFEW_WED_FROM,
    CURFEW_WED_UNTIL,
    CURFEW_THU_FROM,
    CURFEW_THU_UNTIL,
    CURFEW_FRI_FROM,
    CURFEW_FRI_UNTIL,
    CURFEW_SAT_FROM,
    CURFEW_SAT_UNTIL,
    CURFEW_SUN_FROM,
    CURFEW_SUN_UNTIL
};

const REPORTING = {
    REPORTING_NAME,
    REPORTING_ADDRESS,
    REPORTING_AT,
    REPORTING_ON
};

module.exports = {

    hdc_ap_pss: {
        EST_PREMISE,
        EST_PHONE,
        ...OFFENDER,
        SENT_HDCAD,
        SENT_CRD,
        SENT_LED,
        SENT_SED,
        SENT_TUSED,
        ...REPORTING,
        CURFEW_ADDRESS,
        CURFEW_FIRST_FROM,
        CURFEW_FIRST_UNTIL,
        ...CURFEW_HOURS,
        MONITOR,
        CONDITIONS: {
            noPlaceholder: true,
            paths: [['conditions']],
            displayName: 'Additional conditions',
            startIndex: 8,
            divider: '\n\n',
            terminator: ';',
            filtered: ['ATTENDSAMPLE', 'ATTENDDEPENDENCY'],
            filter: filtered => condition => !filtered.includes(condition.id)
        },
        PSS: {
            noPlaceholder: true,
            paths: [['pss']],
            displayName: 'Post-sentence supervision conditions',
            startIndex: 9,
            divider: '\n\n',
            terminator: ';',
            filtered: ['ATTENDSAMPLE', 'ATTENDDEPENDENCY'],
            filter: filtered => condition => filtered.includes(condition.id)
        }
    },

    hdc_yn: {
        EST_PREMISE,
        EST_PHONE,
        ...OFFENDER,
        SENT_HDCAD,
        SENT_CRD,
        SENT_LED,
        SENT_SED,
        ...REPORTING,
        CURFEW_ADDRESS,
        CURFEW_FIRST_FROM,
        ...CURFEW_HOURS,
        MONITOR,
        CONDITIONS: {
            noPlaceholder: true,
            paths: [['conditions']],
            displayName: 'Additional conditions',
            startIndex: 8,
            divider: '\n\n',
            terminator: ';'
        }
    },

    hdc_ap: {
        EST_PREMISE,
        EST_PHONE,
        ...OFFENDER,
        SENT_HDCAD,
        SENT_CRD,
        SENT_LED,
        SENT_SED,
        ...REPORTING,
        CURFEW_ADDRESS,
        CURFEW_FIRST_FROM,
        ...CURFEW_HOURS,
        MONITOR,
        CONDITIONS: {
            noPlaceholder: true,
            paths: [['conditions']],
            displayName: 'Additional conditions',
            startIndex: 8,
            divider: '\n\n',
            terminator: ';'
        }
    },

    hdc_pss: {
        EST_PREMISE,
        EST_PHONE,
        ...OFFENDER,
        SENT_HDCAD,
        SENT_CRD,
        SENT_SED,
        SENT_TUSED,
        ...REPORTING,
        CURFEW_ADDRESS,
        CURFEW_FIRST_FROM,
        CURFEW_FIRST_UNTIL,
        ...CURFEW_HOURS,
        MONITOR,
        CONDITIONS: {
            noPlaceholder: true,
            paths: [['conditions']],
            displayName: 'Additional conditions',
            startIndex: 9,
            divider: '\n\n',
            terminator: ';'
        }
    }

};
