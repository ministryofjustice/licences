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
    return results.reduce(combiner, {stage, decisions: {}, tasks: {}});
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
    const eligible = allFalse([excluded, insufficientTime, unsuitable]);
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

    const excludedAnswer = getIn(licence, ['eligibility', 'excluded', 'decision']);

    return {
        excluded: excludedAnswer === 'Yes',
        exclusion: excludedAnswer ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getCrdTimeState(licence) {

    const timeAnswer = getIn(licence, ['eligibility', 'crdTime', 'decision']);

    return {
        insufficientTime: timeAnswer === 'Yes',
        crdTime: timeAnswer ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getSuitabilityState(licence) {

    const suitableAnswer = getIn(licence, ['eligibility', 'suitability', 'decision']);

    return {
        unsuitable: suitableAnswer === 'Yes',
        suitability: suitableAnswer ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getOptOutState(licence) {

    const optOutAnswer = getIn(licence, ['proposedAddress', 'optOut', 'decision']);

    return {
        optedOut: optOutAnswer === 'Yes',
        optOut: optOutAnswer ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getBassReferralState(licence) {

    const bassReferralAnswer = getIn(licence, ['proposedAddress', 'bassReferral', 'decision']);

    return {
        bassReferralNeeded: bassReferralAnswer === 'Yes',
        bassReferral: bassReferralAnswer ? taskStates.DONE : taskStates.UNSTARTED
    };

}

function getRiskManagementState(licence) {

    const riskManagementAnswer = getIn(licence, ['risk', 'riskManagement', 'planningActions']);
    const victimLiaisonAnswer = getIn(licence, ['risk', 'riskManagement', 'victimLiaison']);

    return {
        riskManagementNeeded: riskManagementAnswer === 'Yes',
        victimLiasionNeeded: victimLiaisonAnswer === 'Yes',
        riskManagement: getState(licence)
    };

    function getState(licence) {

        if (isEmpty(getIn(licence, ['risk', 'riskManagement']))) {
            return taskStates.UNSTARTED;
        }

        if (isEmpty(riskManagementAnswer)) {
            return taskStates.STARTED;
        }

        if (victimLiaisonAnswer) {
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

    const consentAnswer = getIn(licence, ['curfew', 'curfewAddressReview', 'consent']);
    const deemedSafeAnswer = getIn(licence, ['curfew', 'curfewAddressReview', 'deemedSafe']);


    const curfewAddressReview = getState(licence);
    const curfewAddressApproved = getApproved(licence);


    return {curfewAddressReview, curfewAddressApproved};

    function getState(licence) {

        if (isEmpty(getIn(licence, ['curfew', 'curfewAddressReview']))) {
            return taskStates.UNSTARTED;
        }

        if (isEmpty(consentAnswer)) {
            return taskStates.STARTED;
        }

        if (isEmpty(deemedSafeAnswer)) {
            return taskStates.STARTED;
        }

        if (consentAnswer === 'Yes') {
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
        return curfewAddressReview === taskStates.DONE && consentAnswer === 'Yes' && deemedSafeAnswer === 'Yes';
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

function allFalse(booleans) {
    return booleans.every(it => it === false);
}

