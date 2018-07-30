const {taskStates} = require('../models/taskStates');
const {licenceStages} = require('../models/licenceStages');
const {getIn, isEmpty, lastItem} = require('./functionalHelpers');
const {
    isAcceptedAddress,
    isRejectedAddress,
    addressReviewStarted,
    isWithdrawnAddress
} = require('../utils/addressHelpers');

module.exports = {getLicenceStatus, getConfiscationOrderState};

function getLicenceStatus(licenceRecord) {

    if (!licenceRecord || isEmpty(licenceRecord.licence) || !licenceRecord.stage) {
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
                seriousOffenceCheck: taskStates.UNSTARTED,
                onRemandCheck: taskStates.UNSTARTED,
                confiscationOrderCheck: taskStates.UNSTARTED,
                finalChecks: taskStates.UNSTARTED,
                approval: taskStates.UNSTARTED
            }
        };
    }
    const stage = licenceRecord.stage;

    const results = getRequiredState(stage, licenceRecord.licence);
    return results.reduce(combiner, {stage, decisions: {}, tasks: {}});
}

function getRequiredState(stage, licence) {

    const config = {
        [licenceStages.ELIGIBILITY]: [getEligibilityStageState],
        [licenceStages.PROCESSING_RO]: [getEligibilityStageState, getRoStageState],
        [licenceStages.PROCESSING_CA]: [getEligibilityStageState, getRoStageState, getCaStageState],
        [licenceStages.APPROVAL]: [getEligibilityStageState, getRoStageState, getCaStageState, getApprovalStageState],
        [licenceStages.DECIDED]: [getEligibilityStageState, getRoStageState, getCaStageState, getApprovalStageState],
        [licenceStages.MODIFIED]:
            [getEligibilityStageState, getRoStageState, getCaStageState, getApprovalStageState],
        [licenceStages.MODIFIED_APPROVAL]:
            [getEligibilityStageState, getRoStageState, getCaStageState, getApprovalStageState]
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
    const {approved, refused, approval, refusalReason} = getApprovalState(licence);
    return {
        decisions: {
            approved,
            refused,
            refusalReason
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

function getCaStageState(licence) {

    const {seriousOffence, seriousOffenceCheck} = getSeriousOffenceCheckState(licence);
    const {onRemand, onRemandCheck} = getOnRemandCheckState(licence);
    const {confiscationOrder, confiscationOrderCheck} = getConfiscationOrderState(licence);
    const {finalChecksPass, finalChecksRefused, postponed} = getFinalChecksState(licence, seriousOffence, onRemand);
    const finalChecks = getOverallState([seriousOffenceCheck, onRemandCheck, confiscationOrderCheck]);

    return {
        decisions: {
            seriousOffence,
            onRemand,
            confiscationOrder,
            postponed,
            finalChecksPass,
            finalChecksRefused
        },
        tasks: {
            seriousOffenceCheck,
            onRemandCheck,
            confiscationOrderCheck,
            finalChecks
        }
    };
}

function getEligibilityStageState(licence) {

    const {exclusion, excluded} = getExclusionState(licence);
    const {crdTime, insufficientTime, insufficientTimeContinue, insufficientTimeStop} = getCrdTimeState(licence);
    const {suitability, unsuitable, unsuitableResult, exceptionalCircumstances} = getSuitabilityState(licence);

    const notEligible = (excluded || insufficientTimeStop || unsuitableResult);
    const {eligibility, eligible} = getEligibilityState(notEligible, [exclusion, crdTime, suitability]);

    const {curfewAddressApproved} = getCurfewAddressReviewState(licence);
    const {optedOut, optOut} = getOptOutState(licence);
    const {bassReferralNeeded, bassReferral} = getBassReferralState(licence);
    const {curfewAddress} = getCurfewAddressState(licence, optedOut, bassReferralNeeded);

    return {
        decisions: {
            exceptionalCircumstances,
            excluded,
            insufficientTime,
            insufficientTimeContinue,
            insufficientTimeStop,
            unsuitable,
            unsuitableResult,
            eligible,
            optedOut,
            bassReferralNeeded,
            curfewAddressApproved
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

function getEligibilityState(notEligible, eligibilityTasks) {

    const eligibility = notEligible ? taskStates.DONE : getOverallState(eligibilityTasks);

    // some things mean not eligible no matter what else, but we only know definitely eligible when all answers complete
    const eligible = notEligible ? false : eligibility === taskStates.DONE;

    return {
        eligibility,
        eligible
    };
}

function getExclusionState(licence) {

    const excludedAnswer = getIn(licence, ['eligibility', 'excluded', 'decision']);

    return {
        excluded: excludedAnswer === 'Yes',
        exclusion: excludedAnswer ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getCrdTimeState(licence) {
    const decision = getIn(licence, ['eligibility', 'crdTime', 'decision']);
    const dmApproval = getIn(licence, ['eligibility', 'crdTime', 'dmApproval']);

    return {
        insufficientTimeContinue: decision === 'Yes' && dmApproval === 'Yes',
        insufficientTimeStop: decision === 'Yes' && dmApproval === 'No',
        insufficientTime: decision === 'Yes',
        crdTime: getState(licence)
    };

    function getState(licence) {
        if (isEmpty(getIn(licence, ['eligibility', 'crdTime']))) {
            return taskStates.UNSTARTED;
        }

        if (decision === 'No') {
            return taskStates.DONE;
        }

        if (isEmpty(dmApproval)) {
            return taskStates.STARTED;
        }

        return taskStates.DONE;
    }
}

function getSuitabilityState(licence) {

    const unsuitableAnswer = getIn(licence, ['eligibility', 'suitability', 'decision']);
    const exceptionalCircumstances = getIn(licence, ['eligibility', 'exceptionalCircumstances', 'decision']);

    return {
        unsuitable: unsuitableAnswer === 'Yes',
        exceptionalCircumstances: exceptionalCircumstances === 'Yes',
        unsuitableResult: unsuitableAnswer === 'Yes' && exceptionalCircumstances === 'No',
        suitability: getState(licence)
    };

    function getState(licence) {

        if (!unsuitableAnswer) {
            return taskStates.UNSTARTED;
        }

        if (unsuitableAnswer === 'No') {
            return taskStates.DONE;
        }

        if (exceptionalCircumstances) {
            return taskStates.DONE;
        }

        return taskStates.STARTED;
    }
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
    const addressProposedAnswer = getIn(licence, ['proposedAddress', 'addressProposed', 'decision']);

    return {
        bassReferralNeeded: bassReferralAnswer === 'Yes' && addressProposedAnswer === 'No',
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

    const refusalReasons = {
        addressUnsuitable: 'Address unsuitable',
        insufficientTime: 'Insufficient time'
    };

    const decision = getIn(licence, ['approval', 'release', 'decision']);
    const reason = getIn(licence, ['approval', 'release', 'reason']);

    return {
        approved: decision === 'Yes',
        refused: decision === 'No',
        approval: isEmpty(decision) ? taskStates.UNSTARTED : taskStates.DONE,
        refusalReason: refusalReasons[reason]
    };
}

function getCurfewAddressState(licence, optedOut, bassReferralNeeded) {

    return {
        curfewAddress: getState(licence)
    };

    function getState(licence) {

        const addresses = getIn(licence, ['proposedAddress', 'curfewAddress', 'addresses']);

        if (optedOut || bassReferralNeeded) {
            return taskStates.DONE;
        }

        if (!addresses) {
            return taskStates.UNSTARTED;
        }

        const required = ['cautionedAgainstResident'];
        if (required.some(field => !addresses.find(address => address[field]))) {
            return taskStates.STARTED;
        }

        return taskStates.DONE;
    }
}

function getCurfewAddressReviewState(licence) {

    const addresses = getIn(licence, ['proposedAddress', 'curfewAddress', 'addresses']);

    if (!addresses || isEmpty(addresses)) {
        return {curfewAddressReview: taskStates.UNSTARTED, curfewAddressApproved: 'unstarted'};
    }

    const lastAddress = lastItem(addresses);

    if (isWithdrawnAddress(lastAddress)) {
        return {curfewAddressReview: taskStates.STARTED, curfewAddressApproved: 'withdrawn'};
    }

    if (isAcceptedAddress(lastAddress)) {
        return {curfewAddressReview: taskStates.DONE, curfewAddressApproved: 'approved'};
    }

    if (isRejectedAddress(lastAddress)) {
        return {curfewAddressReview: taskStates.DONE, curfewAddressApproved: 'rejected'};
    }

    if (addressReviewStarted(lastAddress)) {
        return {curfewAddressReview: taskStates.STARTED, curfewAddressApproved: 'unfinished'};
    }

    return {curfewAddressReview: taskStates.UNSTARTED, curfewAddressApproved: 'unstarted'};
}

function getCurfewHoursState(licence) {
    return {
        curfewHours: getIn(licence, ['curfew', 'curfewHours']) ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getReportingInstructionsState(licence) {

    return {
        reportingInstructions: getState(licence)
    };

    function getState(licence) {

        const reportingInstructions = getIn(licence, ['reporting', 'reportingInstructions']);

        if (isEmpty(reportingInstructions)) {
            return taskStates.UNSTARTED;
        }

        const required = ['name', 'buildingAndStreet1', 'townOrCity', 'postcode', 'telephone'];
        if (required.some(field => isEmpty(getIn(reportingInstructions, [field])))) {
            return taskStates.STARTED;
        }

        return taskStates.DONE;
    }
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

function getSeriousOffenceCheckState(licence) {

    const seriousOffenceAnswer = getIn(licence, ['finalChecks', 'seriousOffence', 'decision']);

    return {
        seriousOffence: seriousOffenceAnswer && seriousOffenceAnswer === 'Yes',
        seriousOffenceCheck: seriousOffenceAnswer ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getOnRemandCheckState(licence) {

    const onRemandAnswer = getIn(licence, ['finalChecks', 'onRemand', 'decision']);

    return {
        onRemand: onRemandAnswer && onRemandAnswer === 'Yes',
        onRemandCheck: onRemandAnswer ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getConfiscationOrderState(licence) {

    const confiscationOrderAnswer = getIn(licence, ['finalChecks', 'confiscationOrder', 'decision']);

    return {
        confiscationOrder: confiscationOrderAnswer && confiscationOrderAnswer === 'Yes',
        confiscationOrderCheck: confiscationOrderAnswer ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getFinalChecksState(licence, seriousOffence, onRemand) {

    const finalChecksPass = !(seriousOffence || onRemand);

    const postponed = getIn(licence, ['finalChecks', 'postpone', 'decision']) === 'Yes';
    const finalChecksRefused = getIn(licence, ['finalChecks', 'refusal', 'decision']) === 'Yes';

    return {
        finalChecksPass,
        finalChecksRefused,
        postponed
    };
}

function getOverallState(tasks) {

    if (tasks.every(it => it === taskStates.UNSTARTED)) {
        return taskStates.UNSTARTED;
    }

    if (tasks.every(it => it === taskStates.DONE)) {
        return taskStates.DONE;
    }

    return taskStates.STARTED;
}


