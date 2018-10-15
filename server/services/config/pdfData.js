const VERSION_NUMBER = {
    paths: [['approvedVersionDetails', 'version']],
    displayName: 'Version number',
    group: 'document',
    required: 'optional'
};

const VERSION_DATE = {
    paths: [['approvedVersionDetails', 'timestamp']],
    displayName: 'Version date',
    group: 'document',
    required: 'optional'
};

const APPROVER = {
    paths: [['licence', 'approval', 'release', 'decisionMaker']],
    displayName: 'Name of decision maker',
    group: 'document',
    required: 'optional'
};

const EST_PREMISE = {
    paths: [['establishment', 'premise']],
    displayName: 'Prison name',
    group: 'sentence',
    required: 'mandatory'
};

const EST_PHONE = {
    paths: [['establishment', 'phones', 'number']],
    displayName: 'Prison telephone number',
    group: 'sentence',
    required: 'mandatory'
};

const OFF_NAME = {
    paths: [
        ['prisonerInfo', 'firstName'],
        ['prisonerInfo', 'middleName'],
        ['prisonerInfo', 'lastName']
    ],
    separator: ' ',
    displayName: 'Offender name',
    group: 'sentence',
    required: 'mandatory'
};

const OFF_DOB = {
    paths: [['prisonerInfo', 'dateOfBirth']],
    displayName: 'Offender date of birth',
    group: 'sentence',
    required: 'mandatory'
};

const OFF_PHOTO = {
    paths: [['photo']],
    displayName: 'Offender photograph',
    group: 'sentence',
    required: 'mandatory'
};

const OFF_BOOKING = {
    paths: [['prisonerInfo', 'bookingId']],
    displayName: 'Booking ID',
    group: 'sentence',
    required: 'mandatory'
};

const OFF_NOMS = {
    paths: [['prisonerInfo', 'offenderNo']],
    displayName: 'Noms ID',
    group: 'sentence',
    required: 'mandatory'
};

const OFF_CRO = {
    paths: [['prisonerInfo', 'CRO']],
    displayName: 'CRO number',
    group: 'sentence',
    required: 'optional',
    noPlaceholder: true
};

const OFF_PNC = {
    paths: [['prisonerInfo', 'PNC']],
    displayName: 'PNC ID',
    group: 'sentence',
    required: 'optional',
    noPlaceholder: true
};

const SENT_HDCAD = {
    paths: [['prisonerInfo', 'sentenceDetail', 'homeDetentionCurfewActualDate']],
    displayName: 'HDC approved date (HDCAD)',
    group: 'sentence',
    required: 'mandatory'
};

const SENT_CRD = {
    paths: [['prisonerInfo', 'sentenceDetail', 'releaseDate']],
    displayName: 'Conditional release date (CRD)',
    group: 'sentence',
    required: 'mandatory'
};

const SENT_LED = {
    paths: [['prisonerInfo', 'sentenceDetail', 'licenceExpiryDate']],
    displayName: 'Licence expiry date (LED)',
    group: 'sentence',
    required: 'mandatory'
};

const SENT_SED = {
    paths: [['prisonerInfo', 'sentenceDetail', 'sentenceExpiryDate']],
    displayName: 'Sentence expiry date (SED)',
    group: 'sentence',
    required: 'mandatory'
};

const SENT_TUSED = {
    paths: [['prisonerInfo', 'sentenceDetail', 'topupSupervisionExpiryDate']],
    displayName: 'Top-up supervision end date (TUSED)',
    group: 'sentence',
    required: 'mandatory'
};

const REPORTING_NAME = {
    paths: [['licence', 'reporting', 'reportingInstructions', 'name']],
    displayName: 'Reporting name',
    group: 'reporting',
    required: 'optional'
};

const REPORTING_ADDRESS = {
    paths: [
        ['licence', 'reporting', 'reportingInstructions', 'buildingAndStreet1'],
        ['licence', 'reporting', 'reportingInstructions', 'buildingAndStreet2'],
        ['licence', 'reporting', 'reportingInstructions', 'townOrCity'],
        ['licence', 'reporting', 'reportingInstructions', 'postcode']
    ],
    separator: '\n',
    displayName: 'Reporting address',
    group: 'reporting',
    required: 'optional'
};

const REPORTING_AT = {
    paths: [['licence', 'reporting', 'reportingDate', 'reportingTime']],
    displayName: 'Reporting at',
    group: 'reporting',
    required: 'mandatory'
};

const REPORTING_ON = {
    paths: [['licence', 'reporting', 'reportingDate', 'reportingDate']],
    displayName: 'Reporting on',
    group: 'reporting',
    required: 'mandatory'
};

const CURFEW_ADDRESS = {
    paths: [
        ['licence', 'proposedAddress', 'curfewAddress', 'addresses', 0, 'addressLine1'],
        ['licence', 'proposedAddress', 'curfewAddress', 'addresses', 0, 'addressLine2'],
        ['licence', 'proposedAddress', 'curfewAddress', 'addresses', 0, 'addressTown'],
        ['licence', 'proposedAddress', 'curfewAddress', 'addresses', 0, 'postCode']
    ],
    separator: '\n',
    displayName: 'Curfew address',
    group: 'curfew',
    required: 'optional'
};

