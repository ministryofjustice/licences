const path = require('path');

exports.seed = knex =>
    knex('conditions').delete()
        .then(
            () => knex('conditions').insert([

                // STANDARD
                {
                    id: 'STANDARD1',
                    type: 'STANDARD',
                    text: 'Be of good behaviour and not behave in a way which undermines the purpose of the licence period.'
                },
                {
                    id: 'STANDARD2',
                    type: 'STANDARD',
                    text: 'Not commit any offence.'
                },
                {
                    id: 'STANDARD3',
                    type: 'STANDARD',
                    text: 'Keep in touch with the supervising officer in accordance with instructions given by the supervising officer.'
                },
                {
                    id: 'STANDARD4',
                    type: 'STANDARD',
                    text: 'Receive visits from the supervising officer in accordance with instructions given by the supervising officer.'
                },
                {
                    id: 'STANDARD5',
                    type: 'STANDARD',
                    text: 'Reside permanently at an address approved by the supervising officer and obtain the prior permission of the supervising officer for any stay of one or more nights at a different address.'
                },
                {
                    id: 'STANDARD6',
                    type: 'STANDARD',
                    text: 'Not undertake work, or a particular type of work, unless it is approved by the supervising officer and notify the supervising officer in advance of any proposal to undertake work or a particular type of work.'
                },
                {
                    id: 'STANDARD7',
                    type: 'STANDARD',
                    text: 'Not travel outside the United Kingdom, the Channel Islands or the Isle of Man except with the prior permission of your supervising officer or for the purposes of immigration deportation or removal.'
                },

                // ADDITIONAL
                // People, contact and relationships
                // Person or group
                {
                    id: 'NOCONTACTPRISONER',
                    type: 'ADDITIONAL',
                    text: 'Not to contact directly or indirectly any person who is a serving or remand offender or detained in State custody, without the prior approval of your supervising officer.',
                    group: 'PEOPLE',
                    subgroup: 'PERSONORGROUP',
                    active: 1
                },
                {
                    id: 'NOCONTACTASSOCIATE',
                    type: 'ADDITIONAL',
                    text: 'Not to associate with any person currently or formerly associated with [NAME OR DESCRIBE SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer.',
                    user_input: 'groupsOrOrganisations',
                    group: 'PEOPLE',
                    subgroup: 'PERSONORGROUP',
                    active: 1
                },
                {
                    id: 'NOCONTACTSEXOFFENDER',
                    type: 'ADDITIONAL',
                    text: 'Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer.',
                    group: 'PEOPLE',
                    subgroup: 'PERSONORGROUP',
                    active: 1
                },
                {
                    id: 'INTIMATERELATIONSHIP',
                    type: 'ADDITIONAL',
                    text: 'Notify your supervising officer of any developing intimate relationships with [WOMEN / MEN / WOMEN OR MEN].',
                    user_input: 'intimateGender',
                    group: 'PEOPLE',
                    subgroup: 'PERSONORGROUP',
                    active: 1
                },
                {
                    id: 'NOCONTACTNAMED',
                    type: 'ADDITIONAL',
                    text: 'Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.',
                    user_input: 'noContactOffenders',
                    group: 'PEOPLE',
                    subgroup: 'PERSONORGROUP',
                    active: 1

                },

                // People, contact and relationships
                // Children
                {
                    id: 'NORESIDE',
                    type: 'ADDITIONAL',
                    text: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
                    user_input: 'notToReside',
                    group: 'PEOPLE',
                    subgroup: 'CHILDREN',
                    active: 1
                },
                {
                    id: 'NOUNSUPERVISEDCONTACT',
                    type: 'ADDITIONAL',
                    text: 'Not to have unsupervised contact with  [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.',
                    user_input: 'noUnsupervisedContact',
                    group: 'PEOPLE',
                    subgroup: 'CHILDREN',
                    active: 1
                },
                {
                    id: 'NOCHILDRENSAREA',
                    type: 'ADDITIONAL',
                    text: 'Not to enter or remain in sight of any [CHILDREN’S PLAY AREA, SWIMMING BATHS, SCHOOL ETC] without the prior approval of your supervising officer.',
                    user_input: 'notInSightOf',
                    group: 'PEOPLE',
                    subgroup: 'CHILDREN',
                    active: 1
                },
                {
                    id: 'NOWORKWITHAGE',
                    type: 'ADDITIONAL',
                    text: 'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.',
                    user_input: 'noWorkWithAge',
                    group: 'PEOPLE',
                    subgroup: 'CHILDREN',
                    active: 1
                },
                {
                    id: 'NOTIFYRELATIONSHIP',
                    type: 'ADDITIONAL',
                    text: 'Notify your supervising officer of any developing personal relationships, whether intimate or not, with any person you know or believe to be resident in a household containing children under the age of 18. This includes persons known to you prior to your time in custody with whom you are renewing or developing a personal relationship with.',
                    group: 'PEOPLE',
                    subgroup: 'CHILDREN',
                    active: 1
                },

                // People, contact and relationships
                // Victims
                {
                    id: 'NOCOMMUNICATEVICTIM',
                    type: 'ADDITIONAL',
                    text: 'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
                    user_input: 'victimDetails',
                    group: 'PEOPLE',
                    subgroup: 'VICTIMS',
                    active: 1
                },

                // Drugs health and behaviour
                {
                    id: 'COMPLYREQUIREMENTS',
                    type: 'ADDITIONAL',
                    text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol / drug / sexual / violent / gambling / solvent abuse / anger / debt / prolific / offending behaviour problems at the [NAME OF COURSE / CENTRE].',
                    user_input: 'courseOrCentre',
                    group: 'DRUGS',
                    active: 1
                },
                {
                    id: 'ATTENDALL',
                    type: 'ADDITIONAL',
                    text: 'Attend all appointments arranged for you with [INSERT NAME], a psychiatrist / psychologist / medical practitioner and co-operate fully with any care or treatment they recommend.',
                    user_input: 'appointmentName',
                    group: 'DRUGS',
                    active: 1
                },
                {
                    id: 'HOMEVISITS',
                    type: 'ADDITIONAL',
                    text: 'Receive home visits from [INSERT NAME] Mental Health Worker.',
                    user_input: 'mentalHealthName',
                    group: 'DRUGS',
                    active: 1
                },

                // Curfew and reporting
                {
                    id: 'REMAINADDRESS',
                    type: 'ADDITIONAL',
                    text: 'Confine yourself to remain at [CURFEW ADDRESS] initially from [START OF CURFEW HOURS] until [END OF CURFEW HOURS] each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored [WHETHER BY ELECTRONIC MEANS INVOLVING YOUR WEARING AN ELECTRONIC TAG OR OTHERWISE].',
                    user_input: 'curfewDetails',
                    group: 'CURFEW',
                    active: 1
                },
                {
                    id: 'CONFINEADDRESS',
                    type: 'ADDITIONAL',
                    text: 'Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
                    user_input: 'confinedDetails',
                    group: 'CURFEW',
                    active: 1
                },
                {
                    id: 'REPORTTO',
                    type: 'ADDITIONAL',
                    text: 'Report to staff at [NAME OF APPROVED PREMISES / POLICE STATION] at [TIME / DAILY], unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
                    user_input: 'reportingDetails',
                    group: 'CURFEW',
                    active: 1
                },

                // Travel
                {
                    id: 'RETURNTOUK',
                    type: 'ADDITIONAL',
                    text: 'Should you return to the UK and Islands before the expiry date of your licence then your licence conditions will be in force and you must report within two working days to  our supervising officer.',
                    group: 'TRAVEL',
                    active: 1
                },

                // Travel
                // Passports
                {
                    id: 'NOTIFYPASSPORT',
                    type: 'ADDITIONAL',
                    text: 'To notify your supervising officer of the details of any passport that you possess (including passport number), and of any intention to apply for a new passport.',
                    group: 'TRAVEL',
                    subgroup: 'PASSPORTS',
                    active: 1
                },
                {
                    id: 'SURRENDERPASSPORT',
                    type: 'ADDITIONAL',
                    text: 'To surrender your passport(s) to your supervising officer and to notify your supervising officer of any intention to apply for a new passport.',
                    group: 'TRAVEL',
                    subgroup: 'PASSPORTS',
                    active: 1
                },

                // Travel
                // Vehicle
                {
                    id: 'VEHICLEDETAILS',
                    type: 'ADDITIONAL',
                    text: 'Provide your supervising officer with details [SUCH AS MAKE, MODEL, COLOUR, REGISTRATION] of any vehicle you own, hire for more than a short journey or have regular use of, prior to any journey taking place.',
                    user_input: 'vehicleDetails',
                    group: 'TRAVEL',
                    subgroup: 'VEHICLES',
                    active: 1
                },

                // Exclusion
                {
                    id: 'EXCLUSIONADDRESS',
                    type: 'ADDITIONAL',
                    text: 'Not to enter [NAME/TYPE OF PREMISES / ADDRESS / ROAD] without the prior approval of your supervising officer.',
                    user_input: 'noEnterPlace',
                    group: 'EXCLUSION',
                    active: 1
                },
                {
                    id: 'EXCLUSIONAREA',
                    type: 'ADDITIONAL',
                    text: 'Not to enter the area of [CLEARLY SPECIFIED AREA], as defined by the attached map without the prior approval of your supervising officer.',
                    user_input: 'exclusionArea',
                    group: 'EXCLUSION',
                    active: 1
                },

                // Technology
                // Mobile phones
                {
                    id: 'ONEPHONE',
                    type: 'ADDITIONAL',
                    text: 'Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone, including the IMEI number and the SIM card that you possess.',
                    group: 'TECHNOLOGY',
                    subgroup: 'PHONES',
                    active: 1
                },

                // Technology
                // Computers and internet
                {
                    id: 'NOINTERNET',
                    type: 'ADDITIONAL',
                    text: 'Not to use or access any computer or device which is internet enabled without the prior approval of your supervising officer; and only for the purpose, and only at a public location, as specified by that officer.',
                    group: 'TECHNOLOGY',
                    subgroup: 'COMPUTERS',
                    active: 1
                },
                {
                    id: 'USAGEHISTORY',
                    type: 'ADDITIONAL',
                    text: 'Not to delete the usage history on any internet enabled device or computer used and to allow such items to be inspected as required by the police or your supervising officer. Such inspection may include removal of the device for inspection and the installation of monitoring software.',
                    group: 'TECHNOLOGY',
                    subgroup: 'COMPUTERS',
                    active: 1
                },

                // Technology
                // Camera and photos
                {
                    id: 'NOCAMERA',
                    type: 'ADDITIONAL',
                    text: 'To make any device capable of making or storing digital images (including a camera and a mobile phone with a camera function) available for inspection on request by your supervising officer and/or a police officer.',
                    group: 'TECHNOLOGY',
                    subgroup: 'CAMERAS',
                    active: 1
                },
                {
                    id: 'NOCAMERAPHONE',
                    type: 'ADDITIONAL',
                    text: 'Not to own or possess a mobile phone with a photographic function without the prior approval of your supervising officer.',
                    group: 'TECHNOLOGY',
                    subgroup: 'CAMERAS',
                    active: 1
                },
                {
                    id: 'CAMERAAPPROVAL',
                    type: 'ADDITIONAL',
                    text: 'Not to own or use a camera without the prior approval of your supervising officer.',
                    group: 'TECHNOLOGY',
                    subgroup: 'CAMERAS',
                    active: 1
                },

                // PSS
                {
                    id: 'ATTENDSAMPLE',
                    type: 'ADDITIONAL',
                    text: 'Attend [INSERT APPOINTMENT NAME AND ADDRESS], as reasonably required by your supervisor, to give a sample of oral fluid/urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of supervision period requiring you to be of good behaviour.',
                    user_input: 'attendSampleDetails',
                    group: 'PSS',
                    active: 1
                },
                {
                    id: 'ATTENDDEPENDENCY',
                    type: 'ADDITIONAL',
                    text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
                    user_input: 'appointmentDetails',
                    group: 'PSS',
                    active: 1
                },
            ])
        );
