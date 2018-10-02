exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('licences').del()
        .then(function () {
            // Inserts seed entries
            return knex('licences').insert([{
                "id": 61,
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
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1200664,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 37,
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
                            "firstNightFrom": "19:00",
                            "wednesdayUntil": "07:00",
                            "firstNightUntil": "07:00"
                        }
                    },
                    "approval": {"release": {"decision": "Yes", "decisionMaker": "DECISION MAKER"}},
                    "reporting": {
                        "reportingDate": {"reportingDate": "25/09/2018", "reportingTime": "09:00"},
                        "reportingInstructions": {
                            "name": "Duty Officer",
                            "postcode": "LS166AA",
                            "telephone": "01234567890",
                            "townOrCity": "Leeds",
                            "buildingAndStreet1": "31 The Crescent",
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
                                "occupier": {"name": "Mr Landlord", "relationship": "ererqe"},
                                "postCode": "LS16 6BA",
                                "residents": [],
                                "telephone": "07957809355",
                                "deemedSafe": "Yes",
                                "addressTown": "Leeds",
                                "electricity": "Yes",
                                "addressLine1": "42 The Crescent",
                                "addressLine2": "Adel",
                                "homeVisitConducted": "No",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {"standard": {"additionalConditionsRequired": "No"}}
                },
                "booking_id": 1160362,
                "stage": "DECIDED",
                "version": 1,
                "transition_date": null
            }, {
                "id": 45,
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
                                "occupier": {"name": "Liz McDonald", "relationship": "Mother"},
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1200616,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 41,
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
                                "occupier": {
                                    "name": "Ansgar Kupper",
                                    "relationship": "l;khjo;ij"
                                },
                                "postCode": "Tn10 3DT",
                                "residents": [],
                                "telephone": "07766554433",
                                "addressTown": "Tonbridge",
                                "addressLine1": "p;oujopik",
                                "addressLine2": "Manor Grove",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1200649,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 54,
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
                                "occupier": {"name": "Liz McDonald", "relationship": "Mother"},
                                "postCode": "M12 3AB",
                                "residents": [{"age": "14", "name": "Amy Barlow", "relationship": "Daughter"}],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1200657,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 62,
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
                                "occupier": {"name": "Liz McDonald", "relationship": "Mother"},
                                "postCode": "M12 3AB",
                                "residents": [{"age": "14", "name": "Amy Barlow", "relationship": "Daughter"}],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "Yes"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1200669,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 55,
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
                                "occupier": {"name": "Liz McDonald", "relationship": "Mother"},
                                "postCode": "M12 3AB",
                                "residents": [{"age": "14", "name": "Amy Barlow", "relationship": "Daughter"}],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1129006,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 46,
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
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1088811,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 56,
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
                                "occupier": {"name": "Liz McDonald", "relationship": "Mother"},
                                "postCode": "M12 3AB",
                                "residents": [{"age": "14", "name": "Amy Barlow", "relationship": "Daughter"}],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1200667,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 47,
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
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
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
                "transition_date": null
            }, {
                "id": 1,
                "licence": {},
                "booking_id": 1200635,
                "stage": "ELIGIBILITY",
                "version": 1,
                "transition_date": null
            }, {
                "id": 38,
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
                            "firstNightFrom": "19:00",
                            "wednesdayUntil": "07:00",
                            "firstNightUntil": "07:00"
                        }, "addressWithdrawn": {"decision": "Yes"}
                    },
                    "approval": {"release": {"decision": "Yes", "decisionMaker": "DECISION MAKER"}},
                    "reporting": {
                        "reportingInstructions": {
                            "name": "louise",
                            "postcode": "pr1 0aa",
                            "telephone": "01772 666666",
                            "townOrCity": "preston",
                            "buildingAndStreet1": "1 street",
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
                                "occupier": {"name": "Liz McDonald", "relationship": "Mother"},
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "deemedSafe": "Yes",
                                "addressTown": "Wetherfield",
                                "electricity": "Yes",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "addressWithdrawn": "Yes",
                                "homeVisitConducted": "Yes",
                                "cautionedAgainstResident": "No"
                            }, {
                                "consent": "Yes",
                                "occupier": {"name": "Tom", "relationship": "sgsdfd"},
                                "postCode": "LS1 1LD",
                                "residents": [],
                                "telephone": "+441131234567",
                                "deemedSafe": "Yes",
                                "addressTown": "Leeds",
                                "electricity": "Yes",
                                "addressLine1": "31 The Road",
                                "addressLine2": "Adel",
                                "addressWithdrawn": "No",
                                "consentWithdrawn": "No",
                                "homeVisitConducted": "Yes",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {
                        "bespoke": [],
                        "standard": {"additionalConditionsRequired": "Yes"},
                        "additional": {"NOCONTACTPRISONER": {}}
                    }
                },
                "booking_id": 1200642,
                "stage": "DECIDED",
                "version": 1,
                "transition_date": null
            }, {
                "id": 49,
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
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1110602,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 57,
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
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1200668,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 20,
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
                            "firstNightFrom": "19:00",
                            "wednesdayUntil": "07:00",
                            "firstNightUntil": "07:00"
                        }
                    },
                    "approval": {
                        "release": {
                            "reason": "insufficientTime",
                            "decision": "No",
                            "decisionMaker": "DECISION MAKER"
                        }
                    },
                    "reporting": {
                        "reportingInstructions": {
                            "name": "Tom",
                            "postcode": "LS16 6AA",
                            "telephone": "0132613899",
                            "townOrCity": "Leeds",
                            "buildingAndStreet1": "31 The Crescent",
                            "buildingAndStreet2": "Adel"
                        }
                    },
                    "eligibility": {
                        "crdTime": {"decision": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"decision": "No"}
                    },
                    "finalChecks": {
                        "refusal": {
                            "reason": "insufficientTime",
                            "decision": "No",
                            "outOfTimeReasons": "onRemand"
                        },
                        "onRemand": {"decision": "No"},
                        "seriousOffence": {"decision": "No"},
                        "confiscationOrder": {"decision": "No"}
                    },
                    "proposedAddress": {
                        "optOut": {"decision": "No"},
                        "curfewAddress": {
                            "addresses": [{
                                "consent": "Yes",
                                "occupier": {"name": "a a", "relationship": "fff"},
                                "postCode": "LS166AA",
                                "residents": [],
                                "telephone": "01234567890",
                                "deemedSafe": "Yes",
                                "addressTown": "Leeds",
                                "electricity": "Yes",
                                "addressLine1": "31 The Crescent",
                                "addressLine2": "",
                                "homeVisitConducted": "No",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {"standard": {"additionalConditionsRequired": "No"}}
                },
                "booking_id": 1165795,
                "stage": "DECIDED",
                "version": 1,
                "transition_date": null
            }, {
                "id": 34,
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
                            "mondayFrom": "21:22",
                            "sundayFrom": "18:19",
                            "fridayUntil": "07:00",
                            "mondayUntil": "08:09",
                            "sundayUntil": "06:07",
                            "tuesdayFrom": "19:00",
                            "saturdayFrom": "19:00",
                            "thursdayFrom": "19:00",
                            "tuesdayUntil": "07:00",
                            "saturdayUntil": "07:00",
                            "thursdayUntil": "07:00",
                            "wednesdayFrom": "19:00",
                            "firstNightFrom": "18:30",
                            "wednesdayUntil": "07:00",
                            "firstNightUntil": "10:11"
                        }
                    },
                    "reporting": {
                        "reportingInstructions": {
                            "name": "Reporting Name",
                            "postcode": "AB1 1AB",
                            "telephone": "0123456789",
                            "townOrCity": "Town",
                            "buildingAndStreet1": "Street",
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
                        "bassReferral": {"decision": "No"},
                        "curfewAddress": {
                            "addresses": [{
                                "consent": "Yes",
                                "occupier": {"age": "21", "name": "Main Occupier", "relationship": "Brother"},
                                "postCode": "AB1 1AB",
                                "residents": [{
                                    "age": "10",
                                    "name": "Other Resident",
                                    "relationship": "Son"
                                }, {"age": "20", "name": "Yet Another", "relationship": "Wife"}],
                                "telephone": "0123456789",
                                "deemedSafe": "Yes",
                                "addressTown": "Town",
                                "electricity": "Yes",
                                "addressLine1": "Street",
                                "addressLine2": "",
                                "homeVisitConducted": "Yes",
                                "cautionedAgainstResident": "No"
                            }]
                        }
                    },
                    "licenceConditions": {
                        "bespoke": [{"text": "First bespoke condition", "approved": "Yes"}],
                        "standard": {"additionalConditionsRequired": "Yes"},
                        "additional": {"NOCAMERAPHONE": {}}
                    }
                },
                "booking_id": 1200635,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 43,
                "licence": {
                    "approval": {"release": {"decision": "No"}},
                    "eligibility": {
                        "crdTime": {"decision": "Yes", "dmApproval": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"decision": "No"}
                    }
                },
                "booking_id": 1173571,
                "stage": "DECIDED",
                "version": 1,
                "transition_date": null
            }, {
                "id": 36,
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
                            "mondayUntil": "08:00",
                            "sundayUntil": "07:00",
                            "tuesdayFrom": "19:00",
                            "saturdayFrom": "19:00",
                            "thursdayFrom": "19:00",
                            "tuesdayUntil": "07:00",
                            "saturdayUntil": "07:00",
                            "thursdayUntil": "07:00",
                            "wednesdayFrom": "19:00",
                            "firstNightFrom": "19:00",
                            "wednesdayUntil": "07:00",
                            "firstNightUntil": "07:00"
                        }
                    },
                    "approval": {"release": {"decision": "Yes", "decisionMaker": "DECISION MAKER"}},
                    "reporting": {
                        "reportingInstructions": {
                            "name": "louise",
                            "postcode": "pr1 0aa",
                            "telephone": "01772 666666",
                            "townOrCity": "preston",
                            "buildingAndStreet1": "1 street",
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
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "deemedSafe": "Yes",
                                "addressTown": "Wetherfield",
                                "electricity": "Yes",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "homeVisitConducted": "Yes",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {"standard": {"additionalConditionsRequired": "No"}}
                },
                "booking_id": 1167792,
                "stage": "DECIDED",
                "version": 1,
                "transition_date": null
            }, {
                "id": 50,
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
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1080794,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 58,
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
                                "occupier": {"name": "Liz McDonald", "relationship": "Mother"},
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1200666,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 44,
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
                            "firstNightFrom": "19:00",
                            "wednesdayUntil": "07:00",
                            "firstNightUntil": "07:00"
                        }
                    },
                    "approval": {"release": {"decision": "Yes", "decisionMaker": "DECISION MAKER"}},
                    "reporting": {
                        "reportingInstructions": {
                            "name": "louise",
                            "postcode": "pr1 0aa",
                            "telephone": "01772 666666",
                            "townOrCity": "preston",
                            "buildingAndStreet1": "1 street",
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
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "deemedSafe": "Yes",
                                "addressTown": "Wetherfield",
                                "electricity": "Yes",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "homeVisitConducted": "Yes",
                                "cautionedAgainstResident": "Yes"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {
                        "bespoke": [],
                        "standard": {"additionalConditionsRequired": "Yes"},
                        "additional": {"NOCONTACTASSOCIATE": {"groupsOrOrganisation": "Kirk Sutherland"}}
                    }
                },
                "booking_id": 1068733,
                "stage": "DECIDED",
                "version": 1,
                "transition_date": null
            }, {
                "id": 51,
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
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1152613,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 59,
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
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "Yes"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1200665,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 52,
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
                                "occupier": {"name": "Liz McDonald", "relationship": "Mother"},
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1068236,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 60,
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
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1200659,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 42,
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
                            "firstNightFrom": "19:00",
                            "wednesdayUntil": "07:00",
                            "firstNightUntil": "07:00"
                        }
                    },
                    "approval": {"release": {"decision": "Yes", "decisionMaker": "DECISION MAKER"}},
                    "reporting": {
                        "reportingInstructions": {
                            "name": "louise",
                            "postcode": "pr1 0aa",
                            "telephone": "01772 666666",
                            "townOrCity": "preston",
                            "buildingAndStreet1": "1 street",
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
                                "occupier": {"name": "Tom", "relationship": "dddd"},
                                "postCode": "LS16 6AA",
                                "residents": [],
                                "telephone": "0132613899",
                                "deemedSafe": "Yes",
                                "addressTown": "Leeds",
                                "electricity": "Yes",
                                "addressLine1": "31 The Crescent",
                                "addressLine2": "Adel",
                                "homeVisitConducted": "Yes",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {
                        "bespoke": [],
                        "standard": {"additionalConditionsRequired": "Yes"},
                        "additional": {"HOMEVISITS": {"mentalHealthName": "Cain Dingle"}}
                    }
                },
                "booking_id": 1200637,
                "stage": "DECIDED",
                "version": 1,
                "transition_date": null
            }, {
                "id": 53,
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
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1130463,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 40,
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
                                "occupier": {
                                    "name": "Ansgar Kupper",
                                    "relationship": "';kl;'l"
                                },
                                "postCode": "Tn10 3DT",
                                "residents": [],
                                "telephone": "07766554433",
                                "addressTown": "Tonbridge",
                                "addressLine1": "A.ljk;lk",
                                "addressLine2": "Manor Grove",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1200617,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }, {
                "id": 39,
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
                            "firstNightFrom": "19:00",
                            "wednesdayUntil": "07:00",
                            "firstNightUntil": "07:00"
                        }
                    },
                    "approval": {
                        "release": {
                            "reason": "insufficientTime",
                            "decision": "No",
                            "decisionMaker": "DECISION MAKER"
                        }
                    },
                    "reporting": {
                        "reportingInstructions": {
                            "name": "Ansgar Kupper",
                            "postcode": "Tn10 3DT",
                            "telephone": "07766554433",
                            "townOrCity": "l;k",
                            "buildingAndStreet1": ";'k",
                            "buildingAndStreet2": ";lk"
                        }
                    },
                    "eligibility": {
                        "crdTime": {"decision": "No"},
                        "excluded": {"decision": "No"},
                        "suitability": {"decision": "No"}
                    },
                    "finalChecks": {
                        "refusal": {
                            "reason": "addressUnsuitable",
                            "decision": "No",
                            "outOfTimeReasons": "[]"
                        },
                        "onRemand": {"decision": "No"},
                        "seriousOffence": {"decision": "No"},
                        "confiscationOrder": {"decision": "No"}
                    },
                    "proposedAddress": {
                        "optOut": {"decision": "No"},
                        "curfewAddress": {
                            "addresses": [{
                                "consent": "Yes",
                                "occupier": {"name": "Ansgar Kupper", "relationship": "l;khjo;ij"},
                                "postCode": "Tn10 3DT",
                                "residents": [],
                                "telephone": "07766554433",
                                "deemedSafe": "Yes",
                                "addressTown": "l;k",
                                "electricity": "Yes",
                                "addressLine1": ";'k",
                                "addressLine2": ";lk",
                                "homeVisitConducted": "Yes",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {"standard": {"additionalConditionsRequired": "No"}}
                },
                "booking_id": 1200645,
                "stage": "DECIDED",
                "version": 1,
                "transition_date": null
            }, {
                "id": 35,
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
                            "firstNightFrom": "19:00",
                            "wednesdayUntil": "07:00",
                            "firstNightUntil": "07:00"
                        }
                    },
                    "approval": {"release": {"decision": "Yes", "decisionMaker": "DECISION MAKER"}},
                    "document": {"template": {"decision": "hdc_ap_pss"}},
                    "reporting": {
                        "reportingDate": {"reportingDate": "28/09/2018", "reportingTime": "09:00"},
                        "reportingInstructions": {
                            "name": "Duty Officer",
                            "postcode": "LS166AA",
                            "telephone": "01234567890",
                            "townOrCity": "Leeds",
                            "buildingAndStreet1": "31 The Crescent",
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
                                "occupier": {"name": "Tom", "relationship": "fdfdfdf"},
                                "postCode": "LS16 6AA",
                                "residents": [],
                                "telephone": "0132613899",
                                "deemedSafe": "Yes",
                                "addressTown": "Leeds",
                                "electricity": "Yes",
                                "addressLine1": "31 The Crescent",
                                "addressLine2": "Adel",
                                "homeVisitConducted": "No",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    },
                    "licenceConditions": {
                        "bespoke": [],
                        "standard": {"additionalConditionsRequired": "Yes"},
                        "additional": {"NOCONTACTPRISONER": {}}
                    }
                },
                "booking_id": 1173494,
                "stage": "DECIDED",
                "version": 3,
                "transition_date": null
            }, {
                "id": 48,
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
                                "occupier": {"name": "Liz McDonald", "relationship": "Mother"},
                                "postCode": "M12 3AB",
                                "residents": [],
                                "telephone": "01611234567",
                                "addressTown": "Wetherfield",
                                "addressLine1": "1 coronation street",
                                "addressLine2": "",
                                "cautionedAgainstResident": "No"
                            }]
                        },
                        "addressProposed": {"decision": "Yes"}
                    }
                },
                "booking_id": 1131447,
                "stage": "PROCESSING_RO",
                "version": 1,
                "transition_date": null
            }]);
        });
};