const CURFEW_FIRST_FROM = {
    paths: [['licence', 'curfew', 'firstNight', 'firstNightFrom']],
    displayName: 'Curfew first night from',
    group: 'firstNight',
    required: 'mandatory'
};
const CURFEW_FIRST_UNTIL = {
    paths: [['licence', 'curfew', 'firstNight', 'firstNightUntil']],
    displayName: 'Curfew first night until',
    group: 'firstNight',
    required: 'mandatory'
};
const CURFEW_MON_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'mondayFrom']],
    displayName: 'Curfew Monday from',
    group: 'curfew',
    required: 'optional'
};
const CURFEW_MON_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'mondayUntil']],
    displayName: 'Curfew Monday until',
    group: 'curfew',
    required: 'optional'
};
const CURFEW_TUE_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'tuesdayFrom']],
    displayName: 'Curfew Tuesday from',
    group: 'curfew',
    required: 'optional'
};
const CURFEW_TUE_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'tuesdayUntil']],
    displayName: 'Curfew Tuesday until',
    group: 'curfew',
    required: 'optional'
};
const CURFEW_WED_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'wednesdayFrom']],
    displayName: 'Curfew Wednesday from',
    group: 'curfew',
    required: 'optional'
};
const CURFEW_WED_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'wednesdayUntil']],
    displayName: 'Curfew Wednesday until',
    group: 'curfew',
    required: 'optional'
};
const CURFEW_THU_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'thursdayFrom']],
    displayName: 'Curfew Thursday from',
    group: 'curfew',
    required: 'optional'
};
const CURFEW_THU_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'thursdayUntil']],
    displayName: 'Curfew Thursday until',
    group: 'curfew',
    required: 'optional'
};
const CURFEW_FRI_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'fridayFrom']],
    displayName: 'Curfew Friday from',
    group: 'curfew',
    required: 'optional'
};
const CURFEW_FRI_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'fridayUntil']],
    displayName: 'Curfew Friday until',
    group: 'curfew',
    required: 'optional'
};
const CURFEW_SAT_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'saturdayFrom']],
    displayName: 'Curfew Saturday from',
    group: 'curfew',
    required: 'optional'
};
const CURFEW_SAT_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'saturdayUntil']],
    displayName: 'Curfew Saturday until',
    group: 'curfew',
    required: 'optional'
};
const CURFEW_SUN_FROM = {
    paths: [['licence', 'curfew', 'curfewHours', 'sundayFrom']],
    displayName: 'Curfew Sunday from',
    group: 'curfew',
    required: 'optional'
};
const CURFEW_SUN_UNTIL = {
    paths: [['licence', 'curfew', 'curfewHours', 'sundayUntil']],
    displayName: 'Curfew Sunday until',
    group: 'curfew',
    required: 'optional'
};

const MONITOR = {
    paths: [['taggingCompany', 'telephone']],
    displayName: 'Monitoring company telephone number',
    group: 'monitoring',
    required: 'optional'
};

const VERSION = {
    VERSION_NUMBER,
    VERSION_DATE,
    APPROVER
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
    CURFEW_FIRST_FROM,
    CURFEW_FIRST_UNTIL,
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
        ...VERSION,
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
            filter: filtered => condition => !filtered.includes(condition.id),
            group: 'conditions',
            required: 'optional'
        },
        PSS: {
            noPlaceholder: true,
            paths: [['pss']],
            displayName: 'Post-sentence supervision conditions',
            startIndex: 9,
            divider: '\n\n',
            terminator: ';',
            filtered: ['ATTENDSAMPLE', 'ATTENDDEPENDENCY'],
            filter: filtered => condition => filtered.includes(condition.id),
            group: 'conditions',
            required: 'optional'
        }
    },

    hdc_yn: {
        ...VERSION,
        EST_PREMISE,
        EST_PHONE,
        ...OFFENDER,
        SENT_HDCAD,
        SENT_CRD,
        SENT_LED,
        SENT_SED,
        ...REPORTING,
        CURFEW_ADDRESS,
        ...CURFEW_HOURS,
        MONITOR,
        CONDITIONS: {
            noPlaceholder: true,
            paths: [['conditions']],
            displayName: 'Additional conditions',
            startIndex: 8,
            divider: '\n\n',
            terminator: ';',
            group: 'conditions',
            required: 'optional'
        }
    },

    hdc_ap: {
        ...VERSION,
        EST_PREMISE,
        EST_PHONE,
        ...OFFENDER,
        SENT_HDCAD,
        SENT_CRD,
        SENT_LED,
        SENT_SED,
        ...REPORTING,
        CURFEW_ADDRESS,
        ...CURFEW_HOURS,
        MONITOR,
        CONDITIONS: {
            noPlaceholder: true,
            paths: [['conditions']],
            displayName: 'Additional conditions',
            startIndex: 8,
            divider: '\n\n',
            terminator: ';',
            group: 'conditions',
            required: 'optional'
        }
    },

    hdc_pss: {
        ...VERSION,
        EST_PREMISE,
        EST_PHONE,
        ...OFFENDER,
        SENT_HDCAD,
        SENT_CRD,
        SENT_SED,
        SENT_TUSED,
        ...REPORTING,
        CURFEW_ADDRESS,
        ...CURFEW_HOURS,
        MONITOR,
        CONDITIONS: {
            noPlaceholder: true,
            paths: [['conditions']],
            displayName: 'Additional conditions',
            startIndex: 9,
            divider: '\n\n',
            terminator: ';',
            group: 'conditions',
            required: 'optional'
        }
    },

    hdc_u12: {
        ...VERSION,
        EST_PREMISE,
        EST_PHONE,
        ...OFFENDER,
        SENT_HDCAD,
        SENT_CRD,
        SENT_SED,
        ...REPORTING,
        CURFEW_ADDRESS,
        ...CURFEW_HOURS,
        MONITOR
    }

};
