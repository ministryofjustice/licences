const path = require('path');

exports.seed = knex =>
    knex('CONDITIONS').delete()
        .then(
            () => knex('CONDITIONS').insert([

                // STANDARD
                {
                    ID: 'STANDARD1',
                    TYPE: 'STANDARD',
                    TEXT: 'Be of good behaviour and not behave in a way which undermines the purpose of the licence period.'
                },
                {
                    ID: 'STANDARD2',
                    TYPE: 'STANDARD',
                    TEXT: 'Not commit any offence.'
                },
                {
                    ID: 'STANDARD3',
                    TYPE: 'STANDARD',
                    TEXT: 'Keep in touch with the supervising officer in accordance with instructions given by the supervising officer.'
                },
                {
                    ID: 'STANDARD4',
                    TYPE: 'STANDARD',
                    TEXT: 'Receive visits from the supervising officer in accordance with instructions given by the supervising officer.'
                },
                {
                    ID: 'STANDARD5',
                    TYPE: 'STANDARD',
                    TEXT: 'Reside permanently at an address approved by the supervising officer and obtain the prior permission of the supervising officer for any stay of one or more nights at a different address.'
                },
                {
                    ID: 'STANDARD6',
                    TYPE: 'STANDARD',
                    TEXT: 'Not undertake work, or a particular type of work, unless it is approved by the supervising officer and notify the supervising officer in advance of any proposal to undertake work or a particular type of work.'
                },
                {
                    ID: 'STANDARD7',
                    TYPE: 'STANDARD',
                    TEXT: 'Not travel outside the United Kingdom, the Channel Islands or the Isle of Man except with the prior permission of your supervising officer or for the purposes of immigration deportation or removal.'
                },

                // ADDITIONAL
                // People, contact and relationships
                // Person or group
                {
                    ID: 'NOCONTACTPRISONER',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to contact directly or indirectly any person who is a serving or remand prisoner or detained in State custody, without the prior approval of your supervising officer.',
                    GROUP: 'PEOPLE',
                    SUBGROUP: 'PERSONORGROUP',
                    ACTIVE: 1
                },
                {
                    ID: 'NOCONTACTASSOCIATE',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to associate with any person currently or formerly associated with [NAME OR DESCRIBE SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer.',
                    USER_INPUT: 'groupsOrOrganisations',
                    GROUP: 'PEOPLE',
                    SUBGROUP: 'PERSONORGROUP',
                    ACTIVE: 1
                },
                {
                    ID: 'NOCONTACTSEXOFFENDER',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer.',
                    GROUP: 'PEOPLE',
                    SUBGROUP: 'PERSONORGROUP',
                    ACTIVE: 1
                },
                {
                    ID: 'INTIMATERELATIONSHIP',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Notify your supervising officer of any developing intimate relationships with [WOMEN / MEN / WOMEN OR MEN].',
                    USER_INPUT: 'intimateGender',
                    GROUP: 'PEOPLE',
                    SUBGROUP: 'PERSONORGROUP',
                    ACTIVE: 1
                },
                {
                    ID: 'NOCONTACTNAMED',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.',
                    USER_INPUT: 'noContactOffenders',
                    GROUP: 'PEOPLE',
                    SUBGROUP: 'PERSONORGROUP',
                    ACTIVE: 1

                },

                // People, contact and relationships
                // Children
                {
                    ID: 'NORESIDE',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
                    USER_INPUT: 'notToReside',
                    GROUP: 'PEOPLE',
                    SUBGROUP: 'CHILDREN',
                    ACTIVE: 1
                },
                {
                    ID: 'NOUNSUPERVISEDCONTACT',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to have unsupervised contact with  [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.',
                    USER_INPUT: 'noUnsupervisedContact',
                    GROUP: 'PEOPLE',
                    SUBGROUP: 'CHILDREN',
                    ACTIVE: 1
                },
                {
                    ID: 'NOCHILDRENSAREA',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to enter or remain in sight of any [CHILDREN’S PLAY AREA, SWIMMING BATHS, SCHOOL ETC] without the prior approval of your supervising officer.',
                    USER_INPUT: 'notInSightOf',
                    GROUP: 'PEOPLE',
                    SUBGROUP: 'CHILDREN',
                    ACTIVE: 1
                },
                {
                    ID: 'NOWORKWITHAGE',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.',
                    USER_INPUT: 'noWorkWithAge',
                    GROUP: 'PEOPLE',
                    SUBGROUP: 'CHILDREN',
                    ACTIVE: 1
                },
                {
                    ID: 'NOTIFYRELATIONSHIP',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Notify your supervising officer of any developing personal relationships, whether intimate or not, with any person you know or believe to be resident in a household containing children under the age of 18. This includes persons known to you prior to your time in custody with whom you are renewing or developing a personal relationship with.',
                    GROUP: 'PEOPLE',
                    SUBGROUP: 'CHILDREN',
                    ACTIVE: 1
                },

                // People, contact and relationships
                // Victims
                {
                    ID: 'NOCOMMUNICATEVICTIM',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
                    USER_INPUT: 'victimDetails',
                    GROUP: 'PEOPLE',
                    SUBGROUP: 'VICTIMS',
                    ACTIVE: 1
                },

                // Drugs health and behaviour
                {
                    ID: 'COMPLYREQUIREMENTS',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol / drug / sexual / violent / gambling / solvent abuse / anger / debt / prolific / offending behaviour problems at the [NAME OF COURSE / CENTRE].',
                    USER_INPUT: 'courseOrCentre',
                    GROUP: 'DRUGS',
                    ACTIVE: 1
                },
                {
                    ID: 'ATTEND',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
                    USER_INPUT: 'appointmentDetails',
                    GROUP: 'DRUGS',
                    ACTIVE: 1
                },
                {
                    ID: 'ATTENDALL',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Attend all appointments arranged for you with [INSERT NAME], a psychiatrist / psychologist / medical practitioner and co-operate fully with any care or treatment they recommend.',
                    USER_INPUT: 'appointmentName',
                    GROUP: 'DRUGS',
                    ACTIVE: 1
                },
                {
                    ID: 'HOMEVISITS',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Receive home visits from [INSERT NAME] Mental Health Worker.',
                    USER_INPUT: 'mentalHealthName',
                    GROUP: 'DRUGS',
                    ACTIVE: 1
                },

                // Curfew and reporting
                {
                    ID: 'REMAINADDRESS',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Confine yourself to remain at [CURFEW ADDRESS] initially from [START OF CURFEW HOURS] until [END OF CURFEW HOURS] each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored [WHETHER BY ELECTRONIC MEANS INVOLVING YOUR WEARING AN ELECTRONIC TAG OR OTHERWISE].',
                    USER_INPUT: 'curfewDetails',
                    GROUP: 'CURFEW',
                    ACTIVE: 1
                },
                {
                    ID: 'CONFINEADDRESS',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
                    USER_INPUT: 'confinedDetails',
                    GROUP: 'CURFEW',
                    ACTIVE: 1
                },
                {
                    ID: 'REPORTTO',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Report to staff at [NAME OF APPROVED PREMISES / POLICE STATION] at [TIME / DAILY], unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
                    USER_INPUT: 'reportingDetails',
                    GROUP: 'CURFEW',
                    ACTIVE: 1
                },

                // Travel
                {
                    ID: 'RETURNTOUK',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Should you return to the UK and Islands before the expiry date of your licence then your licence conditions will be in force and you must report within two working days to  our supervising officer.',
                    GROUP: 'TRAVEL',
                    ACTIVE: 1
                },

                // Travel
                // Passports
                {
                    ID: 'NOTIFYPASSPORT',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'To notify your supervising officer of the details of any passport that you possess (including passport number), and of any intention to apply for a new passport.',
                    GROUP: 'TRAVEL',
                    SUBGROUP: 'PASSPORTS',
                    ACTIVE: 1
                },
                {
                    ID: 'SURRENDERPASSPORT',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'To surrender your passport(s) to your supervising officer and to notify your supervising officer of any intention to apply for a new passport.',
                    GROUP: 'TRAVEL',
                    SUBGROUP: 'PASSPORTS',
                    ACTIVE: 1
                },

                // Travel
                // Vehicle
                {
                    ID: 'VEHICLEDETAILS',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Provide your supervising officer with details [SUCH AS MAKE, MODEL, COLOUR, REGISTRATION] of any vehicle you own, hire for more than a short journey or have regular use of, prior to any journey taking place.',
                    USER_INPUT: 'vehicleDetails',
                    GROUP: 'TRAVEL',
                    SUBGROUP: 'VEHICLES',
                    ACTIVE: 1
                },

                // Exclusion
                {
                    ID: 'EXCLUSIONADDRESS',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to enter [NAME/TYPE OF PREMISES / ADDRESS / ROAD] without the prior approval of your supervising officer.',
                    USER_INPUT: 'noEnterPlace',
                    GROUP: 'EXCLUSION',
                    ACTIVE: 1
                },
                {
                    ID: 'EXCLUSIONAREA',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to enter the area of [CLEARLY SPECIFIED AREA], as defined by the attached map without the prior approval of your supervising officer.',
                    USER_INPUT: 'exclusionArea',
                    GROUP: 'EXCLUSION',
                    ACTIVE: 1
                },

                // Technology
                // Mobile phones
                {
                    ID: 'ONEPHONE',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone, including the IMEI number and the SIM card that you possess.',
                    GROUP: 'TECHNOLOGY',
                    SUBGROUP: 'PHONES',
                    ACTIVE: 1
                },

                // Technology
                // Computers and internet
                {
                    ID: 'NOINTERNET',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to use or access any computer or device which is internet enabled without the prior approval of your supervising officer; and only for the purpose, and only at a public location, as specified by that officer.',
                    GROUP: 'TECHNOLOGY',
                    SUBGROUP: 'COMPUTERS',
                    ACTIVE: 1
                },
                {
                    ID: 'USAGEHISTORY',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to delete the usage history on any internet enabled device or computer used and to allow such items to be inspected as required by the police or your supervising officer. Such inspection may include removal of the device for inspection and the installation of monitoring software.',
                    GROUP: 'TECHNOLOGY',
                    SUBGROUP: 'COMPUTERS',
                    ACTIVE: 1
                },

                // Technology
                // Camera and photos
                {
                    ID: 'NOCAMERA',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'To make any device capable of making or storing digital images (including a camera and a mobile phone with a camera function) available for inspection on request by your supervising officer and/or a police officer.',
                    GROUP: 'TECHNOLOGY',
                    SUBGROUP: 'CAMERAS',
                    ACTIVE: 1
                },
                {
                    ID: 'NOCAMERAPHONE',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to own or possess a mobile phone with a photographic function without the prior approval of your supervising officer.',
                    GROUP: 'TECHNOLOGY',
                    SUBGROUP: 'CAMERAS',
                    ACTIVE: 1
                },
                {
                    ID: 'CAMERAAPPROVAL',
                    TYPE: 'ADDITIONAL',
                    TEXT: 'Not to own or use a camera without the prior approval of your supervising officer.',
                    GROUP: 'TECHNOLOGY',
                    SUBGROUP: 'CAMERAS',
                    ACTIVE: 1
                }
            ])
        );
