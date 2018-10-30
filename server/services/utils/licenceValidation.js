const {
    all,
    pipe,
    getIn,
    isEmpty,
    merge,
    flatten,
    mergeWithRight,
    removePath,
    equals
} = require('../../utils/functionalHelpers');

const getValidationMessage = require('../config/validationMessages');
const validator = require('../config/validationRules');
const {sectionContaining, formsInSection, reviewForms, bassReviewForms} = require('../config/formsAndSections');

const {getConfiscationOrderState} = require('../../utils/licenceStatus');

function getLicenceErrors({licence, forms = reviewForms}) {

    const validationErrors = forms.map(validate(licence)).filter(item => item);

    if (isEmpty(validationErrors)) {
        return [];
    }

    return flatten(validationErrors).reduce((errorObject, error) => mergeWithRight(errorObject, error.path), {});
}

function getConditionsErrors(licence) {
    return getLicenceErrors({licence, forms: formsInSection['licenceConditions']});
}

function getValidationErrorsForReview({licenceStatus, licence}) {
    const {stage, decisions, tasks} = licenceStatus;
    const newAddressAddedForReview = stage !== 'PROCESSING_RO' && tasks.curfewAddressReview === 'UNSTARTED';

    if (stage === 'ELIGIBILITY' && decisions && decisions.bassReferralNeeded) {
        return getLicenceErrors({licence, forms: [
                ...formsInSection['eligibility'],
                'bassRequest'
            ]});
    }

    if (stage === 'ELIGIBILITY' || newAddressAddedForReview) {
        return getEligibilityErrors({licence});
    }

    if (stage === 'PROCESSING_RO' && decisions.curfewAddressApproved === 'rejected') {
        return getLicenceErrors({licence, forms: formsInSection['proposedAddress']});
    }

    if (stage === 'PROCESSING_RO' && decisions.bassAreaNotSuitable) {
        return getLicenceErrors({licence, forms: formsInSection['bassReferral']});
    }

    if (decisions.bassReferralNeeded) {
        return getLicenceErrors({licence, forms: bassReviewForms});
    }

    return getLicenceErrors({licence, forms: reviewForms});
}

function getEligibilityErrors({licence}) {
    const errorObject = getLicenceErrors({licence, forms: [
            ...formsInSection['eligibility'],
            ...formsInSection['proposedAddress']
        ]});

    const unwantedAddressFields = ['consent', 'electricity', 'homeVisitConducted', 'deemedSafe', 'unsafeReason'];

    if (typeof getIn(errorObject, ['proposedAddress', 'curfewAddress']) === 'string') {
        return errorObject;
    }

    return unwantedAddressFields.reduce(removeFromAddressReducer, errorObject);
}

function removeFromAddressReducer(errorObject, addressKey) {
    const newObject = removePath(['proposedAddress', 'curfewAddress', addressKey], errorObject);

    if (isEmpty(getIn(newObject, ['proposedAddress', 'curfewAddress']))) {
        return removePath(['proposedAddress'], newObject);
    }

    return newObject;
}

function getValidationErrorsForPage(licence, forms) {
    if (equals(forms, ['release'])) {
        const {confiscationOrder} = getConfiscationOrderState(licence);
        return getApprovalErrors({licence, confiscationOrder});
    }

    return getLicenceErrors({licence, forms});
}

function getApprovalErrors({licence, confiscationOrder}) {
    const errorObject = getLicenceErrors({licence, forms: ['release']});

    if (confiscationOrder) {
        return errorObject;
    }

    const removeNotedCommentsError = removePath(['approval', 'release', 'notedComments']);
    const errorsWithoutNotedComments = removeNotedCommentsError(errorObject);

    const noErrorsInApproval = isEmpty(getIn(errorsWithoutNotedComments, ['approval', 'release']));
    if (noErrorsInApproval) {
        const removeApprovalError = removePath(['approval']);
        return removeApprovalError(errorsWithoutNotedComments);
    }

    return errorsWithoutNotedComments;
}

function validate(licence) {
    return form => {
        const section = sectionContaining[form];

        if (!licence[section]) {
            return [{
                path: {[section]: 'Not answered'}
            }];
        }

        const errors = validator.validate(licence, section, form);

        const allErrors = form === 'curfewAddress' ? addResidentErrors(errors, licence[section]) : errors;

        if (!allErrors) {
            return [];
        }

        const errorsArray = getArrayOfPathsAndMessages(section, form, allErrors);

        return updateWithSpecialCases(errorsArray);
    };
}

function getArrayOfPathsAndMessages(section, form, allErrors) {

    return allErrors.details.map(error => {
        // error object may have multiple error objects e.g. list of residents errors
        if (Array.isArray(error)) {
            return error.map(createPathWithErrorMessage);
        }

        return createPathWithErrorMessage(error);
    });

    function createPathWithErrorMessage(errorItem) {
        return {
            path: {
                [section]: {
                    [form]: errorItem.path.reduceRight((object, key) => {
                        return {[key]: object};
                    }, getValidationMessage(errorItem.type, errorItem.message, [form, ...errorItem.path]))
                }
            }
        };
    }
}

function addResidentErrors(errorsForSection, licenceSection) {
    // resident errors handled separately as can't successfully get errors from list of objects using standard joi
    const residents = getIn(licenceSection, ['curfewAddress', 'residents']);
    if (!residents) {
        return errorsForSection;
    }

    return residents.reduce((allErrors, resident, index) => {

        const residentErrors = validator.validateResident(resident);
        if (!residentErrors) {
            return allErrors;
        }

        // merge the details of the resident errors into same object
        const residentDetails = residentErrors.details.map(detail => {
            return merge(detail, {path: ['residents', index, ...detail.path]});
        });

        return {...allErrors, details: [...allErrors.details, residentDetails]};

    }, errorsForSection || {details: []});

}

const specialCases = [
    {
        path: ['proposedAddress', 'curfewAddress', 'occupier', 'name'],
        method: removeErrorsIfAllMatch([
            {
                path: ['path', 'proposedAddress', 'curfewAddress', 'occupier', 'name'],
                value: getValidationMessage('', '', ['curfewAddress', 'occupier', 'name'])
            },
            {
                path: ['path', 'proposedAddress', 'curfewAddress', 'occupier', 'relationship'],
                value: getValidationMessage('', '', ['curfewAddress', 'occupier', 'relationship'])
            }
        ])
    }
];

function updateWithSpecialCases(errorObject) {

    const specialCaseIsInErrorObject = specialCase => errorObject.find(error => getIn(error.path, specialCase.path));
    const specialCaseMethod = specialCase => specialCase.method;

    const methodsToRunOnObject = specialCases
        .filter(specialCaseIsInErrorObject)
        .map(specialCaseMethod);

    if (isEmpty(methodsToRunOnObject)) {
        return errorObject;
    }

    return pipe(...methodsToRunOnObject)(errorObject);
}

function removeErrorsIfAllMatch(pathsToTest) {
    return errors => {
        const errorsListContainsObject = pathsToTest => {
            return errors.find(error => getIn(error, pathsToTest.path) === pathsToTest.value);
        };

        if (all(errorsListContainsObject, pathsToTest)) {
            return errors.filter(error => !pathsToTest.find(path => getIn(error, path.path)));
        }

        return errors;
    };
}

module.exports = {
    getLicenceErrors,
    getConditionsErrors,
    getValidationErrorsForReview,
    getValidationErrorsForPage,
    getEligibilityErrors
};
