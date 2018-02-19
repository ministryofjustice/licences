const {taskStates} = require('../models/taskStates');
const {licenceStages} = require('../models/licenceStages');
const {getIn, isEmpty} = require('./functionalHelpers');

module.exports = {getLicenceStatus};

function getLicenceStatus(licenceRecord) {

    if (!licenceRecord || !licenceRecord.licence || !licenceRecord.status) {
        return {
            stage: licenceStages.UNSTARTED,
            decisions: {},
            tasks: {
                exclusion: taskStates.UNSTARTED,
                crdTime: taskStates.UNSTARTED,
                suitability: taskStates.UNSTARTED,
                eligibility: taskStates.UNSTARTED,
                optOut: taskStates.UNSTARTED,
                bassReferral: taskStates.UNSTARTED,
                curfewAddress: taskStates.UNSTARTED,
                riskManagement: taskStates.UNSTARTED,
                curfewAddressReview: taskStates.UNSTARTED,
                curfewHours: taskStates.UNSTARTED,
                reportingInstructions: taskStates.UNSTARTED,
                licenceConditions: taskStates.UNSTARTED,
                approval: taskStates.UNSTARTED
            }
        };
    }
    const stage = licenceRecord.status;

    const results = getRequiredState(stage, licenceRecord.licence);
    const licenceStatus = results.reduce(combiner, {stage, decisions: {}, tasks: {}});

    console.log(licenceStatus);
    return licenceStatus;
}

function getRequiredState(stage, licence) {

    const config = {
        [licenceStages.ELIGIBILITY]: [getEligibilityStageState],
        [licenceStages.PROCESSING_RO]: [getEligibilityStageState, getRoStageState],
        [licenceStages.PROCESSING_CA]: [getEligibilityStageState, getRoStageState],
        [licenceStages.APPROVAL]: [getEligibilityStageState, getRoStageState, getApprovalStageState],
        [licenceStages.DECIDED]: [getEligibilityStageState, getRoStageState, getApprovalStageState]
    };

    return config[stage].map(getStateMethod => getStateMethod(licence));
}

const combiner = (acc, data) => {
    const combinedTasks = {...acc.tasks, ...data.tasks};
    const combinedDecisions = {...acc.decisions, ...data.decisions};

    return {
        ...acc,
        tasks: combinedTasks,
        decisions: combinedDecisions
    };
};

function getApprovalStageState(licence) {
    const {approved, refused, postponed, approval} = getApprovalState(licence);
    return {
        decisions: {
            approved,
            refused,
            postponed
        },
        tasks: {
            approval
        }
    };
}

function getRoStageState(licence) {
    const {riskManagementNeeded, victimLiasionNeeded, riskManagement} = getRiskManagementState(licence);
    const {curfewAddressReview, curfewAddressApproved} = getCurfewAddressReviewState(licence);
    const {curfewHours} = getCurfewHoursState(licence);
    const {reportingInstructions} = getReportingInstructionsState(licence);
    const {licenceConditions, standardOnly, additional, bespoke} = getLicenceConditionsState(licence);

    return {
        decisions: {
            riskManagementNeeded,
            victimLiasionNeeded,
            curfewAddressApproved,
            standardOnly,
            additional,
            bespoke
        },
        tasks: {
            riskManagement,
            curfewAddressReview,
            curfewHours,
            reportingInstructions,
            licenceConditions
        }
    };
}

function getEligibilityStageState(licence) {
    const {excluded, exclusion} = getExclusionTaskState(licence);
    const {insufficientTime, crdTime} = getCrdTimeState(licence);
    const {unsuitable, suitability} = getSuitabilityState(licence);
    const eligibility = getOverallState([exclusion, crdTime, suitability]);
    const eligible = noneOf([excluded, insufficientTime, unsuitable]);
    const {optedOut, optOut} = getOptOutState(licence);
    const {bassReferralNeeded, bassReferral} = getBassReferralState(licence);
    const {curfewAddress} = getCurfewAddressState(licence);

    return {
        decisions: {
            excluded,
            insufficientTime,
            unsuitable,
            eligible,
            optedOut,
            bassReferralNeeded
        },
        tasks: {
            exclusion,
            crdTime,
            suitability,
            eligibility,
            optOut,
            bassReferral,
            curfewAddress
        }
    };
}

