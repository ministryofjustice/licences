const validationMessages = {
    // ELIGIBILITY forms
    excluded_decision: 'Select yes or no',
    excluded_reason: 'Select one or more reasons',
    suitability_decision: 'Select yes or no',
    suitability_reason: 'Select one or more reasons',
    crdTime_decision: 'Select yes or no',
    crdTime_dmApproval: 'Select yes or no',
    optOut_decision: 'Select yes or no',
    optOut_reason: 'Explain why they opted out',
    addressProposed_decision: 'Select yes or no',
    curfewAddress_addressLine1: 'Enter an address',
    curfewAddress_addressTown: 'Enter an town or city',
    curfewAddress_postCode: 'Enter a postcode',
    curfewAddress_occupier_name: 'Enter a name',
    curfewAddress_occupier_relationship: 'Enter a relationship',
    curfewAddress_cautionedAgainstResident: 'Select yes or no',
    curfewAddress_residents_name: 'Enter a name',
    curfewAddress_residents_relationship: 'Enter a relationship',
    exceptionalCircumstances_decision: 'Select yes or no',

    // BASS forms
    bassRequest_bassRequested: 'Select yes or no',
    bassRequest_proposedCounty: 'Enter a county',
    bassRequest_proposedTown: 'Enter a town',
    bassAreaCheck_bassAreaSuitable: 'Select yes or no',
    bassAreaCheck_bassAreaReason: 'Enter a reason',
    bassOffer_bassArea: 'Enter the provided area',
    bassOffer_addressLine1: 'Enter a building or street',
    bassOffer_addressTown: 'Enter a town or city',
    bassOffer_postCode: 'Enter a postcode in the right format',
    bassOffer_telephone: 'Enter a telephone number in the right format',

    // PROCESSING_RO forms
    curfewAddress_consent: 'Say if the homeowner consents to HDC',
    curfewAddress_electricity: 'Say if there is an electricity supply',
    curfewAddress_homeVisitConducted: 'Say if you did a home visit',
    curfewAddress_deemedSafe: 'Say if you approve the address',
    curfewAddress_unsafeReason: 'Explain why you did not approve the address',
    riskManagement_planningActions: 'Say if there are risk management actions',
    riskManagement_planningActionsDetails: 'Provide details of the risk management actions',
    riskManagement_awaitingInformation: 'Say if you are still awaiting information',
    riskManagement_awaitingInformationDetails: 'Provide details of information that you are waiting for',
    riskManagement_victimLiaison: 'Say if it is a victim liaison case',
    riskManagement_victimLiaisonDetails: 'Provide details of the victim liaison case',
    reportingInstructions_name: 'Enter a name',
    reportingInstructions_buildingAndStreet1: 'Enter a building or street',
    reportingInstructions_townOrCity: 'Enter a town or city',
    reportingInstructions_postcode: 'Enter a postcode in the right format',
    reportingInstructions_telephone: 'Enter a telephone number in the right format',

    additional_NOCONTACTASSOCIATE_groupsOrOrganisation: 'Enter a name or describe specific groups or organisations',
    additional_INTIMATERELATIONSHIP_intimateGender: 'Select women / men / women or men',
    additional_NOCONTACTNAMED_noContactOffenders: 'Enter named offender(s) or individual(s)',
    additional_NORESIDE_notResideWithGender: 'Select any / any female / any male',
    additional_NORESIDE_notResideWithAge: 'Enter age',
    additional_NOUNSUPERVISEDCONTACT_unsupervisedContactGender: 'Select any / any female / any male',
    additional_NOUNSUPERVISEDCONTACT_unsupervisedContactAge: 'Enter age',
    additional_NOUNSUPERVISEDCONTACT_unsupervisedContactSocial: 'Enter name of appropriate social service department',
    additional_NOCHILDRENSAREA_notInSightOf: 'Enter location, for example children\'s play area',
    additional_NOWORKWITHAGE_noWorkWithAge: 'Enter age',
    additional_NOCOMMUNICATEVICTIM_victimFamilyMembers: 'Enter name of victim and /or family members',
    additional_NOCOMMUNICATEVICTIM_socialServicesDept: 'Enter name of appropriate social service department',
    additional_COMPLYREQUIREMENTS_courseOrCentre: 'Enter name of course / centre',
    additional_ATTENDALL_appointmentName: 'Enter name',
    additional_ATTENDALL_appointmentProfession: 'Select psychiatrist / psychologist / medical practitioner',
    additional_HOMEVISITS_mentalHealthName: 'Enter name',
    additional_REMAINADDRESS_curfewAddress: 'Enter curfew address',
    additional_REMAINADDRESS_curfewFrom: 'Enter start of curfew hours',
    additional_REMAINADDRESS_curfewTo: 'Enter end of curfew hours',
    additional_CONFINEADDRESS_confinedTo: 'Enter time',
    additional_CONFINEADDRESS_confinedFrom: 'Enter time',
    additional_CONFINEADDRESS_confinedReviewFrequency: 'Enter frequency, for example weekly',
    additional_REPORTTO_reportingAddress: 'Enter name of approved premises / police station',
    additional_REPORTTO_reportingTime: 'Enter time / daily',
    additional_REPORTTO_reportingDaily: 'Enter time / daily',
    additional_REPORTTO_reportingFrequency: 'Enter frequency, for example weekly',
    additional_VEHICLEDETAILS_vehicleDetails: 'Enter details, for example make, model',
    additional_EXCLUSIONADDRESS_noEnterPlace: 'Enter name / type of premises / address / road',
    additional_EXCLUSIONAREA_exclusionArea: 'Enter clearly specified area',
    additional_ATTENDDEPENDENCY_appointmentDate: 'Enter appointment date',
    additional_ATTENDDEPENDENCY_appointmentTime: 'Enter appointment time',
    additional_ATTENDDEPENDENCY_appointmentAddress: 'Enter appointment name and address',
    additional_ATTENDSAMPLE_attendSampleDetailsName: 'Enter appointment name',
    additional_ATTENDSAMPLE_attendSampleDetailsAddress: 'Enter appointment address',

    // PROCESSING_CA forms
    seriousOffence_decision: 'Select yes or no',
    onRemand_decision: 'Select yes or no',
    confiscationOrder_decision: 'Select yes or no',
    confiscationOrder_confiscationUnitConsulted: 'Select yes or no',
    confiscationOrder_comments: 'Provide details',

    // APPROVAL forms
    release_decision: 'Select yes or no',
    release_notedComments: 'Add a comment',
    release_reason: 'Select a reason',

    // LICENCE CREATION forms
    reportingDate_reportingDate: 'Enter a valid date',
    reportingDate_reportingTime: 'Enter a valid time',
    firstNight_firstNightFrom: 'Enter a valid from time',
    firstNight_firstNightUntil: 'Enter a valid until time'
};

module.exports = (errorType, errorMessage, errorPath) => {
    if (errorType === 'date.format') {
        if (errorMessage.includes('[HH:mm]')) {
            return 'Enter a valid time';
        }
        return 'Enter a valid date';
    }

    if (errorType === 'number.base') {
        return 'Enter a valid number';
    }

    if (errorType === 'string.regex.base') {
        if (errorMessage.includes('telephone')) {
            return 'Enter a valid phone number';
        }
        return 'Enter a valid postcode';
    }

    if (errorType === 'number.min') {
        return 'Enter a valid age';
    }

    if (errorType === 'number.max') {
        return 'Enter a valid age';
    }

    if (errorType === 'date.min') {
        return 'Enter a date that is not in the past';
    }

    const path = errorPath
        .filter(pathItem => !Number.isInteger(pathItem))
        .join('_');

    // Shouldn't this be first? Custom messages for postcode or telephone don't get used
    if (validationMessages[path]) {
        return validationMessages[path];
    }

    return 'Not answered';
};
