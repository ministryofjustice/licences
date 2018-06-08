const {taskStates} = require('../models/taskStates');
const {licenceStages} = require('../models/licenceStages');
const {getIn, isEmpty, lastItem} = require('./functionalHelpers');
const {isAcceptedAddress, isRejectedAddress, addressReviewStarted} = require('../utils/addressHelpers');

module.exports = {getLicenceStatus, getConfiscationOrderTaskState};

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
        [licenceStages.DECIDED]: [getEligibilityStageState, getRoStageState, getCaStageState, getApprovalStageState]
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
    const {seriousOffence, seriousOffenceCheck} = getSeriousOffenceCheckTaskState(licence);
    const {onRemand, onRemandCheck} = getOnRemandCheckTaskState(licence);
    const {confiscationOrder, confiscationOrderCheck} = getConfiscationOrderTaskState(licence);
    const finalChecks = getOverallState([seriousOffenceCheck, onRemandCheck, confiscationOrderCheck]);
    const finalCheckPass = !(seriousOffence || onRemand);
    const postponed = getIn(licence, ['finalChecks', 'postpone', 'decision']) === 'Yes';
    const finalChecksRefused = getIn(licence, ['finalChecks', 'refusal', 'decision']) === 'Yes';

    return {
        decisions: {
            seriousOffence,
            onRemand,
            confiscationOrder,
            finalCheckPass,
            postponed,
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
    const {excluded, exclusion} = getExclusionTaskState(licence);
    const {insufficientTime, crdTime} = getCrdTimeState(licence);
    const {unsuitable, suitability} = getSuitabilityState(licence);
    const eligibility = getEligibilityState(unsuitable, excluded, [exclusion, crdTime, suitability]);
    const eligible = !(excluded || insufficientTime || unsuitable);
    const {curfewAddressApproved} = getCurfewAddressReviewState(licence);

    const {optedOut, optOut} = getOptOutState(licence);
    const {bassReferralNeeded, bassReferral} = getBassReferralState(licence);
    const {curfewAddress} = getCurfewAddressState(licence, optedOut, bassReferralNeeded);

    return {
        decisions: {
            excluded,
            insufficientTime,
            unsuitable,
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

function getExclusionTaskState(licence) {

    const excludedAnswer = getIn(licence, ['eligibility', 'excluded', 'decision']);

    return {
        excluded: excludedAnswer && excludedAnswer === 'Yes',
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

        // todo mandatory address elements

        const required = ['occupier', 'cautionedAgainstResident'];
        if (required.some(field => !addresses.find(address => address[field]))) {
            return taskStates.STARTED;
        }

        return taskStates.DONE;
    }
}

function getCurfewAddressReviewState(licence) {
    const addresses = getIn(licence, ['proposedAddress', 'curfewAddress', 'addresses']);

    if (!addresses || isEmpty(addresses)) {
        return {curfewAddressReview: taskStates.UNSTARTED, curfewAddressApproved: 'unfinished'};
    }

    const lastAddress = lastItem(addresses);

    if (isAcceptedAddress(lastAddress)) {
        return {curfewAddressReview: taskStates.DONE, curfewAddressApproved: 'approved'};
    }

    if (isRejectedAddress(lastAddress)) {
        return {curfewAddressReview: taskStates.DONE, curfewAddressApproved: 'rejected'};
    }

    if (addressReviewStarted(lastAddress)) {
        return {curfewAddressReview: taskStates.STARTED, curfewAddressApproved: 'unfinished'};
    }

    return {curfewAddressReview: taskStates.UNSTARTED, curfewAddressApproved: 'unfinished'};
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

        if (isEmpty(getIn(licence, ['reporting', 'reportingInstructions']))) {
            return taskStates.UNSTARTED;
        }

        if (isEmpty(getIn(licence, ['reporting', 'reportingInstructions', 'name']))) {
            return taskStates.UNSTARTED;
        }

        // todo mandatory reportin instructions elements

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

function getSeriousOffenceCheckTaskState(licence) {

    const seriousOffenceAnswer = getIn(licence, ['finalChecks', 'seriousOffence', 'decision']);

    return {
        seriousOffence: seriousOffenceAnswer && seriousOffenceAnswer === 'Yes',
        seriousOffenceCheck: seriousOffenceAnswer ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getOnRemandCheckTaskState(licence) {

    const onRemandAnswer = getIn(licence, ['finalChecks', 'onRemand', 'decision']);

    return {
        onRemand: onRemandAnswer && onRemandAnswer === 'Yes',
        onRemandCheck: onRemandAnswer ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getConfiscationOrderTaskState(licence) {

    const confiscationOrderAnswer = getIn(licence, ['finalChecks', 'confiscationOrder', 'decision']);

    return {
        confiscationOrder: confiscationOrderAnswer && confiscationOrderAnswer === 'Yes',
        confiscationOrderCheck: confiscationOrderAnswer ? taskStates.DONE : taskStates.UNSTARTED
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

function getEligibilityState(unsuitable, excluded, tasks) {
    if (tasks.every(it => it === taskStates.UNSTARTED)) {
        return taskStates.UNSTARTED;
    }

    const allDone = tasks.every(it => it === taskStates.DONE);
    if (excluded || unsuitable || allDone) {
        return taskStates.DONE;
    }

    return taskStates.STARTED;
}

const refusalReasons = {
    addressUnsuitable: 'Address unsuitable',
    insufficientTime: 'Insufficient time'
};
