exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('licences').del()
        .then(function () {
            // Inserts seed entries
            return knex('licences').insert([{
                "id": 1,
                "licence": {"eligibility": {"excluded": {"reason": ["sexOffenderRegister"], "decision": "Yes"}}},
                "booking_id": 2200635,
                "stage": "ELIGIBILITY",
                "version": 1,
                "transition_date": null
            }, {
                "id": 2,
                "licence": {
                    "eligibility": {
                        "crdTime": {"decision": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"decision": "No"}
                    }, "proposedAddress": {"optOut": {"reason": "Like it here too much.", "decision": "Yes"}}
                },
                "booking_id": 1130463,
                "stage": "ELIGIBILITY",
                "version": 1,
                "transition_date": null
            }, {
                "id": 3,
                "licence": {
                    "risk": {
                        "riskManagement": {
                            "victimLiaison": "No",
                            "planningActions": "No",
                            "awaitingInformation": "No"
                        }
                    },
                    "curfew": {
                        "firstNight": {"firstNightFrom": "19:00", "firstNightUntil": "07:00"},
                        "curfewHours": {
                            "fridayFrom": "19:00",
                            "mondayFrom": "19:00",
                            "sundayFrom": "19:00",
                            "fridayUntil": "07:00",
                            "mondayUntil": "07:00",
                            "sundayUntil": "07:00",
                            "tuesdayFrom": "19:00",
                            "saturdayFrom": "19:00",
                            "thursdayFrom": "19:00",
                            "tuesdayUntil": "07:00",
                            "saturdayUntil": "07:00",
                            "thursdayUntil": "07:00",
                            "wednesdayFrom": "19:00",
                            "wednesdayUntil": "07:00"
                        }
                    },
                    "approval": {"release": {"decision": "Yes", "decisionMaker": "Dianne Matthews"}},
                    "reporting": {
                        "reportingDate": {"reportingDate": "10/10/2018", "reportingTime": "10:00"},
                        "reportingInstructions": {
                            "name": "Duty Officer",
                            "postcode": "YO1 7DY",
                            "telephone": "01493 2678766",
                            "townOrCity": "York",
                            "buildingAndStreet1": "1, Probation House",
                            "buildingAndStreet2": ""
                        }
                    },
                    "eligibility": {
                        "crdTime": {"decision": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"decision": "No"}
                    },
                    "finalChecks": {
                        "onRemand": {"decision": "No"},
                        "seriousOffence": {"decision": "No"},
                        "confiscationOrder": {"decision": "No"}
                    },
                    "proposedAddress": {
                        "optOut": {"decision": "No"},
                        "curfewAddress": {
                            "addresses": [{
                                "consent": "Yes",
                                "occupier": {"name": "Richard Hunt", "relationship": "Uncle"},
                                "postCode": "LS16 6AA",
                                "residents": [],
                                "telephone": "07958 809442",
                                "deemedSafe": "Yes",
                                "addressTown": "Leeds",
                                "electricity": "Yes",
                                "addressLine1": "31, The Road",
                                "addressLine2": "Horsforth",
                                "homeVisitConducted": "No",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {
                        "bespoke": [],
                        "standard": {"additionalConditionsRequired": "Yes"},
                        "additional": {
                            "NORESIDE": {"notResideWithAge": "18", "notResideWithGender": "any"},
                            "NOCONTACTPRISONER": {}
                        }
                    }
                },
                "booking_id": 1167792,
                "stage": "MODIFIED",
                "version": 1,
                "transition_date": "2018-10-02T12:33:15.09014+00:00"
            }, {
                "id": 5,
                "licence": {
                    "risk": {
                        "riskManagement": {
                            "victimLiaison": "No",
                            "planningActions": "No",
                            "awaitingInformation": "No"
                        }
                    },
                    "curfew": {
                        "curfewHours": {
                            "fridayFrom": "19:00",
                            "mondayFrom": "19:00",
                            "sundayFrom": "19:00",
                            "fridayUntil": "07:00",
                            "mondayUntil": "07:00",
                            "sundayUntil": "07:00",
                            "tuesdayFrom": "19:00",
                            "saturdayFrom": "19:00",
                            "thursdayFrom": "19:00",
                            "tuesdayUntil": "07:00",
                            "saturdayUntil": "07:00",
                            "thursdayUntil": "07:00",
                            "wednesdayFrom": "19:00",
                            "wednesdayUntil": "07:00"
                        }
                    },
                    "reporting": {
                        "reportingInstructions": {
                            "name": "Duty Officer",
                            "postcode": "LS6 6ER",
                            "telephone": "0113 2727272",
                            "townOrCity": "Leeds",
                            "buildingAndStreet1": "12 Ellis Street",
                            "buildingAndStreet2": ""
                        }
                    },
                    "eligibility": {
                        "crdTime": {"decision": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"decision": "No"}
                    },
                    "proposedAddress": {
                        "optOut": {"decision": "No"},
                        "curfewAddress": {
                            "addresses": [{
                                "consent": "Yes",
                                "occupier": {"name": "", "relationship": ""},
                                "postCode": "LS12 1YT",
                                "residents": [],
                                "telephone": "0113 2627272",
                                "deemedSafe": "Yes",
                                "addressTown": "Leeds",
                                "electricity": "Yes",
                                "addressLine1": "12 High Street",
                                "addressLine2": "Horsforth",
                                "homeVisitConducted": "No",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {"standard": {"additionalConditionsRequired": "No"}}
                },
                "booking_id": 1200666,
                "stage": "PROCESSING_CA",
                "version": 1,
                "transition_date": "2018-10-02T12:39:29.924871+00:00"
            }, {
                "id": 4,
                "licence": {
                    "eligibility": {
                        "crdTime": {"decision": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"decision": "No"}
                    },
                    "proposedAddress": {
                        "optOut": {"decision": "No"},
                        "curfewAddress": {
                            "addresses": [{
                                "consent": "Yes",
                                "occupier": {"name": "Mr J Thomas", "relationship": "N/A"},
                                "postCode": "LS1 1LD",
                                "residents": [],
                                "telephone": "07986 2765411",
                                "deemedSafe": "No",
                                "addressTown": "Leeds",
                                "electricity": "Yes",
                                "addressLine1": "18, Albion Street",
                                "addressLine2": "",
                                "unsafeReason": "Risk too high.",
                                "homeVisitConducted": "No",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1080794,
                "stage": "ELIGIBILITY",
                "version": 1,
                "transition_date": "2018-10-02T12:37:07.183618+00:00"
            }, {
                "id": 6,
                "licence": {
                    "eligibility": {
                        "crdTime": {"decision": "Yes", "dmApproval": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"reason": ["deportationLiable"], "decision": "Yes"},
                        "exceptionalCircumstances": {"decision": "Yes"}
                    }
                },
                "booking_id": 1068733,
                "stage": "ELIGIBILITY",
                "version": 1,
                "transition_date": null
            }, {
                "id": 7,
                "licence": {
                    "risk": {
                        "riskManagement": {
                            "victimLiaison": "No",
                            "planningActions": "No",
                            "awaitingInformation": "No"
                        }
                    },
                    "curfew": {
                        "curfewHours": {
                            "fridayFrom": "19:00",
                            "mondayFrom": "19:00",
                            "sundayFrom": "19:00",
                            "fridayUntil": "07:00",
                            "mondayUntil": "07:00",
                            "sundayUntil": "07:00",
                            "tuesdayFrom": "19:00",
                            "saturdayFrom": "19:00",
                            "thursdayFrom": "19:00",
                            "tuesdayUntil": "07:00",
                            "saturdayUntil": "07:00",
                            "thursdayUntil": "07:00",
                            "wednesdayFrom": "19:00",
                            "wednesdayUntil": "07:00"
                        }
                    },
                    "reporting": {
                        "reportingInstructions": {
                            "name": "Duty Officer",
                            "postcode": "LS1 87Y",
                            "telephone": "07976 526262",
                            "townOrCity": "Leeds",
                            "buildingAndStreet1": "19 Wandsworth Road",
                            "buildingAndStreet2": ""
                        }
                    },
                    "eligibility": {
                        "crdTime": {"decision": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"reason": ["deportationLiable"], "decision": "Yes"},
                        "exceptionalCircumstances": {"decision": "Yes"}
                    },
                    "finalChecks": {
                        "onRemand": {"decision": "Yes"},
                        "postpone": {"decision": "Yes"},
                        "seriousOffence": {"decision": "No"},
                        "confiscationOrder": {"decision": "No"}
                    },
                    "proposedAddress": {
                        "optOut": {"decision": "No"},
                        "curfewAddress": {
                            "addresses": [{
                                "consent": "Yes",
                                "occupier": {"name": "", "relationship": ""},
                                "postCode": "HL1 7TY",
                                "residents": [{"age": "", "name": "Mrs J Smith", "relationship": "Aunty"}],
                                "telephone": "07865 2345786",
                                "deemedSafe": "Yes",
                                "addressTown": "Hull",
                                "electricity": "Yes",
                                "addressLine1": "25 Hilton Place",
                                "addressLine2": "",
                                "homeVisitConducted": "No",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {"standard": {"additionalConditionsRequired": "No"}}
                },
                "booking_id": 1152613,
                "stage": "PROCESSING_CA",
                "version": 1,
                "transition_date": "2018-10-02T13:04:27.302446+00:00"
            }, {
                "id": 8,
                "licence": {
                    "risk": {
                        "riskManagement": {
                            "victimLiaison": "No",
                            "planningActions": "Yes",
                            "awaitingInformation": "Yes",
                            "planningActionsDetails": "Social services to investigate the neighbourhood",
                            "awaitingInformationDetails": ""
                        }
                    },
                    "curfew": {
                        "curfewHours": {
                            "fridayFrom": "19:00",
                            "mondayFrom": "19:00",
                            "sundayFrom": "19:00",
                            "fridayUntil": "07:00",
                            "mondayUntil": "07:00",
                            "sundayUntil": "07:00",
                            "tuesdayFrom": "19:00",
                            "saturdayFrom": "19:00",
                            "thursdayFrom": "19:00",
                            "tuesdayUntil": "07:00",
                            "saturdayUntil": "07:00",
                            "thursdayUntil": "07:00",
                            "wednesdayFrom": "19:00",
                            "wednesdayUntil": "07:00"
                        }
                    },
                    "reporting": {
                        "reportingInstructions": {
                            "name": "Duty Officer",
                            "postcode": "S1 18UT",
                            "telephone": "07685 2929292",
                            "townOrCity": "Sheffield",
                            "buildingAndStreet1": "19 Town Street",
                            "buildingAndStreet2": ""
                        }
                    },
                    "eligibility": {
                        "crdTime": {"decision": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"reason": ["sentenceCategory"], "decision": "Yes"},
                        "exceptionalCircumstances": {"decision": "Yes"}
                    },
                    "finalChecks": {
                        "refusal": {
                            "reason": "insufficientTime",
                            "decision": "Yes",
                            "outOfTimeReasons": "riskManagement"
                        }
                    },
                    "proposedAddress": {
                        "optOut": {"decision": "No"},
                        "curfewAddress": {
                            "addresses": [{
                                "consent": "Yes",
                                "occupier": {"name": "", "relationship": ""},
                                "postCode": "S1 9OP",
                                "residents": [],
                                "telephone": "07648272611",
                                "deemedSafe": "Yes",
                                "addressTown": "Sheffield",
                                "electricity": "Yes",
                                "addressLine1": "1 Kelham Island Street",
                                "addressLine2": "",
                                "homeVisitConducted": "Yes",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {"standard": {"additionalConditionsRequired": "No"}}
                },
                "booking_id": 1200665,
                "stage": "PROCESSING_CA",
                "version": 1,
                "transition_date": "2018-10-02T13:10:08.379656+00:00"
            }, {
                "id": 9,
                "licence": {
                    "risk": {
                        "riskManagement": {
                            "victimLiaison": "No",
                            "planningActions": "No",
                            "awaitingInformation": "No"
                        }
                    },
                    "curfew": {
                        "curfewHours": {
                            "fridayFrom": "19:00",
                            "mondayFrom": "19:00",
                            "sundayFrom": "19:00",
                            "fridayUntil": "07:00",
                            "mondayUntil": "07:00",
                            "sundayUntil": "07:00",
                            "tuesdayFrom": "19:00",
                            "saturdayFrom": "19:00",
                            "thursdayFrom": "19:00",
                            "tuesdayUntil": "07:00",
                            "saturdayUntil": "07:00",
                            "thursdayUntil": "07:00",
                            "wednesdayFrom": "19:00",
                            "wednesdayUntil": "07:00"
                        }
                    },
                    "approval": {
                        "release": {
                            "reason": "insufficientTime",
                            "decision": "No",
                            "decisionMaker": "Dianne Matthews"
                        }
                    },
                    "reporting": {
                        "reportingInstructions": {
                            "name": "Duty Officer",
                            "postcode": "BD8 5TY",
                            "telephone": "01274 2627272",
                            "townOrCity": "Bradford",
                            "buildingAndStreet1": "Probation House",
                            "buildingAndStreet2": ""
                        }
                    },
                    "eligibility": {
                        "crdTime": {"decision": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"decision": "No"}
                    },
                    "finalChecks": {
                        "onRemand": {"decision": "No"},
                        "seriousOffence": {"decision": "No"},
                        "confiscationOrder": {"decision": "No"}
                    },
                    "proposedAddress": {
                        "optOut": {"decision": "No"},
                        "curfewAddress": {
                            "addresses": [{
                                "consent": "Yes",
                                "occupier": {"name": "", "relationship": ""},
                                "postCode": "BD11 8UY",
                                "residents": [],
                                "telephone": "01274 7654782",
                                "deemedSafe": "Yes",
                                "addressTown": "Bradford",
                                "electricity": "Yes",
                                "addressLine1": "4 Smithfield Terrace",
                                "addressLine2": "",
                                "homeVisitConducted": "No",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {"standard": {"additionalConditionsRequired": "No"}}
                },
                "booking_id": 1068236,
                "stage": "DECIDED",
                "version": 1,
                "transition_date": "2018-10-02T13:57:15.156181+00:00"
            }, {
                "id": 10,
                "licence": {
                    "risk": {
                        "riskManagement": {
                            "victimLiaison": "No",
                            "planningActions": "No",
                            "awaitingInformation": "No"
                        }
                    },
                    "curfew": {
                        "curfewHours": {
                            "fridayFrom": "19:00",
                            "mondayFrom": "19:00",
                            "sundayFrom": "19:00",
                            "fridayUntil": "07:00",
                            "mondayUntil": "07:00",
                            "sundayUntil": "07:00",
                            "tuesdayFrom": "19:00",
                            "saturdayFrom": "19:00",
                            "thursdayFrom": "19:00",
                            "tuesdayUntil": "07:00",
                            "saturdayUntil": "07:00",
                            "thursdayUntil": "07:00",
                            "wednesdayFrom": "19:00",
                            "wednesdayUntil": "07:00"
                        }
                    },
                    "approval": {"release": {"decision": "Yes", "decisionMaker": "Dianne Matthews"}},
                    "reporting": {
                        "reportingInstructions": {
                            "name": "J Smith",
                            "postcode": "LE14 5PO",
                            "telephone": "07869 7286413",
                            "townOrCity": "Leicester",
                            "buildingAndStreet1": "19 High Street",
                            "buildingAndStreet2": ""
                        }
                    },
                    "eligibility": {
                        "crdTime": {"decision": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"decision": "No"}
                    },
                    "finalChecks": {
                        "onRemand": {"decision": "No"},
                        "seriousOffence": {"decision": "No"},
                        "confiscationOrder": {"decision": "No"}
                    },
                    "proposedAddress": {
                        "optOut": {"decision": "No"},
                        "curfewAddress": {
                            "addresses": [{
                                "consent": "Yes",
                                "occupier": {"name": "", "relationship": ""},
                                "postCode": "LE16 9UH",
                                "residents": [],
                                "telephone": "07968 7865426",
                                "deemedSafe": "Yes",
                                "addressTown": "Leicester",
                                "electricity": "Yes",
                                "addressLine1": "18 Queen Square",
                                "addressLine2": "",
                                "homeVisitConducted": "Yes",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {"standard": {"additionalConditionsRequired": "No"}}
                },
                "booking_id": 1200659,
                "stage": "DECIDED",
                "version": 1,
                "transition_date": "2018-10-02T14:00:49.625837+00:00"
            }, {
                "id": 11,
                "licence": {
                    "risk": {
                        "riskManagement": {
                            "victimLiaison": "No",
                            "planningActions": "No",
                            "awaitingInformation": "No"
                        }
                    },
                    "curfew": {
                        "curfewHours": {
                            "fridayFrom": "19:00",
                            "mondayFrom": "19:00",
                            "sundayFrom": "19:00",
                            "fridayUntil": "07:00",
                            "mondayUntil": "07:00",
                            "sundayUntil": "07:00",
                            "tuesdayFrom": "19:00",
                            "saturdayFrom": "19:00",
                            "thursdayFrom": "19:00",
                            "tuesdayUntil": "07:00",
                            "saturdayUntil": "07:00",
                            "thursdayUntil": "07:00",
                            "wednesdayFrom": "19:00",
                            "wednesdayUntil": "07:00"
                        }
                    },
                    "reporting": {
                        "reportingInstructions": {
                            "name": "Duty Officer",
                            "postcode": "ST7 6YU",
                            "telephone": "0795872827123",
                            "townOrCity": "Stoke-on-Trent",
                            "buildingAndStreet1": "18 High Lane",
                            "buildingAndStreet2": ""
                        }
                    },
                    "eligibility": {
                        "crdTime": {"decision": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"decision": "No"}
                    },
                    "finalChecks": {
                        "onRemand": {"decision": "No"},
                        "seriousOffence": {"decision": "No"},
                        "confiscationOrder": {
                            "comments": "Still waiting",
                            "decision": "Yes",
                            "confiscationUnitConsulted": "No"
                        }
                    },
                    "proposedAddress": {
                        "optOut": {"decision": "No"},
                        "curfewAddress": {
                            "addresses": [{
                                "consent": "Yes",
                                "occupier": {"name": "", "relationship": ""},
                                "postCode": "ST5 8UY",
                                "residents": [],
                                "telephone": "078652987651",
                                "deemedSafe": "Yes",
                                "addressTown": "Stoke-on-Trent",
                                "electricity": "Yes",
                                "addressLine1": "18 Swift Crescent",
                                "addressLine2": "",
                                "homeVisitConducted": "No",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {"standard": {"additionalConditionsRequired": "No"}}
                },
                "booking_id": 1200637,
                "stage": "APPROVAL",
                "version": 1,
                "transition_date": "2018-10-02T14:08:08.081346+00:00"
            }, {
                "id": 14,
                "licence": {
                    "eligibility": {
                        "crdTime": {"decision": "Yes", "dmApproval": "Yes"},
                        "excluded": {"decision": "No"},
                        "suitability": {"decision": "No"}
                    },
                    "proposedAddress": {
                        "optOut": {"decision": "No"},
                        "curfewAddress": {
                            "addresses": [{
                                "occupier": {"name": "", "relationship": ""},
                                "postCode": "SK10 9TY",
                                "residents": [],
                                "telephone": "07896786572",
                                "addressTown": "Macclesfield",
                                "addressLine1": "15 New Street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1062084,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": "2018-10-02T14:42:18.887093+00:00"
            }, {
                "id": 12,
                "licence": {
                    "eligibility": {
                        "crdTime": {"decision": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"decision": "No"}
                    },
                    "proposedAddress": {
                        "optOut": {"decision": "No"},
                        "curfewAddress": {
                            "addresses": [{
                                "occupier": {"name": "", "relationship": ""},
                                "postCode": "",
                                "residents": [],
                                "telephone": "",
                                "addressTown": "",
                                "addressLine1": "18 New Road",
                                "addressLine2": ""
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1200616,
                "stage": "ELIGIBILITY",
                "version": 1,
                "transition_date": null
            }, {
                "id": 13,
                "licence": {
                    "eligibility": {
                        "excluded": {"decision": "No"},
                        "suitability": {"reason": ["sentenceCategory"], "decision": "Yes"},
                        "exceptionalCircumstances": {"decision": "No"}
                    }
                },
                "booking_id": 1200664,
                "stage": "ELIGIBILITY",
                "version": 1,
                "transition_date": null
            }]);
        });
};
