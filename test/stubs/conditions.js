/* eslint-disable */
module.exports = {
    additionalConditionsObject: {
        "People, contact and relationships": {
            "Person or group": [
                {
                    "id": "NOCONTACTPRISONER",
                    "text": "Not to contact directly or indirectly any person who is a serving or remand offender or detained in State custody, without the prior approval of your supervising officer.",
                    "user_input": null,
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": null,
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group"
                },
                {
                    "id": "NOCONTACTASSOCIATE",
                    "text": "Not to associate with any person currently or formerly associated with [NAME OR DESCRIBE SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer.",
                    "user_input": "groupsOrOrganisations",
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": {
                        "groupsOrOrganisation": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group"
                },
                {
                    "id": "NOCONTACTSEXOFFENDER",
                    "text": "Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer.",
                    "user_input": null,
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": null,
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group"
                },
                {
                    "id": "INTIMATERELATIONSHIP",
                    "text": "Notify your supervising officer of any developing intimate relationships with [WOMEN / MEN / WOMEN OR MEN].",
                    "user_input": "intimateGender",
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": {
                        "intimateGender": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group"
                },
                {
                    "id": "NOCONTACTNAMED",
                    "text": "Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.",
                    "user_input": "noContactOffenders",
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": {
                        "noContactOffenders": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group"
                }
            ],
            "Children": [
                {
                    "id": "NORESIDE",
                    "text": "Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.",
                    "user_input": "notToReside",
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": {
                        "notResideWithAge": 1,
                        "notResideWithGender": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children"
                },
                {
                    "id": "NOUNSUPERVISEDCONTACT",
                    "text": "Not to have unsupervised contact with  [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.",
                    "user_input": "noUnsupervisedContact",
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": {
                        "unsupervisedContactAge": 1,
                        "unsupervisedContactGender": 0,
                        "unsupervisedContactSocial": 2
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children"
                },
                {
                    "id": "NOCHILDRENSAREA",
                    "text": "Not to enter or remain in sight of any [CHILDREN’S PLAY AREA, SWIMMING BATHS, SCHOOL ETC] without the prior approval of your supervising officer.",
                    "user_input": "notInSightOf",
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": {
                        "notInSightOf": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children"
                },
                {
                    "id": "NOWORKWITHAGE",
                    "text": "Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.",
                    "user_input": "noWorkWithAge",
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": {
                        "noWorkWithAge": "0"
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children"
                },
                {
                    "id": "NOTIFYRELATIONSHIP",
                    "text": "Notify your supervising officer of any developing personal relationships, whether intimate or not, with any person you know or believe to be resident in a household containing children under the age of 18. This includes persons known to you prior to your time in custody with whom you are renewing or developing a personal relationship with.",
                    "user_input": null,
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": null,
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children"
                }
            ],
            "Victims": [
                {
                    "id": "NOCOMMUNICATEVICTIM",
                    "text": "Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].",
                    "user_input": "victimDetails",
                    "group": "PEOPLE",
                    "subgroup": "VICTIMS",
                    "active": true,
                    "field_position": {
                        "socialServicesDept": 1,
                        "victimFamilyMembers": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Victims"
                }
            ]
        },
        "Drugs, health and behaviour": {
            "base": [
                {
                    "id": "COMPLYREQUIREMENTS",
                    "text": "To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol / drug / sexual / violent / gambling / solvent abuse / anger / debt / prolific / offending behaviour problems at the [NAME OF COURSE / CENTRE].",
                    "user_input": "courseOrCentre",
                    "group": "DRUGS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "courseOrCentre": "0"
                    },
                    "group_name": "Drugs, health and behaviour",
                    "subgroup_name": null
                },
                {
                    "id": "ATTENDALL",
                    "text": "Attend all appointments arranged for you with [INSERT NAME], a [PSYCHIATRIST / PSYCHOLOGIST / MEDICAL PRACTITIONER] and co-operate fully with any care or treatment they recommend.",
                    "user_input": "appointmentName",
                    "group": "DRUGS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "appointmentName": "0",
                        "appointmentProfession": "1"
                    },
                    "group_name": "Drugs, health and behaviour",
                    "subgroup_name": null
                },
                {
                    "id": "HOMEVISITS",
                    "text": "Receive home visits from [INSERT NAME] Mental Health Worker.",
                    "user_input": "mentalHealthName",
                    "group": "DRUGS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "mentalHealthName": "0"
                    },
                    "group_name": "Drugs, health and behaviour",
                    "subgroup_name": null
                }
            ]
        },
        "Curfew and reporting": {
            "base": [
                {
                    "id": "REMAINADDRESS",
                    "text": "Confine yourself to remain at [CURFEW ADDRESS] initially from [START OF CURFEW HOURS] until [END OF CURFEW HOURS] each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored [WHETHER BY ELECTRONIC MEANS INVOLVING YOUR WEARING AN ELECTRONIC TAG OR OTHERWISE].",
                    "user_input": "curfewDetails",
                    "group": "CURFEW",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "curfewTo": "2",
                        "curfewFrom": "1",
                        "curfewAddress": "0",
                        "curfewTagRequired": "3"
                    },
                    "group_name": "Curfew and reporting",
                    "subgroup_name": null
                },
                {
                    "id": "CONFINEADDRESS",
                    "text": "Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.",
                    "user_input": "confinedDetails",
                    "group": "CURFEW",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "confinedTo": "0",
                        "confinedFrom": "1",
                        "confinedReviewFrequency": "2"
                    },
                    "group_name": "Curfew and reporting",
                    "subgroup_name": null
                },
                {
                    "id": "REPORTTO",
                    "text": "Report to staff at [NAME OF APPROVED PREMISES / POLICE STATION] at [TIME / DAILY], unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.",
                    "user_input": "reportingDetails",
                    "group": "CURFEW",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "reportingTime": "1",
                        "reportingDaily": "2",
                        "reportingAddress": "0",
                        "reportingFrequency": "3"
                    },
                    "group_name": "Curfew and reporting",
                    "subgroup_name": null
                }
            ]
        },
        "Travel": {
            "base": [
                {
                    "id": "RETURNTOUK",
                    "text": "Should you return to the UK and Islands before the expiry date of your licence then your licence conditions will be in force and you must report within two working days to  our supervising officer.",
                    "user_input": null,
                    "group": "TRAVEL",
                    "subgroup": null,
                    "active": true,
                    "field_position": null,
                    "group_name": "Travel",
                    "subgroup_name": null
                }
            ],
            "Passports": [
                {
                    "id": "NOTIFYPASSPORT",
                    "text": "To notify your supervising officer of the details of any passport that you possess (including passport number), and of any intention to apply for a new passport.",
                    "user_input": null,
                    "group": "TRAVEL",
                    "subgroup": "PASSPORTS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Travel",
                    "subgroup_name": "Passports"
                },
                {
                    "id": "SURRENDERPASSPORT",
                    "text": "To surrender your passport(s) to your supervising officer and to notify your supervising officer of any intention to apply for a new passport.",
                    "user_input": null,
                    "group": "TRAVEL",
                    "subgroup": "PASSPORTS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Travel",
                    "subgroup_name": "Passports"
                }
            ],
            "Vehicles": [
                {
                    "id": "VEHICLEDETAILS",
                    "text": "Provide your supervising officer with details [SUCH AS MAKE, MODEL, COLOUR, REGISTRATION] of any vehicle you own, hire for more than a short journey or have regular use of, prior to any journey taking place.",
                    "user_input": "vehicleDetails",
                    "group": "TRAVEL",
                    "subgroup": "VEHICLES",
                    "active": true,
                    "field_position": {
                        "vehicleDetails": 0
                    },
                    "group_name": "Travel",
                    "subgroup_name": "Vehicles"
                }
            ]
        },
        "Exclusion": {
            "base": [
                {
                    "id": "EXCLUSIONADDRESS",
                    "text": "Not to enter [NAME/TYPE OF PREMISES / ADDRESS / ROAD] without the prior approval of your supervising officer.",
                    "user_input": "noEnterPlace",
                    "group": "EXCLUSION",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "noEnterPlace": "0"
                    },
                    "group_name": "Exclusion",
                    "subgroup_name": null
                },
                {
                    "id": "EXCLUSIONAREA",
                    "text": "Not to enter the area of [CLEARLY SPECIFIED AREA], as defined by the attached map without the prior approval of your supervising officer.",
                    "user_input": "exclusionArea",
                    "group": "EXCLUSION",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "exclusionArea": "0"
                    },
                    "group_name": "Exclusion",
                    "subgroup_name": null
                }
            ]
        },
        "Technology": {
            "Mobile phones": [
                {
                    "id": "ONEPHONE",
                    "text": "Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone, including the IMEI number and the SIM card that you possess.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "PHONES",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Mobile phones"
                }
            ],
            "Computers and internet": [
                {
                    "id": "NOINTERNET",
                    "text": "Not to use or access any computer or device which is internet enabled without the prior approval of your supervising officer; and only for the purpose, and only at a public location, as specified by that officer.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "COMPUTERS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Computers and internet"
                },
                {
                    "id": "USAGEHISTORY",
                    "text": "Not to delete the usage history on any internet enabled device or computer used and to allow such items to be inspected as required by the police or your supervising officer. Such inspection may include removal of the device for inspection and the installation of monitoring software.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "COMPUTERS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Computers and internet"
                }
            ],
            "Cameras and photos": [
                {
                    "id": "NOCAMERA",
                    "text": "To make any device capable of making or storing digital images (including a camera and a mobile phone with a camera function) available for inspection on request by your supervising officer and/or a police officer.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "CAMERAS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Cameras and photos"
                },
                {
                    "id": "CAMERAAPPROVAL",
                    "text": "Not to own or use a camera without the prior approval of your supervising officer.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "CAMERAS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Cameras and photos"
                },
                {
                    "id": "NOCAMERAPHONE",
                    "text": "Not to own or possess a mobile phone with a photographic function without the prior approval of your supervising officer.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "CAMERAS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Cameras and photos"
                }
            ]
        },
        "Post-sentence supervision only": {
            "base": [
                {
                    "id": "ATTENDSAMPLE",
                    "text": "Attend [INSERT APPOINTMENT NAME AND ADDRESS], as reasonably required by your supervisor, to give a sample of oral fluid/urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of supervision period requiring you to be of good behaviour.",
                    "user_input": "attendSampleDetails",
                    "group": "PSS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "attendSampleDetailsName": 0,
                        "attendSampleDetailsAddress": 1
                    },
                    "group_name": "Post-sentence supervision only",
                    "subgroup_name": null
                },
                {
                    "id": "ATTENDDEPENDENCY",
                    "text": "Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.",
                    "user_input": "appointmentDetails",
                    "group": "PSS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "appointmentDate": 0,
                        "appointmentTime": 1,
                        "appointmentAddress": 2
                    },
                    "group_name": "Post-sentence supervision only",
                    "subgroup_name": null
                }
            ]
        },
    },

    additionalConditionsObjectNoResideSelected: {
        "People, contact and relationships": {
            "Person or group": [
                {
                    "id": "NOCONTACTPRISONER",
                    "text": "Not to contact directly or indirectly any person who is a serving or remand offender or detained in State custody, without the prior approval of your supervising officer.",
                    "user_input": null,
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": null,
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOCONTACTASSOCIATE",
                    "text": "Not to associate with any person currently or formerly associated with [NAME OR DESCRIBE SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer.",
                    "user_input": "groupsOrOrganisations",
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": {
                        "groupsOrOrganisation": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOCONTACTSEXOFFENDER",
                    "text": "Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer.",
                    "user_input": null,
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": null,
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "INTIMATERELATIONSHIP",
                    "text": "Notify your supervising officer of any developing intimate relationships with [WOMEN / MEN / WOMEN OR MEN].",
                    "user_input": "intimateGender",
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": {
                        "intimateGender": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOCONTACTNAMED",
                    "text": "Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.",
                    "user_input": "noContactOffenders",
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": {
                        "noContactOffenders": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group",
                    "selected": false,
                    "user_submission": {}
                }
            ],
            "Children": [
                {
                    "id": "NORESIDE",
                    "text": "Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.",
                    "user_input": "notToReside",
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": {
                        "notResideWithAge": 1,
                        "notResideWithGender": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children",
                    "selected": true,
                    "user_submission": {
                        "notResideWithAge": 12,
                        "notResideWithGender": "Female"
                    }
                },
                {
                    "id": "NOUNSUPERVISEDCONTACT",
                    "text": "Not to have unsupervised contact with  [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.",
                    "user_input": "noUnsupervisedContact",
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": {
                        "unsupervisedContactAge": 1,
                        "unsupervisedContactGender": 0,
                        "unsupervisedContactSocial": 2
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOCHILDRENSAREA",
                    "text": "Not to enter or remain in sight of any [CHILDREN’S PLAY AREA, SWIMMING BATHS, SCHOOL ETC] without the prior approval of your supervising officer.",
                    "user_input": "notInSightOf",
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": {
                        "notInSightOf": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOWORKWITHAGE",
                    "text": "Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.",
                    "user_input": "noWorkWithAge",
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": {
                        "noWorkWithAge": "0"
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOTIFYRELATIONSHIP",
                    "text": "Notify your supervising officer of any developing personal relationships, whether intimate or not, with any person you know or believe to be resident in a household containing children under the age of 18. This includes persons known to you prior to your time in custody with whom you are renewing or developing a personal relationship with.",
                    "user_input": null,
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": null,
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children",
                    "selected": false,
                    "user_submission": {}
                }
            ],
            "Victims": [
                {
                    "id": "NOCOMMUNICATEVICTIM",
                    "text": "Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].",
                    "user_input": "victimDetails",
                    "group": "PEOPLE",
                    "subgroup": "VICTIMS",
                    "active": true,
                    "field_position": {
                        "socialServicesDept": 1,
                        "victimFamilyMembers": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Victims",
                    "selected": false,
                    "user_submission": {}
                }
            ]
        },
        "Drugs, health and behaviour": {
            "base": [
                {
                    "id": "COMPLYREQUIREMENTS",
                    "text": "To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol / drug / sexual / violent / gambling / solvent abuse / anger / debt / prolific / offending behaviour problems at the [NAME OF COURSE / CENTRE].",
                    "user_input": "courseOrCentre",
                    "group": "DRUGS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "courseOrCentre": "0"
                    },
                    "group_name": "Drugs, health and behaviour",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "ATTENDALL",
                    "text": "Attend all appointments arranged for you with [INSERT NAME], a [PSYCHIATRIST / PSYCHOLOGIST / MEDICAL PRACTITIONER] and co-operate fully with any care or treatment they recommend.",
                    "user_input": "appointmentName",
                    "group": "DRUGS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "appointmentName": "0",
                        "appointmentProfession": "1"
                    },
                    "group_name": "Drugs, health and behaviour",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "HOMEVISITS",
                    "text": "Receive home visits from [INSERT NAME] Mental Health Worker.",
                    "user_input": "mentalHealthName",
                    "group": "DRUGS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "mentalHealthName": "0"
                    },
                    "group_name": "Drugs, health and behaviour",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                }
            ]
        },
        "Curfew and reporting": {
            "base": [
                {
                    "id": "REMAINADDRESS",
                    "text": "Confine yourself to remain at [CURFEW ADDRESS] initially from [START OF CURFEW HOURS] until [END OF CURFEW HOURS] each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored [WHETHER BY ELECTRONIC MEANS INVOLVING YOUR WEARING AN ELECTRONIC TAG OR OTHERWISE].",
                    "user_input": "curfewDetails",
                    "group": "CURFEW",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "curfewTo": "2",
                        "curfewFrom": "1",
                        "curfewAddress": "0",
                        "curfewTagRequired": "3"
                    },
                    "group_name": "Curfew and reporting",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "CONFINEADDRESS",
                    "text": "Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.",
                    "user_input": "confinedDetails",
                    "group": "CURFEW",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "confinedTo": "0",
                        "confinedFrom": "1",
                        "confinedReviewFrequency": "2"
                    },
                    "group_name": "Curfew and reporting",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "REPORTTO",
                    "text": "Report to staff at [NAME OF APPROVED PREMISES / POLICE STATION] at [TIME / DAILY], unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.",
                    "user_input": "reportingDetails",
                    "group": "CURFEW",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "reportingTime": "1",
                        "reportingDaily": "2",
                        "reportingAddress": "0",
                        "reportingFrequency": "3"
                    },
                    "group_name": "Curfew and reporting",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                }
            ]
        },
        "Travel": {
            "base": [
                {
                    "id": "RETURNTOUK",
                    "text": "Should you return to the UK and Islands before the expiry date of your licence then your licence conditions will be in force and you must report within two working days to  our supervising officer.",
                    "user_input": null,
                    "group": "TRAVEL",
                    "subgroup": null,
                    "active": true,
                    "field_position": null,
                    "group_name": "Travel",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                }
            ],
            "Passports": [
                {
                    "id": "NOTIFYPASSPORT",
                    "text": "To notify your supervising officer of the details of any passport that you possess (including passport number), and of any intention to apply for a new passport.",
                    "user_input": null,
                    "group": "TRAVEL",
                    "subgroup": "PASSPORTS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Travel",
                    "subgroup_name": "Passports",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "SURRENDERPASSPORT",
                    "text": "To surrender your passport(s) to your supervising officer and to notify your supervising officer of any intention to apply for a new passport.",
                    "user_input": null,
                    "group": "TRAVEL",
                    "subgroup": "PASSPORTS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Travel",
                    "subgroup_name": "Passports",
                    "selected": false,
                    "user_submission": {}
                }
            ],
            "Vehicles": [
                {
                    "id": "VEHICLEDETAILS",
                    "text": "Provide your supervising officer with details [SUCH AS MAKE, MODEL, COLOUR, REGISTRATION] of any vehicle you own, hire for more than a short journey or have regular use of, prior to any journey taking place.",
                    "user_input": "vehicleDetails",
                    "group": "TRAVEL",
                    "subgroup": "VEHICLES",
                    "active": true,
                    "field_position": {
                        "vehicleDetails": 0
                    },
                    "group_name": "Travel",
                    "subgroup_name": "Vehicles",
                    "selected": false,
                    "user_submission": {}
                }
            ]
        },
        "Exclusion": {
            "base": [
                {
                    "id": "EXCLUSIONADDRESS",
                    "text": "Not to enter [NAME/TYPE OF PREMISES / ADDRESS / ROAD] without the prior approval of your supervising officer.",
                    "user_input": "noEnterPlace",
                    "group": "EXCLUSION",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "noEnterPlace": "0"
                    },
                    "group_name": "Exclusion",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "EXCLUSIONAREA",
                    "text": "Not to enter the area of [CLEARLY SPECIFIED AREA], as defined by the attached map without the prior approval of your supervising officer.",
                    "user_input": "exclusionArea",
                    "group": "EXCLUSION",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "exclusionArea": "0"
                    },
                    "group_name": "Exclusion",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                }
            ]
        },
        "Technology": {
            "Mobile phones": [
                {
                    "id": "ONEPHONE",
                    "text": "Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone, including the IMEI number and the SIM card that you possess.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "PHONES",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Mobile phones",
                    "selected": false,
                    "user_submission": {}
                }
            ],
            "Computers and internet": [
                {
                    "id": "NOINTERNET",
                    "text": "Not to use or access any computer or device which is internet enabled without the prior approval of your supervising officer; and only for the purpose, and only at a public location, as specified by that officer.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "COMPUTERS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Computers and internet",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "USAGEHISTORY",
                    "text": "Not to delete the usage history on any internet enabled device or computer used and to allow such items to be inspected as required by the police or your supervising officer. Such inspection may include removal of the device for inspection and the installation of monitoring software.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "COMPUTERS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Computers and internet",
                    "selected": false,
                    "user_submission": {}
                }
            ],
            "Cameras and photos": [
                {
                    "id": "NOCAMERA",
                    "text": "To make any device capable of making or storing digital images (including a camera and a mobile phone with a camera function) available for inspection on request by your supervising officer and/or a police officer.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "CAMERAS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Cameras and photos",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "CAMERAAPPROVAL",
                    "text": "Not to own or use a camera without the prior approval of your supervising officer.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "CAMERAS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Cameras and photos",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOCAMERAPHONE",
                    "text": "Not to own or possess a mobile phone with a photographic function without the prior approval of your supervising officer.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "CAMERAS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Cameras and photos",
                    "selected": false,
                    "user_submission": {}
                }
            ]
        },
        "Post-sentence supervision only": {
            "base": [
                {
                    "id": "ATTENDSAMPLE",
                    "text": "Attend [INSERT APPOINTMENT NAME AND ADDRESS], as reasonably required by your supervisor, to give a sample of oral fluid/urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of supervision period requiring you to be of good behaviour.",
                    "user_input": "attendSampleDetails",
                    "group": "PSS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "attendSampleDetailsName": 0,
                        "attendSampleDetailsAddress": 1
                    },
                    "group_name": "Post-sentence supervision only",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "ATTENDDEPENDENCY",
                    "text": "Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.",
                    "user_input": "appointmentDetails",
                    "group": "PSS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "appointmentDate": 0,
                        "appointmentTime": 1,
                        "appointmentAddress": 2
                    },
                    "group_name": "Post-sentence supervision only",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                }
            ]
        }

    },

    additionalConditionsObjectDateSelected: {
        "People, contact and relationships": {
            "Person or group": [
                {
                    "id": "NOCONTACTPRISONER",
                    "text": "Not to contact directly or indirectly any person who is a serving or remand offender or detained in State custody, without the prior approval of your supervising officer.",
                    "user_input": null,
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": null,
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOCONTACTASSOCIATE",
                    "text": "Not to associate with any person currently or formerly associated with [NAME OR DESCRIBE SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer.",
                    "user_input": "groupsOrOrganisations",
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": {
                        "groupsOrOrganisation": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOCONTACTSEXOFFENDER",
                    "text": "Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer.",
                    "user_input": null,
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": null,
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "INTIMATERELATIONSHIP",
                    "text": "Notify your supervising officer of any developing intimate relationships with [WOMEN / MEN / WOMEN OR MEN].",
                    "user_input": "intimateGender",
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": {
                        "intimateGender": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOCONTACTNAMED",
                    "text": "Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.",
                    "user_input": "noContactOffenders",
                    "group": "PEOPLE",
                    "subgroup": "PERSONORGROUP",
                    "active": true,
                    "field_position": {
                        "noContactOffenders": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Person or group",
                    "selected": false,
                    "user_submission": {}
                }
            ],
            "Children": [
                {
                    "id": "NORESIDE",
                    "text": "Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.",
                    "user_input": "notToReside",
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": {
                        "notResideWithAge": 1,
                        "notResideWithGender": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOUNSUPERVISEDCONTACT",
                    "text": "Not to have unsupervised contact with  [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.",
                    "user_input": "noUnsupervisedContact",
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": {
                        "unsupervisedContactAge": 1,
                        "unsupervisedContactGender": 0,
                        "unsupervisedContactSocial": 2
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOCHILDRENSAREA",
                    "text": "Not to enter or remain in sight of any [CHILDREN’S PLAY AREA, SWIMMING BATHS, SCHOOL ETC] without the prior approval of your supervising officer.",
                    "user_input": "notInSightOf",
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": {
                        "notInSightOf": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOWORKWITHAGE",
                    "text": "Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.",
                    "user_input": "noWorkWithAge",
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": {
                        "noWorkWithAge": "0"
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOTIFYRELATIONSHIP",
                    "text": "Notify your supervising officer of any developing personal relationships, whether intimate or not, with any person you know or believe to be resident in a household containing children under the age of 18. This includes persons known to you prior to your time in custody with whom you are renewing or developing a personal relationship with.",
                    "user_input": null,
                    "group": "PEOPLE",
                    "subgroup": "CHILDREN",
                    "active": true,
                    "field_position": null,
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Children",
                    "selected": false,
                    "user_submission": {}
                }
            ],
            "Victims": [
                {
                    "id": "NOCOMMUNICATEVICTIM",
                    "text": "Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].",
                    "user_input": "victimDetails",
                    "group": "PEOPLE",
                    "subgroup": "VICTIMS",
                    "active": true,
                    "field_position": {
                        "socialServicesDept": 1,
                        "victimFamilyMembers": 0
                    },
                    "group_name": "People, contact and relationships",
                    "subgroup_name": "Victims",
                    "selected": false,
                    "user_submission": {}
                }
            ]
        },
        "Drugs, health and behaviour": {
            "base": [
                {
                    "id": "COMPLYREQUIREMENTS",
                    "text": "To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol / drug / sexual / violent / gambling / solvent abuse / anger / debt / prolific / offending behaviour problems at the [NAME OF COURSE / CENTRE].",
                    "user_input": "courseOrCentre",
                    "group": "DRUGS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "courseOrCentre": "0"
                    },
                    "group_name": "Drugs, health and behaviour",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "ATTENDALL",
                    "text": "Attend all appointments arranged for you with [INSERT NAME], a [PSYCHIATRIST / PSYCHOLOGIST / MEDICAL PRACTITIONER] and co-operate fully with any care or treatment they recommend.",
                    "user_input": "appointmentName",
                    "group": "DRUGS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "appointmentName": "0",
                        "appointmentProfession": "1"
                    },
                    "group_name": "Drugs, health and behaviour",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "HOMEVISITS",
                    "text": "Receive home visits from [INSERT NAME] Mental Health Worker.",
                    "user_input": "mentalHealthName",
                    "group": "DRUGS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "mentalHealthName": "0"
                    },
                    "group_name": "Drugs, health and behaviour",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                }
            ]
        },
        "Curfew and reporting": {
            "base": [
                {
                    "id": "REMAINADDRESS",
                    "text": "Confine yourself to remain at [CURFEW ADDRESS] initially from [START OF CURFEW HOURS] until [END OF CURFEW HOURS] each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored [WHETHER BY ELECTRONIC MEANS INVOLVING YOUR WEARING AN ELECTRONIC TAG OR OTHERWISE].",
                    "user_input": "curfewDetails",
                    "group": "CURFEW",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "curfewTo": "2",
                        "curfewFrom": "1",
                        "curfewAddress": "0",
                        "curfewTagRequired": "3"
                    },
                    "group_name": "Curfew and reporting",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "CONFINEADDRESS",
                    "text": "Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.",
                    "user_input": "confinedDetails",
                    "group": "CURFEW",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "confinedTo": "0",
                        "confinedFrom": "1",
                        "confinedReviewFrequency": "2"
                    },
                    "group_name": "Curfew and reporting",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "REPORTTO",
                    "text": "Report to staff at [NAME OF APPROVED PREMISES / POLICE STATION] at [TIME / DAILY], unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.",
                    "user_input": "reportingDetails",
                    "group": "CURFEW",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "reportingTime": "1",
                        "reportingDaily": "2",
                        "reportingAddress": "0",
                        "reportingFrequency": "3"
                    },
                    "group_name": "Curfew and reporting",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                }
            ]
        },
        "Travel": {
            "base": [
                {
                    "id": "RETURNTOUK",
                    "text": "Should you return to the UK and Islands before the expiry date of your licence then your licence conditions will be in force and you must report within two working days to  our supervising officer.",
                    "user_input": null,
                    "group": "TRAVEL",
                    "subgroup": null,
                    "active": true,
                    "field_position": null,
                    "group_name": "Travel",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                }
            ],
            "Passports": [
                {
                    "id": "NOTIFYPASSPORT",
                    "text": "To notify your supervising officer of the details of any passport that you possess (including passport number), and of any intention to apply for a new passport.",
                    "user_input": null,
                    "group": "TRAVEL",
                    "subgroup": "PASSPORTS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Travel",
                    "subgroup_name": "Passports",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "SURRENDERPASSPORT",
                    "text": "To surrender your passport(s) to your supervising officer and to notify your supervising officer of any intention to apply for a new passport.",
                    "user_input": null,
                    "group": "TRAVEL",
                    "subgroup": "PASSPORTS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Travel",
                    "subgroup_name": "Passports",
                    "selected": false,
                    "user_submission": {}
                }
            ],
            "Vehicles": [
                {
                    "id": "VEHICLEDETAILS",
                    "text": "Provide your supervising officer with details [SUCH AS MAKE, MODEL, COLOUR, REGISTRATION] of any vehicle you own, hire for more than a short journey or have regular use of, prior to any journey taking place.",
                    "user_input": "vehicleDetails",
                    "group": "TRAVEL",
                    "subgroup": "VEHICLES",
                    "active": true,
                    "field_position": {
                        "vehicleDetails": 0
                    },
                    "group_name": "Travel",
                    "subgroup_name": "Vehicles",
                    "selected": false,
                    "user_submission": {}
                }
            ]
        },
        "Exclusion": {
            "base": [
                {
                    "id": "EXCLUSIONADDRESS",
                    "text": "Not to enter [NAME/TYPE OF PREMISES / ADDRESS / ROAD] without the prior approval of your supervising officer.",
                    "user_input": "noEnterPlace",
                    "group": "EXCLUSION",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "noEnterPlace": "0"
                    },
                    "group_name": "Exclusion",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "EXCLUSIONAREA",
                    "text": "Not to enter the area of [CLEARLY SPECIFIED AREA], as defined by the attached map without the prior approval of your supervising officer.",
                    "user_input": "exclusionArea",
                    "group": "EXCLUSION",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "exclusionArea": "0"
                    },
                    "group_name": "Exclusion",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                }
            ]
        },
        "Technology": {
            "Mobile phones": [
                {
                    "id": "ONEPHONE",
                    "text": "Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone, including the IMEI number and the SIM card that you possess.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "PHONES",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Mobile phones",
                    "selected": false,
                    "user_submission": {}
                }
            ],
            "Computers and internet": [
                {
                    "id": "NOINTERNET",
                    "text": "Not to use or access any computer or device which is internet enabled without the prior approval of your supervising officer; and only for the purpose, and only at a public location, as specified by that officer.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "COMPUTERS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Computers and internet",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "USAGEHISTORY",
                    "text": "Not to delete the usage history on any internet enabled device or computer used and to allow such items to be inspected as required by the police or your supervising officer. Such inspection may include removal of the device for inspection and the installation of monitoring software.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "COMPUTERS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Computers and internet",
                    "selected": false,
                    "user_submission": {}
                }
            ],
            "Cameras and photos": [
                {
                    "id": "NOCAMERA",
                    "text": "To make any device capable of making or storing digital images (including a camera and a mobile phone with a camera function) available for inspection on request by your supervising officer and/or a police officer.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "CAMERAS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Cameras and photos",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "CAMERAAPPROVAL",
                    "text": "Not to own or use a camera without the prior approval of your supervising officer.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "CAMERAS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Cameras and photos",
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "NOCAMERAPHONE",
                    "text": "Not to own or possess a mobile phone with a photographic function without the prior approval of your supervising officer.",
                    "user_input": null,
                    "group": "TECHNOLOGY",
                    "subgroup": "CAMERAS",
                    "active": true,
                    "field_position": null,
                    "group_name": "Technology",
                    "subgroup_name": "Cameras and photos",
                    "selected": false,
                    "user_submission": {}
                }
            ]
        },
        "Post-sentence supervision only": {
            "base": [
                {
                    "id": "ATTENDSAMPLE",
                    "text": "Attend [INSERT APPOINTMENT NAME AND ADDRESS], as reasonably required by your supervisor, to give a sample of oral fluid/urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of supervision period requiring you to be of good behaviour.",
                    "user_input": "attendSampleDetails",
                    "group": "PSS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "attendSampleDetailsName": 0,
                        "attendSampleDetailsAddress": 1
                    },
                    "group_name": "Post-sentence supervision only",
                    "subgroup_name": null,
                    "selected": false,
                    "user_submission": {}
                },
                {
                    "id": "ATTENDDEPENDENCY",
                    "text": "Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.",
                    "user_input": "appointmentDetails",
                    "group": "PSS",
                    "subgroup": null,
                    "active": true,
                    "field_position": {
                        "appointmentDate": 0,
                        "appointmentTime": 1,
                        "appointmentAddress": 2
                    },
                    "group_name": "Post-sentence supervision only",
                    "subgroup_name": null,
                    "selected": true,
                    "user_submission": {
                        "appointmentDate": "12/03/1985",
                        "appointmentDay": "12",
                        "appointmentMonth": "03",
                        "appointmentYear": "1985"
                    }
                }
            ]
        }
    }
};
