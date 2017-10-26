const path = require('path');
// const seedFile = require('knex-seed-file');

// exports.seed = knex =>
//     knex('CONDITIONS').delete()
//         .then(
//             () => seedFile(knex, path.resolve('./seeds/data/conditions.csv'), 'CONDITIONS', [
//                 'TYPE',
//                 'TEXT'
//             ], {
//                 columnSeparator: ';',
//                 ignoreFirstLine: true
//             }));


exports.seed = knex =>
    knex('CONDITIONS').delete()
        .then(
            () => knex('CONDITIONS').insert([
                {
                    TYPE: "STANDARD",
                    TEXT: "Be of good behaviour and not behave in a way which undermines the purpose of the licence period"
                },
                {
                    TYPE: "STANDARD",
                    TEXT: "Not commit any offence"
                },
                {
                    TYPE: "STANDARD",
                    TEXT: "Keep in touch with the supervising officer in accordance with instructions given by the supervising officer"
                },
                {
                    TYPE: "STANDARD",
                    TEXT: "Receive visits from the supervising officer in accordance with instructions given by the supervising officer"
                },
                {
                    TYPE: "STANDARD",
                    TEXT: "Reside permanently at an address approved by the supervising officer and obtain the prior permission of the supervising officer for any stay of one or more nights at a different address"
                },
                {
                    TYPE: "STANDARD",
                    TEXT: "Not undertake work, or a particular type of work, unless it is approved by the supervising officer and notify the supervising officer in advance of any proposal to undertake work or a particular type of work"
                },
                {
                    TYPE: "STANDARD",
                    TEXT: "Not travel outside the United Kingdom, the Channel Islands or the Isle of Man except with the prior permission of your supervising officer or for the purposes of immigration deportation or removal"
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Attend all appointments arranged for you with [INSERT NAME], a psychiatrist / psychologist / medical practitioner"
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Receive home visits from [INSERT NAME] Mental Health Worker"
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug"
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Report within two working days to your supervising officer if you return to the UK and Islands before the expiry date of your licence, as your licence conditions will be in force"
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT]."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to have unsupervised contact with  [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to contact directly or indirectly any person who is a serving or remand prisoner or detained in State custody, without the prior approval of your supervising officer"
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to associate with any person currently or formerly associated with [NAME OR DESCRIBE SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol / sexual / violent / gambling / solvent abuse / anger / debt / prolific / offending behaviour problems at the [NAME OF COURSE / CENTRE]."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer"
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone, including the IMEI number and the SIM card that you possess."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to own or possess a mobile phone with a photographic function without the prior approval of your supervising officer."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to own or use a camera without the prior approval of your supervising officer."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "To make any device capable of making or storing digital images (including a camera and a mobile phone with a camera function) available for inspection on request by your supervising officer and/or a police officer."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "To surrender your passport(s) to your supervising officer and to notify your supervising officer of any intention to apply for a new passport."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to use or access any computer or device which is internet enabled without the prior approval of your supervising officer; and only for the purpose, and only at a public location, as specified by that officer."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to delete the usage history on any internet enabled device or computer used and to allow such items to be inspected as required by the police or your supervising officer. Such inspection may include removal of the device for inspection and the installation of monitoring software."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to own or possess any [SPECIFIC ITEMS] without the prior permission of your supervising officer."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to have in your possession cash (in any currency) in excess of [QUANTITY HERE] without the prior permission of your supervising officer."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Provide your supervising officer with details [SUCH AS MAKE, MODEL, COLOUR, REGISTRATION] of any vehicle you own, hire for more than a short journey or have regular use of, prior to any journey taking place."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Notify your supervising officer of any developing intimate relationships with [WOMEN / MEN / WOMEN OR MEN]."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Notify your supervising officer of any developing personal relationships, whether intimate or not, with any person you know or believe to be resident in a household containing children under the age of 18. This includes persons known to you prior to your time in custody with whom you are renewing or developing a personal relationship with."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "To notify your supervising officer of the details of any passport that you possess (including passport number), and of any intention to apply for a new passport."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Provide your supervising officer with the details of any bank accounts (or similar) to which you are a signatory and of any credit cards you possess. You must also notify your supervising officer when becoming a signatory to any new bank account or credit card, and provide the account/card details.  This condition will be reviewed on a monthly basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Provide your supervising officer with the details of any bank account (or similar) held by a third party which you have access to, or have control of."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Provide your supervising officer with the details of the full postal addresses of all premises and storage facilities, including business premises, to which you have a right of access."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Provide your supervising officer with the details of any money transfers to or from the UK which you initiate or receive, as specified by your supervising officer."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Provide your supervising officer with the details of all email, social media and other communication accounts, to which you have access."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Confine yourself to remain at [CURFEW ADDRESS] initially from [START OF CURFEW HOURS] until [END OF CURFEW HOURS] each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored [WHETHER BY ELECTRONIC MEANS INVOLVING YOUR WEARING AN ELECTRONIC TAG OR OTHERWISE]."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to enter the area of [CLEARLY SPECIFIED AREA], as defined by the attached map without the prior approval of your supervising officer."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to enter [NAME/TYPE OF PREMISES / ADDRESS / ROAD] without the prior approval of your supervising officer."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to enter or remain in sight of any [CHILDREN’S PLAY AREA, SWIMMING BATHS, SCHOOL ETC] without the prior approval of your supervising officer."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "On release to be escorted by police to Approved Premises"
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Report to staff at [NAME OF APPROVED PREMISES / POLICE STATION] at [TIME / DAILY], unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately."
                },
                {
                    TYPE: "ADDITIONAL",
                    TEXT: "Not to consume alcohol [in volumes that exceed a specified limit] without the prior approval of the supervising officer."
                }

            ])
        );