function getExclusionTaskState(licence) {

    return {
        excluded: getIn(licence, ['eligibility', 'excluded', 'decision']) === 'Yes',
        exclusion: getIn(licence, ['eligibility', 'excluded', 'decision']) ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getCrdTimeState(licence) {

    return {
        insufficientTime: getIn(licence, ['eligibility', 'crdTime', 'decision']) === 'Yes',
        crdTime: getIn(licence, ['eligibility', 'crdTime', 'decision']) ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getSuitabilityState(licence) {

    return {
        unsuitable: getIn(licence, ['eligibility', 'suitability', 'decision']) === 'Yes',
        suitability:
            getIn(licence, ['eligibility', 'suitability', 'decision']) ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getOptOutState(licence) {

    return {
        optedOut: getIn(licence, ['proposedAddress', 'optOut', 'decision']) === 'Yes',
        optOut: getIn(licence, ['proposedAddress', 'optOut', 'decision']) ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getBassReferralState(licence) {

    return {
        bassReferralNeeded: getIn(licence, ['proposedAddress', 'bassReferral', 'decision']) === 'Yes',
        bassReferral:
            getIn(licence, ['proposedAddress', 'bassReferral', 'decision']) ? taskStates.DONE : taskStates.UNSTARTED
    };

}

function getRiskManagementState(licence) {

    return {
        riskManagementNeeded: getIn(licence, ['risk', 'riskManagement', 'planningActions']) === 'Yes',
        victimLiasionNeeded: getIn(licence, ['risk', 'riskManagement', 'victimLiaison']) === 'Yes',
        riskManagement: getState(licence)
    };

    function getState(licence) {

        if (isEmpty(getIn(licence, ['risk', 'riskManagement']))) {
            return taskStates.UNSTARTED;
        }

        if (isEmpty(getIn(licence, ['risk', 'riskManagement', 'planningActions']))) {
            return taskStates.STARTED;
        }

        if (getIn(licence, ['risk', 'riskManagement', 'victimLiaison'])) {
            return taskStates.DONE;
        }

        return taskStates.STARTED;
    }
}

function getApprovalState(licence) {

    return {
        approved: getIn(licence, ['approval']) === 'Yes',
        refused: getIn(licence, ['approval']) === 'No',
        postponed: getIn(licence, ['postponed']) === 'Yes',
        approval: getIn(licence, ['approval']) ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getCurfewAddressState(licence) {
    return {
        curfewAddress: getState(licence)
    };

    function getState(licence) {
        return getIn(licence, ['proposedAddress', 'curfewAddress']) ? taskStates.STARTED : taskStates.UNSTARTED;
        // todo DONE when all elements have values
    }
}


function getCurfewAddressReviewState(licence) {

    const curfewAddressReview = getState(licence);
    const curfewAddressApproved = getApproved(licence);

    return {curfewAddressReview, curfewAddressApproved};

    function getState(licence) {

        if (isEmpty(getIn(licence, ['curfew', 'curfewAddressReview']))) {
            return taskStates.UNSTARTED;
        }

        if (isEmpty(getIn(licence, ['curfew', 'curfewAddressReview', 'consent']))) {
            return taskStates.STARTED;
        }

        if (isEmpty(getIn(licence, ['curfew', 'curfewAddressReview', 'deemedSafe']))) {
            return taskStates.STARTED;
        }

        if (getIn(licence, ['curfew', 'curfewAddressReview', 'consent']) === 'Yes') {
            if (isEmpty(getIn(licence, ['curfew', 'curfewAddressReview', 'electricity']))) {
                return taskStates.STARTED;
            }
            if (isEmpty(getIn(licence, ['curfew', 'curfewAddressReview', 'homeVisitConducted']))) {
                return taskStates.STARTED;
            }
        }

        return taskStates.DONE;
    }

    function getApproved(licence) {
        return curfewAddressReview === taskStates.DONE &&
            getIn(licence, ['curfew', 'curfewAddressReview', 'consent']) === 'Yes' &&
            getIn(licence, ['curfew', 'curfewAddressReview', 'deemedSafe']) === 'Yes';
    }
}

function getCurfewHoursState(licence) {
    return {
        curfewHours: getIn(licence, ['curfew', 'curfewHours']) ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getReportingInstructionsState(licence) {

    return {
        reportingInstructions:
            getIn(licence, ['reporting', 'reportingInstructions']) ? taskStates.DONE : taskStates.UNSTARTED
        // todo check for missing mandatory elements
    };
}

function getLicenceConditionsState(licence) {
    if (isEmpty(getIn(licence, ['licenceConditions']))) {
        return {
            standardOnly: false,
            additional: 0,
            bespoke: 0,
            totalCount: 0,
            licenceConditions: taskStates.UNSTARTED
        };
    }

    const standardOnly =
        getIn(licence, ['licenceConditions', 'standard', 'additionalConditionsRequired']) === 'No';

    const additionals = getIn(licence, ['licenceConditions', 'additional']);
    const bespokes = getIn(licence, ['licenceConditions', 'bespoke']);

    const additional = additionals ? Object.keys(additionals).length : 0;
    const bespoke = bespokes ? bespokes.length : 0;

    const totalCount = additional + bespoke;

    return {
        standardOnly,
        additional,
        bespoke,
        totalCount,
        licenceConditions: (standardOnly || totalCount > 0) ? taskStates.DONE : taskStates.STARTED
    };
}

function getOverallState(tasks) {
    if (tasks.some(it => it === taskStates.STARTED)) {
        return taskStates.STARTED;
    } else if (tasks.every(it => it === taskStates.UNSTARTED)) {
        return taskStates.UNSTARTED;
    } else {
        return taskStates.DONE;
    }
}

function noneOf(booleans) {
    return !booleans.some(it => it === true);
}
