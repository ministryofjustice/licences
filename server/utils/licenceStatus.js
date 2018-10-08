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
                curfewAddress: taskStates.UNSTARTED,
                bassRequest: taskStates.UNSTARTED,
                riskManagement: taskStates.UNSTARTED,
                curfewAddressReview: taskStates.UNSTARTED,
                curfewHours: taskStates.UNSTARTED,
                reportingInstructions: taskStates.UNSTARTED,
                licenceConditions: taskStates.UNSTARTED,
                seriousOffenceCheck: taskStates.UNSTARTED,
                onRemandCheck: taskStates.UNSTARTED,
                confiscationOrderCheck: taskStates.UNSTARTED,
                finalChecks: taskStates.UNSTARTED,
                approval: taskStates.UNSTARTED,
                createLicence: taskStates.UNSTARTED
            }
        };
    }
    const stage = licenceRecord.stage;
    const results = getRequiredState(stage, licenceRecord.licence);
    const createLicence = isPostDecision(stage) ? getLicenceCreatedTaskState(licenceRecord) : taskStates.UNSTARTED;

    return results.reduce(combiner, {stage, decisions: {}, tasks: {createLicence}});
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
    const {approved, refused, dmRefused, approval, refusalReason, bassAddress, bassOffer} = getApprovalState(licence);

    return {
        decisions: {
            approved,
            refused,
            dmRefused,
            refusalReason,
            bassOffer
        },
        tasks: {
            approval,
            bassAddress
        }
    };
}

function getRoStageState(licence) {

    const {riskManagementNeeded, victimLiasionNeeded, riskManagement, awaitingRiskInformation} = getRiskManagementState(licence);
    const {curfewAddressReview, curfewAddressApproved} = getCurfewAddressReviewState(licence);
    const {curfewHours} = getCurfewHoursState(licence);
    const {reportingInstructions} = getReportingInstructionsState(licence);
    const {licenceConditions, standardOnly, additional, bespoke} = getLicenceConditionsState(licence);

    return {
        decisions: {
            riskManagementNeeded,
            awaitingRiskInformation,
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
    const {bassReferralNeeded, bassRequest} = getBassRequestState(licence);
    const {curfewAddress} = getCurfewAddressState(licence, optedOut, bassReferralNeeded, curfewAddressApproved);

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
            bassRequest,
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

function getBassRequestState(licence) {

    const bassRequestAnswer = getIn(licence, ['bassReferral', 'bassRequest', 'bassRequested']);
    const addressProposedAnswer = getIn(licence, ['proposedAddress', 'addressProposed', 'decision']);

    return {
        bassReferralNeeded: bassRequestAnswer === 'Yes' && addressProposedAnswer === 'No',
        bassRequest: bassRequestAnswer ? taskStates.DONE : taskStates.UNSTARTED
    };

}

function getRiskManagementState(licence) {

    const riskManagementAnswer = getIn(licence, ['risk', 'riskManagement', 'planningActions']);
    const victimLiaisonAnswer = getIn(licence, ['risk', 'riskManagement', 'victimLiaison']);
    const awaitingInformationAnswer = getIn(licence, ['risk', 'riskManagement', 'awaitingInformation']);

    return {
        riskManagementNeeded: riskManagementAnswer === 'Yes',
        victimLiasionNeeded: victimLiaisonAnswer === 'Yes',
        awaitingRiskInformation: awaitingInformationAnswer === 'Yes',
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

    const dmApproval = getDmApproval(licence);
    const caRefusal = getCaRefusal(licence);
    const bassOffer = getIn(licence, ['proposedAddress', 'bassReferral', 'bassOffer']);
    const bassAddress = getBassAddressState(licence, bassOffer);


    return {
        approved: dmApproval.approved && !caRefusal.refused,
        refused: dmApproval.refused || caRefusal.refused,
        approval: dmApproval.approval,
        dmRefused: dmApproval.refused,
        refusalReason: dmApproval.refusalReason || caRefusal.refusalReason,
        bassOffer,
        bassAddress
    };
}

function getBassAddressState(licence, bassOffer) {

    if (!bassOffer) {
        return taskStates.UNSTARTED;
    }

    if (bassOffer && bassOffer !== 'Yes') {
        return taskStates.DONE;
    }

    const address = getIn(licence, ['proposedAddress', 'bassReferral', 'bassAddress']);

    if (!address) {
        return taskStates.STARTED;
    }

    const required = ['addressTown', 'addressLine1', 'postCode', 'telephone'];
    if (required.some(field => !address[field])) {
        return taskStates.STARTED;
    }

    return taskStates.DONE;
}

function getDmApproval(licence) {
    const refusalReasons = {
        addressUnsuitable: 'Address unsuitable',
        insufficientTime: 'Insufficient time'
    };

    const decision = getIn(licence, ['approval', 'release', 'decision']);
    const reason = getIn(licence, ['approval', 'release', 'reason']);

    return {
        approved: decision === 'Yes',
        refused: decision === 'No',
        refusalReason: refusalReasons[reason],
        approval: isEmpty(decision) ? taskStates.UNSTARTED : taskStates.DONE
    };
}

function getCaRefusal(licence) {
    const refusalReasons = {
        addressUnsuitable: 'No available address',
        insufficientTime: 'Out of time'
    };

    const finalChecksRefused = getIn(licence, ['finalChecks', 'refusal', 'decision']);
    const finalChecksRefusalReason = getIn(licence, ['finalChecks', 'refusal', 'reason']);

    return {
        refused: finalChecksRefused === 'Yes',
        refusalReason: refusalReasons[finalChecksRefusalReason]
    };
}

function getCurfewAddressState(licence, optedOut, bassReferralNeeded, curfewAddressApproved) {

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

        if (curfewAddressApproved === 'rejected') {
            return taskStates.STARTED;
        }

        const required = ['cautionedAgainstResident', 'addressLine1', 'addressTown', 'postCode', 'telephone'];
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


function isPostDecision(stage) {
    return ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(stage);
}

function getLicenceCreatedTaskState(licenceRecord) {
    const approvedVersion = getIn(licenceRecord, ['approvedVersion']);

    return approvedVersion && licenceRecord.version === approvedVersion ? 'DONE' : 'UNSTARTED';
}
