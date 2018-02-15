const {taskStates} = require('../models/taskStates');
const {licenceStages} = require('../models/licenceStages');

const {matcher, isPresent, isNotPresent, equalTo} = require('./jsonUtils');

module.exports = {getLicenceStatus};

function getLicenceStatus(licenceRecord) {

    const stage = licenceRecord ? licenceRecord.status : licenceStages.UNSTARTED;

    if (!licenceRecord || !licenceRecord.licence) {
        return {
            stage,
            decisions: {},
            tasks: {}
        };
    }

    const data = matcher(licenceRecord.licence);

    const {excluded, exclusion} = getExclusionTaskState(data);
    const {insufficientTime, crdTime} = getCrdTimeState(data);
    const {unsuitable, suitability} = getSuitabilityState(data);
    const eligibility = getOverallState([exclusion, crdTime, suitability]);

    const {optedOut, optOut} = getOptOutState(data);
    const {bassReferralNeeded, bassReferral} = getBassReferralState(data);

    const {riskManagementNeeded, victimLiasionNeeded, riskManagement} = getRiskManagementState(data);

    const {curfewAddress} = getCurfewAddressState(data);
    const {curfewAddressReview, curfewAddressApproved} = getCurfewAddressReviewState(data);
    const {curfewHours} = getCurfewHoursState(data);

    const {reportingInstructions} = getReportingInstructionsState(data);

    const {licenceConditions, standardOnly, additional, bespoke} = getLicenceConditionsState(data);

    const {approved, refused, postponed, approval} = getApprovalState(data);

    const eligible = noneOf([excluded, insufficientTime, unsuitable]);

    const licenceStatus = {
        stage,
        decisions: {
            excluded,
            insufficientTime,
            unsuitable,
            optedOut,
            bassReferralNeeded,
            eligible,
            curfewAddressApproved,
            standardOnly,
            additional,
            bespoke,
            riskManagementNeeded,
            victimLiasionNeeded,
            approved,
            refused,
            postponed
        },
        tasks: {
            exclusion,
            crdTime,
            suitability,
            optOut,
            bassReferral,
            eligibility,
            curfewAddress,
            curfewAddressReview,
            curfewHours,
            licenceConditions,
            riskManagement,
            reportingInstructions,
            approval
        }
    };

    console.log(licenceStatus);
    return licenceStatus;
}

function getExclusionTaskState(data) {

    return {
        excluded: data.path('eligibility.excluded.decision', equalTo('Yes')),
        exclusion: data.path('eligibility.excluded.decision', isPresent) ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getCrdTimeState(data) {

    return {
        insufficientTime: data.path('eligibility.crdTime.decision', equalTo('Yes')),
        crdTime: data.path('eligibility.crdTime.decision', isPresent) ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getSuitabilityState(data) {

    return {
        unsuitable: data.path('eligibility.suitability.decision', equalTo('Yes')),
        suitability: data.path('eligibility.suitability.decision', isPresent) ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getOptOutState(data) {

    return {
        optedOut: data.path('proposedAddress.optOut.decision', equalTo('Yes')),
        optOut: data.path('proposedAddress.optOut.decision', isPresent) ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getBassReferralState(data) {

    return {
        bassReferralNeeded: data.path('proposedAddress.bassReferral.decision', equalTo('Yes')),
        bassReferral:
            data.path('proposedAddress.bassReferral.decision', isPresent) ? taskStates.DONE : taskStates.UNSTARTED
    };

}

function getRiskManagementState(data) {

    return {
        riskManagementNeeded: data.path('risk.riskManagement.planningActions', equalTo('Yes')),
        victimLiasionNeeded: data.path('risk.riskManagement.victimLiaison', equalTo('Yes')),
        riskManagement: getState(data)
    };

    function getState(data) {

        if (data.path('risk.riskManagement', isNotPresent)) {
            return taskStates.UNSTARTED;
        }

        if (data.path('risk.riskManagement.planningActions', isNotPresent)) {
            return taskStates.STARTED;
        }

        if (data.path('risk.riskManagement.victimLiaison', isPresent)) {
            return taskStates.DONE;
        }

        return taskStates.STARTED;
    }
}

function getApprovalState(data) {

    return {
        approved: data.path('approval', equalTo('Yes')),
        refused: data.path('approval', equalTo('No')),
        postponed: data.path('postponed', equalTo('Yes')),
        approval: data.path('approval', isPresent) ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getCurfewAddressState(data) {
    return {
        curfewAddress: getState(data)
    };

    function getState(data) {
        return data.path('proposedAddress.curfewAddress', isPresent) ? taskStates.STARTED : taskStates.UNSTARTED;
        // todo DONE when all elements have values
    }
}


function getCurfewAddressReviewState(data) {

    const curfewAddressReview = getState(data);
    const curfewAddressApproved = getApproved(data);

    return {curfewAddressReview, curfewAddressApproved};

    function getState(data) {

        if (data.path('curfew.curfewAddressReview', isNotPresent)) {
            return taskStates.UNSTARTED;
        }

        if (data.path('curfew.curfewAddressReview.consent', isNotPresent)) {
            return taskStates.STARTED;
        }

        if (data.path('curfew.curfewAddressReview.deemedSafe', isNotPresent)) {
            return taskStates.STARTED;
        }

        if (data.path('curfew.curfewAddressReview.consent', equalTo('Yes'))) {
            if (data.path('curfew.curfewAddressReview.electricity', isNotPresent)) {
                return taskStates.STARTED;
            }
            if (data.path('curfew.curfewAddressReview.homeVisitConducted', isNotPresent)) {
                return taskStates.STARTED;
            }
        }

        return taskStates.DONE;
    }

    function getApproved(data) {
        return curfewAddressReview === taskStates.DONE &&
            data.path('curfew.curfewAddressReview.consent', equalTo('Yes')) &&
            data.path('curfew.curfewAddressReview.deemedSafe', equalTo('Yes'));
    }
}

function getCurfewHoursState(data) {
    return {
        curfewHours: data.path('curfew.curfewHours', isPresent) ? taskStates.DONE : taskStates.UNSTARTED
    };
}

function getReportingInstructionsState(data) {

    return {
        reportingInstructions:
            data.path('reporting.reportingInstructions', isPresent) ? taskStates.DONE : taskStates.UNSTARTED
        // todo check for missing mandatory elements
    };
}

function getLicenceConditionsState(data) {
    if (data.path('licenceConditions', isNotPresent)) {
        return {
            standardOnly: false,
            additional: 0,
            bespoke: 0,
            totalCount: 0,
            licenceConditions: taskStates.UNSTARTED
        };
    }

    const standardOnly =
        data.path('licenceConditions.standard.additionalConditionsRequired', equalTo('No'));

    const additionals = data.value('licenceConditions.additional');
    const bespokes = data.value('licenceConditions.bespoke');

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
