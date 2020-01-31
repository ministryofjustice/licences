/* eslint-disable max-len */
const { unsupervisedContactInput, victimContactInput } = require('../utils/bespokeAdditionalConditionMethods')

module.exports = {
  standardConditions: [
    {
      text: 'Be of good behaviour and not behave in a way which undermines the purpose of the licence period.',
    },
    {
      text: 'Not commit any offence.',
    },
    {
      text:
        'Keep in touch with the supervising officer in accordance with instructions given by the supervising officer.',
    },
    {
      text:
        'Receive visits from the supervising officer in accordance with instructions given by the supervising officer.',
    },
    {
      text:
        'Reside permanently at an address approved by the supervising officer and obtain the prior permission of the supervising officer for any stay of one or more nights at a different address.',
    },
    {
      text:
        'Not undertake work, or a particular type of work, unless it is approved by the supervising officer and notify the supervising officer in advance of any proposal to undertake work or a particular type of work.',
    },
    {
      text:
        'Not travel outside the United Kingdom, the Channel Islands or the Isle of Man except with the prior permission of your supervising officer or for the purposes of immigration deportation or removal.',
    },
  ],

  getAdditionalConditionsConfig: use2019Conditions =>
    [
      {
        id: 'NOCONTACTPRISONER',
        text:
          'Not to contact directly or indirectly any person who is a serving or remand offender or detained in State custody, without the prior approval of your supervising officer.',
        user_input: null,
        active: !use2019Conditions,
        field_position: null,
        group_name: 'People, contact and relationships',
        subgroup_name: 'Person or group',
      },
      {
        id: 'NOCONTACTASSOCIATE',
        text:
          'Not to associate with any person currently or formerly associated with [NAME OR DESCRIBE SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer.',
        user_input: 'groupsOrOrganisations',
        active: !use2019Conditions,
        field_position: {
          groupsOrOrganisation: 0,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Person or group',
      },
      {
        id: 'NOCONTACTSEXOFFENDER',
        text:
          'Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer.',
        user_input: null,
        active: !use2019Conditions,
        field_position: null,
        group_name: 'People, contact and relationships',
        subgroup_name: 'Person or group',
      },
      {
        id: 'INTIMATERELATIONSHIP',
        text:
          'Notify your supervising officer of any developing intimate relationships with [WOMEN / MEN / WOMEN OR MEN].',
        user_input: 'intimateGender',
        active: !use2019Conditions,
        field_position: {
          intimateGender: 0,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Person or group',
      },
      {
        id: 'NOCONTACTNAMED',
        text:
          'Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.',
        user_input: 'noContactOffenders',
        active: !use2019Conditions,
        field_position: {
          noContactOffenders: 0,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Person or group',
      },
      {
        id: 'NORESIDE',
        text:
          'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
        user_input: 'notToReside',
        active: !use2019Conditions,
        field_position: {
          notResideWithAge: 1,
          notResideWithGender: 0,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Children',
      },
      {
        id: 'NOUNSUPERVISEDCONTACT',
        text:
          'Not to have unsupervised contact with  [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.',
        user_input: 'noUnsupervisedContact',
        active: !use2019Conditions,
        field_position: {
          unsupervisedContactAge: 1,
          unsupervisedContactGender: 0,
          unsupervisedContactSocial: 2,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Children',
      },
      {
        id: 'NOCHILDRENSAREA',
        text:
          'Not to enter or remain in sight of any [CHILDREN’S PLAY AREA, SWIMMING BATHS, SCHOOL ETC] without the prior approval of your supervising officer.',
        user_input: 'notInSightOf',
        active: !use2019Conditions,
        field_position: {
          notInSightOf: 0,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Children',
      },
      {
        id: 'NOWORKWITHAGE',
        text:
          'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.',
        user_input: 'noWorkWithAge',
        active: !use2019Conditions,
        field_position: {
          noWorkWithAge: '0',
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Children',
      },
      {
        id: 'NOTIFYRELATIONSHIP',
        text:
          'Notify your supervising officer of any developing personal relationships, whether intimate or not, with any person you know or believe to be resident in a household containing children under the age of 18. This includes persons known to you prior to your time in custody with whom you are renewing or developing a personal relationship with.',
        user_input: null,
        active: !use2019Conditions,
        field_position: null,
        group_name: 'People, contact and relationships',
        subgroup_name: 'Children',
      },
      {
        id: 'NOCOMMUNICATEVICTIM',
        text:
          'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
        user_input: 'victimDetails',
        active: !use2019Conditions,
        field_position: {
          socialServicesDept: 1,
          victimFamilyMembers: 0,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Victims',
      },
      {
        id: 'ATTENDDEPENDENCYINDRUGSSECTION',
        text:
          'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        user_input: 'appointmentDetailsInDrugsSection',
        active: !use2019Conditions,
        field_position: {
          appointmentDateInDrugsSection: 0,
          appointmentTimeInDrugsSection: 1,
          appointmentAddressInDrugsSection: 2,
        },
        group_name: 'Drugs, health and behaviour',
        subgroup_name: null,
      },
      {
        id: 'COMPLYREQUIREMENTS',
        text:
          'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your [alcohol abuse / sexual behaviour / violent behaviour / gambling / solvent abuse / anger / debt / prolific behaviour/ offending behaviour] problems at the [NAME OF COURSE / CENTRE].',
        user_input: 'courseOrCentre',
        active: !use2019Conditions,
        field_position: {
          abuseAndBehaviours: '0',
          courseOrCentre: '1',
        },
        group_name: 'Drugs, health and behaviour',
        subgroup_name: null,
      },
      {
        id: 'ATTENDALL',
        text:
          'Attend all appointments arranged for you with [INSERT NAME], a [PSYCHIATRIST / PSYCHOLOGIST / MEDICAL PRACTITIONER] and co-operate fully with any care or treatment they recommend.',
        user_input: 'appointmentName',
        active: !use2019Conditions,
        field_position: {
          appointmentName: '0',
          appointmentProfession: '1',
        },
        group_name: 'Drugs, health and behaviour',
        subgroup_name: null,
      },
      {
        id: 'HOMEVISITS',
        text: 'Receive home visits from [INSERT NAME] Mental Health Worker.',
        user_input: 'mentalHealthName',
        active: !use2019Conditions,
        field_position: {
          mentalHealthName: '0',
        },
        group_name: 'Drugs, health and behaviour',
        subgroup_name: null,
      },
      {
        id: 'REMAINADDRESS',
        text:
          'Confine yourself to remain at [CURFEW ADDRESS] initially from [START OF CURFEW HOURS] until [END OF CURFEW HOURS] each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored [WHETHER BY ELECTRONIC MEANS INVOLVING YOUR WEARING AN ELECTRONIC TAG OR OTHERWISE].',
        user_input: 'curfewDetails',
        active: !use2019Conditions,
        field_position: {
          curfewTo: '2',
          curfewFrom: '1',
          curfewAddress: '0',
          curfewTagRequired: '3',
        },
        group_name: 'Curfew and reporting',
        subgroup_name: null,
      },
      {
        id: 'CONFINEADDRESS',
        text:
          'Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
        user_input: 'confinedDetails',
        active: !use2019Conditions,
        field_position: {
          confinedTo: '0',
          confinedFrom: '1',
          confinedReviewFrequency: '2',
        },
        group_name: 'Curfew and reporting',
        subgroup_name: null,
      },
      {
        id: 'REPORTTO',
        text:
          'Report to staff at [NAME OF APPROVED PREMISES / POLICE STATION] at [TIME / DAILY], unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        user_input: 'reportingDetails',
        active: !use2019Conditions,
        field_position: {
          reportingTime: '1',
          reportingDaily: '2',
          reportingAddress: '0',
          reportingFrequency: '3',
        },
        group_name: 'Curfew and reporting',
        subgroup_name: null,
      },
      {
        id: 'RETURNTOUK',
        text:
          'Should you return to the UK and Islands before the expiry date of your licence then your licence conditions will be in force and you must report within two working days to  our supervising officer.',
        user_input: null,
        active: !use2019Conditions,
        field_position: null,
        group_name: 'Travel',
        subgroup_name: null,
      },
      {
        id: 'NOTIFYPASSPORT',
        text:
          'To notify your supervising officer of the details of any passport that you possess (including passport number), and of any intention to apply for a new passport.',
        user_input: null,
        active: !use2019Conditions,
        field_position: null,
        group_name: 'Travel',
        subgroup_name: 'Passports',
      },
      {
        id: 'SURRENDERPASSPORT',
        text:
          'To surrender your passport(s) to your supervising officer and to notify your supervising officer of any intention to apply for a new passport.',
        user_input: null,
        active: !use2019Conditions,
        field_position: null,
        group_name: 'Travel',
        subgroup_name: 'Passports',
      },
      {
        id: 'VEHICLEDETAILS',
        text:
          'Provide your supervising officer with details [SUCH AS MAKE, MODEL, COLOUR, REGISTRATION] of any vehicle you own, hire for more than a short journey or have regular use of, prior to any journey taking place.',
        user_input: 'vehicleDetails',
        active: !use2019Conditions,
        field_position: {
          vehicleDetails: 0,
        },
        group_name: 'Travel',
        subgroup_name: 'Vehicles',
      },
      {
        id: 'EXCLUSIONADDRESS',
        text:
          'Not to enter [NAME/TYPE OF PREMISES / ADDRESS / ROAD] without the prior approval of your supervising officer.',
        user_input: 'noEnterPlace',
        active: !use2019Conditions,
        field_position: {
          noEnterPlace: '0',
        },
        group_name: 'Exclusion',
        subgroup_name: null,
      },
      {
        id: 'EXCLUSIONAREA',
        text:
          'Not to enter the area of [CLEARLY SPECIFIED AREA], as defined by the attached map without the prior approval of your supervising officer.',
        user_input: 'exclusionArea',
        active: !use2019Conditions,
        field_position: {
          exclusionArea: '0',
        },
        group_name: 'Exclusion',
        subgroup_name: null,
      },
      {
        id: 'ONEPHONE',
        text:
          'Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone, including the IMEI number and the SIM card that you possess.',
        user_input: null,
        active: !use2019Conditions,
        field_position: null,
        group_name: 'Technology',
        subgroup_name: 'Mobile phones',
      },
      {
        id: 'NOINTERNET',
        text:
          'Not to use or access any computer or device which is internet enabled without the prior approval of your supervising officer; and only for the purpose, and only at a public location, as specified by that officer.',
        user_input: null,
        active: !use2019Conditions,
        field_position: null,
        group_name: 'Technology',
        subgroup_name: 'Computers and internet',
      },
      {
        id: 'USAGEHISTORY',
        text:
          'Not to delete the usage history on any internet enabled device or computer used and to allow such items to be inspected as required by the police or your supervising officer. Such inspection may include removal of the device for inspection and the installation of monitoring software.',
        user_input: null,
        active: !use2019Conditions,
        field_position: null,
        group_name: 'Technology',
        subgroup_name: 'Computers and internet',
      },
      {
        id: 'NOCAMERA',
        text:
          'To make any device capable of making or storing digital images (including a camera and a mobile phone with a camera function) available for inspection on request by your supervising officer and/or a police officer.',
        user_input: null,
        active: !use2019Conditions,
        field_position: null,
        group_name: 'Technology',
        subgroup_name: 'Cameras and photos',
      },
      {
        id: 'CAMERAAPPROVAL',
        text: 'Not to own or use a camera without the prior approval of your supervising officer.',
        user_input: null,
        active: !use2019Conditions,
        field_position: null,
        group_name: 'Technology',
        subgroup_name: 'Cameras and photos',
      },
      {
        id: 'NOCAMERAPHONE',
        text:
          'Not to own or possess a mobile phone with a photographic function without the prior approval of your supervising officer.',
        user_input: null,
        active: !use2019Conditions,
        field_position: null,
        group_name: 'Technology',
        subgroup_name: 'Cameras and photos',
      },
      {
        id: 'POLYGRAPH',
        text:
          'To comply with any instruction given by your supervising officer requiring you to attend polygraph testing. To participate in polygraph sessions and examinations as instructed by or under the authority of your supervising officer and to comply with any instruction given to you during a polygraph session by the person conducting the polygraph.',
        user_input: null,
        active: !use2019Conditions,
        field_position: null,
        group_name: 'Restricted additional conditions',
        subgroup_name: null,
      },
      {
        id: 'DRUG_TESTING',
        text:
          'Attend [INSERT NAME AND ADDRESS], as reasonably required by your supervising officer, to give a sample of oral fluid / urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the condition of your licence requiring you to be of good behaviour. Not to take any action that could hamper or frustrate the drug testing process.',
        user_input: 'drug_testing',
        active: !use2019Conditions,
        field_position: {
          drug_testing_name: 0,
          drug_testing_address: 1,
        },
        group_name: 'Restricted additional conditions',
        subgroup_name: null,
      },
      {
        id: 'ATTENDSAMPLE',
        text:
          'Attend [INSERT APPOINTMENT NAME AND ADDRESS], as reasonably required by your supervisor, to give a sample of oral fluid/urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of supervision period requiring you to be of good behaviour.',
        user_input: 'attendSampleDetails',
        active: !use2019Conditions,
        field_position: {
          attendSampleDetailsName: 0,
          attendSampleDetailsAddress: 1,
        },
        group_name: 'Post-sentence supervision only',
        subgroup_name: null,
      },
      {
        id: 'ATTENDDEPENDENCY',
        text:
          'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        user_input: 'appointmentDetails',
        active: !use2019Conditions,
        field_position: {
          appointmentDate: 0,
          appointmentTime: 1,
          appointmentAddress: 2,
        },
        group_name: 'Post-sentence supervision only',
        subgroup_name: null,
      },
      {
        id: 'DO_NOT_CONTACT_PRISONERS',
        text:
          'Do not contact anyone in prison or custody unless it’s approved by your probation officer first. This includes:<ul class="disc"><li>contact through social media</li><li>asking someone else to contact them for you</li><li>leaving a message for them to find</li></ul>',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'People, contact and relationships',
        subgroup_name: 'Person or group',
      },
      {
        id: 'DO_NOT_MEET',
        text:
          'Do not have contact or meet with [anyone associated (now or in the past) with] [name / specific group or organisation] unless it’s approved by your probation officer.',
        user_input: 'do_not_meet',
        active: use2019Conditions,
        field_position: {
          do_not_meet_associated: 0,
          do_not_meet_name: 1,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Person or group',
      },
      {
        id: 'DO_NOT_CONTACT_SEX_OFFENDER',
        text:
          'Do not have any contact with a known sex offender unless it’s approved by your probation officer.<br /><br />This does not apply when you attend a treatment programme or in your approved address to people living there.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'People, contact and relationships',
        subgroup_name: 'Person or group',
      },
      {
        id: 'TELL_PROBATION_ABOUT_RELATIONSHIP',
        text:
          'Tell your probation officer about any:<ul class="disc midCondition"><li>personal relationships with [women / men / anyone]</li><li>personal relationships or friendships when the person lives with children under 18</li><li>changes to those relationships - for example pregnancy or the end of the relationship</li></ul>This includes people you knew before you were in prison.<br /><br />Your probation officer will explain what types of relationships you need to tell them about.',
        user_input: 'tell_probation_about_relationship',
        active: use2019Conditions,
        field_position: {
          tell_probation_about_relationship_gender: 0,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Person or group',
      },
      {
        id: 'DO_NOT_LIVE_OR_STAY',
        text:
          'Do not live or stay (even for one night) in the same place as [any child under / any female child under / any male child under / any vulnerable adult / any male vulnerable adult / any female vulnerable adult] unless it’s approved by your probation officer.',
        user_input: 'do_not_live_or_stay',
        active: use2019Conditions,
        field_position: {
          do_not_live: 0,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Children and vulnerable adults',
      },
      {
        id: 'NO_UNSUPERVISED_CONTACT',
        text:
          'Do not have unsupervised contact with [any child under / any female child under / any male child under / any vulnerable adult / any male vulnerable adult / any female vulnerable adult] unless it’s approved by your probation officer [and/or social services department name].<br /><br />(This does not apply where the contact is not on purpose and could not be reasonably avoided during daily life).',
        user_input: 'do_not_have_unsupervised_contact',
        active: use2019Conditions,
        field_position: {
          do_not_unsupervised_contact: 0,
          do_not_unsupervised_social_services_dept: 1,
          do_not_unsupervised_social_services_dept_name: 2,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Children and vulnerable adults',
        manipulateInput: unsupervisedContactInput,
      },
      {
        id: 'DO_NOT_STAY_IN_SIGHT_OF',
        text: 'Do not enter or stay in sight of any [type of location] unless it’s approved by your probation officer.',
        user_input: 'do_not_in_sight_of',
        active: use2019Conditions,
        field_position: {
          do_not_in_sight_of_type: 0,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Children and vulnerable adults',
      },
      {
        id: 'DO_NOT_TAKE_PART_IN_ACTIVITY',
        text:
          'Do not take part in any work or activity (paid or unpaid) which involves [any child under  / any female child under  / any male child under  / any vulnerable adult / any male vulnerable adult / any female vulnerable adult] unless it’s approved by your probation officer.',
        user_input: 'do_not_work_or_activity',
        active: use2019Conditions,
        field_position: {
          do_not_work_involve: 0,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Children and vulnerable adults',
      },
      {
        id: 'DO_NOT_CONTACT_VICTIM',
        text:
          'Do not approach or communicate with [name of victim and/or family members] unless it’s approved by your probation officer [and/or social services department].',
        user_input: 'do_not_contact_victim',
        active: use2019Conditions,
        field_position: {
          do_not_contact_victim_name: 0,
          do_not_contact_victim_social_services_dept: 1,
          do_not_contact_victim_social_services_dept_name: 2,
        },
        group_name: 'People, contact and relationships',
        subgroup_name: 'Victims',
        manipulateInput: victimContactInput,
      },
      {
        id: 'FOLLOW_REHABILITATION_INSTRUCTIONS',
        text:
          'Follow all instructions your probation officer gives you as part of your rehabilitation for [alcohol abuse / sexual behaviour / violent behaviour / gambling / solvent abuse / anger / debt / prolific behaviour / offending behaviour].',
        user_input: 'follow_rehabilitation_instructions',
        active: use2019Conditions,
        field_position: {
          follow_rehabilitation_instructions: 0,
        },
        group_name: 'Behaviour, health and drugs',
        subgroup_name: null,
      },
      {
        id: 'GIVE_URINE_SAMPLE',
        text:
          'Give a [ORAL FLUID/URINE] sample to test you for specific drugs at the place your probation officer tells you to.<br /><br />Do not do anything to affect the drug testing process.',
        user_input: 'give_sample',
        active: use2019Conditions,
        field_position: {
          give_sample: 0,
        },
        group_name: 'Behaviour, health and drugs',
        subgroup_name: null,
      },
      {
        id: 'GO_WHERE_PROBATION_OFFICER',
        text: 'Go where your probation officer tells you for help with your drug dependency or misuse.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Behaviour, health and drugs',
        subgroup_name: null,
      },
      {
        id: 'GO_TO_APPOINTMENTS',
        text:
          'Go to all appointments arranged with  [a mental health worker / a medical practitioner / a leaving care social worker / children’s services].',
        user_input: 'go_to_appointments',
        active: use2019Conditions,
        field_position: {
          go_to_appointments_with: 0,
        },
        group_name: 'Behaviour, health and drugs',
        subgroup_name: null,
      },
      {
        id: 'ALLOW_VISIT',
        text:
          'Allow [a mental health worker / a medical practitioner / a leaving care social worker / children’s services] to visit you at your home.',
        user_input: 'allow_visit',
        active: use2019Conditions,
        field_position: {
          allow_visit_with: 0,
        },
        group_name: 'Behaviour, health and drugs',
        subgroup_name: null,
      },
      {
        id: 'STAY_AT_ADDRESS',
        text:
          'Stay at [address] between [time] and [time] every day unless your probation officer tells you not to.<br /><br />Follow instructions your probation officer gives you so they know where you are.<br /><br />Your probation officer will review this condition every [week / month] and decide if it’s safe to change or remove it.',
        user_input: 'stay_at_address',
        active: use2019Conditions,
        field_position: {
          stay_at_address_name: 0,
          stay_at_address_from: 1,
          stay_at_address_to: 2,
          stay_at_address_frequency: 3,
        },
        group_name: 'Curfew, reporting and escorts',
        subgroup_name: null,
      },
      // TODO clare to look at this one
      {
        id: 'REPORT_TO_STAFF_AT',
        text:
          'Report to staff at [location] at [time and day] unless your probation officer tells you not to.<br /><br />Your probation officer will review this condition every [week / month] and decide if it’s safe to change or remove it.',
        user_input: 'report_to_staff_at',
        active: use2019Conditions,
        field_position: {
          report_to_staff_at_location: 0,
          report_to_staff_at_time_and_day: 1,
        },
        group_name: 'Curfew, reporting and escorts',
        subgroup_name: null,
      },
      {
        id: 'REPORT_WITHIN_2_DAYS',
        text:
          'Report to your probation officer within 2 working days if you return to the UK and islands before the end of your licence period. Your licence conditions will still apply.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Curfew, reporting and escorts',
        subgroup_name: null,
      },
      {
        id: 'POLICE_TAKE_TO',
        text: 'The police will take you to [approved address] on the day you’re released.',
        user_input: 'police_take_to',
        active: use2019Conditions,
        field_position: {
          police_take_to_address: 0,
        },
        group_name: 'Curfew, reporting and escorts',
        subgroup_name: null,
      },
      {
        id: 'TELL_PROBATION_DOCUMENT',
        text:
          'Tell your probation officer:<ul class="disc"><li>full details of any [passport / driving licence / birth certificate] you own</li><li>if you apply for a new [passport / driving licence / birth certificate]</li></ul>',
        user_input: 'tell_probation_document',
        active: use2019Conditions,
        field_position: {
          tell_probation_document_own: 0,
          tell_probation_document_apply: 1,
        },
        group_name: 'Travel and transportation',
        subgroup_name: 'Passports and identification',
      },
      {
        id: 'GIVE_PASSPORT_TO_PROBATION',
        text:
          'Give your passport(s) to your probation officer and tell them if you are planning to apply for a new passport.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Travel and transportation',
        subgroup_name: 'Passports and identification',
      },
      {
        id: 'TELL_PROBATION_VEHICLE_DETAILS',
        text:
          'Tell your probation officer details of any vehicle you own, use regularly, or hire before you travel in them. This does not apply to public transport or private hire taxis.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Travel and transportation',
        subgroup_name: 'Vehicles and transportation',
      },
      {
        id: 'DO_NOT_TRAVEL_IN',
        text:
          'Do not travel in or on any privately-owned vehicle that you own or owned by someone else unless it’s approved by your probation officer. This does not apply to public transport or private hire taxis.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Travel and transportation',
        subgroup_name: 'Vehicles and transportation',
      },
      {
        id: 'TELL_PROBATION_REUSABLE_CARD',
        text:
          'Tell your probation officer full details of any reusable card you own or use on public transport, for example an Oyster card.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Travel and transportation',
        subgroup_name: 'Vehicles and transportation',
      },
      {
        id: 'DO_NOT_GO_PREMISES',
        text: 'Do not go in [name / type of premises / address / road] unless it’s approved by your probation officer.',
        user_input: 'do_not_go_premises',
        active: use2019Conditions,
        field_position: {
          do_not_go_premises_address: 0,
        },
        group_name: 'Exclusion',
        subgroup_name: null,
      },
      {
        id: 'DO_NOT_GO_AREA',
        text:
          'Do not go in the specified area shown on the attached map unless it’s approved by your probation officer.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Exclusion',
        subgroup_name: null,
      },
      {
        id: 'ONLY_WORSHIP_APPROVED',
        text: 'Only go to places of worship approved by your probation officer.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Exclusion',
        subgroup_name: null,
      },
      {
        id: 'HAVE_ELECTRONIC_TAG',
        text:
          'You must:<ul class="disc"><li>allow an electronic tag to be installed on you</li><li>allow access to your property to install and check any tagging equipment</li><li>not damage or interfere with your electronic tag</li><li>make sure the tag is charged as instructed by your probation officer</li><li>report it immediately if the tag or equipment are not working - your probation officer will tell you who to contact</li><li>allow access to your property to remove the electronic tag and any tagging equipment</li></ul>',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Technology',
        subgroup_name: 'Electronic monitoring',
      },
      {
        id: 'STAY_AT_NIGHT',
        text: 'Stay at [approved address] between 5pm and midnight every day until your electronic tag is installed.',
        user_input: 'stay_at_night',
        active: use2019Conditions,
        field_position: {
          stay_at_night_address: 0,
        },
        group_name: 'Technology',
        subgroup_name: 'Electronic monitoring',
      },
      {
        id: 'YOU_WILL_BE_SUBJECT_TO',
        text:
          'You will be subject to trail monitoring. Your electronic tag will monitor you everywhere you go. You must follow all instructions from your probation officer.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Technology',
        subgroup_name: 'Electronic monitoring',
      },
      {
        id: 'GO_FOR_POLYGRAPH',
        text:
          'Go for polygraph testing when your probation officer tells you to.<br /><br />Follow all instructions given by the person carrying out the polygraph testing.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Technology',
        subgroup_name: 'Polygraph',
      },
      {
        id: 'DO_NOT_HAVE_MORE_THAN_ONE_PHONE',
        text:
          'Do not have more than one mobile phone or SIM card unless it’s approved by your probation officer.<br /><br />Provide your probation officer with details of your mobile phone and SIM card.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Technology',
        subgroup_name: 'Mobile phones',
      },
      {
        id: 'ONLY_USE_INTERNET_AT',
        text: 'Only use a computer or device with internet at [location] or where your probation officer tells you.',
        user_input: 'only_use_internet_at',
        active: use2019Conditions,
        field_position: {
          only_use_internet_at_location: 0,
        },
        group_name: 'Technology',
        subgroup_name: 'Computers and internet',
      },
      {
        id: 'DO_NOT_DELETE_HISTORY',
        text:
          'Do not:<ul class="disc midCondition"><li>delete the user history on your mobile phone or device with internet</li><li>use any software or settings that stop your internet use being recorded</li></ul>Do allow the police or your probation officer to inspect your mobile phone or device with internet. They may:<ul class="disc"><li>take your device to inspect it</li><li>install monitoring software</li><li>search where you live or your vehicle(s) for devices you have not told them about</li></ul>',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Technology',
        subgroup_name: 'Computers and internet',
      },
      {
        id: 'GET_PERMISSION_FOR_SOFTWARE',
        text:
          'Get permission from your probation officer to buy, download, or use any software that:<ul class="disc"><li>encrypts information</li><li>deletes information</li><li>cleans your files or drives</li></ul>',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Technology',
        subgroup_name: 'Computers and internet',
      },
      {
        id: 'DO_NOT_ACCESS_DOWNLOAD',
        text:
          'Do not [access / download / access or download] [specified websites or apps / types of websites or apps] unless it’s approved by your probation officer.',
        user_input: 'do_not_access_download',
        active: use2019Conditions,
        field_position: {
          do_not_access_download_type: 0,
          do_not_access_download_target: 1,
        },
        group_name: 'Technology',
        subgroup_name: 'Computers and internet',
      },
      {
        id: 'PROVIDE_DETAILS_OF_CLOUD_STORAGE',
        text: 'Provide details of any cloud storage accounts you have access to, including usernames and passwords.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Technology',
        subgroup_name: 'Computers and internet',
      },
      {
        id: 'DO_NOT_OWN_ITEM',
        text: 'Do not own or use any [specific items] unless it’s approved by your probation officer.',
        user_input: 'do_not_own_item',
        active: use2019Conditions,
        field_position: {
          do_not_own_item: 0,
        },
        group_name: 'Possession, ownership and finances',
        subgroup_name: 'Possession and ownership',
      },
      {
        id: 'TELL_ABOUT_ANIMAL',
        text: 'Tell your probation officer about any [type of animal] in your care.',
        user_input: 'tell_about_animal',
        active: use2019Conditions,
        field_position: {
          tell_about_animal: 0,
        },
        group_name: 'Possession, ownership and finances',
        subgroup_name: 'Possession and ownership',
      },
      {
        id: 'PROVIDE_ADDRESS_OF_PREMISES',
        text:
          'Provide your probation officer with the full addresses of all premises and storage facilities you have access to. This includes business premises.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Possession, ownership and finances',
        subgroup_name: 'Possession and ownership',
      },
      {
        id: 'DO_NOT_HAVE_MORE_MONEY',
        text:
          'Do not have more than [amount] of cash (in any currency) unless it’s approved by your probation officer.',
        user_input: 'do_not_have_more_money',
        active: use2019Conditions,
        field_position: {
          do_not_have_more_money_amount: 0,
        },
        group_name: 'Possession, ownership and finances',
        subgroup_name: 'Finances',
      },
      {
        id: 'PROVIDE_BANK_DETAILS',
        text:
          'Provide your probation officer with details of any bank accounts and credit cards you have access to.<br /><br />Tell your probation officer details about any new bank accounts or credit cards you get access to.<br /><br />Your probation officer will review this condition every month and decide if it’s safe to change or remove it.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Possession, ownership and finances',
        subgroup_name: 'Finances',
      },
      {
        id: 'PROVIDE_THIRD_PARTY_ACCOUNTS',
        text:
          'Provide your probation officer with details of any third party bank account (or similar) you have access to or control of.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Possession, ownership and finances',
        subgroup_name: 'Finances',
      },
      {
        id: 'PROVIDE_MONEY_TRANSFER_DETAILS',
        text:
          'Provide details to your probation officer of any money transfers to or from the UK which you send or receive.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Possession, ownership and finances',
        subgroup_name: 'Finances',
      },
      {
        id: 'DO_NOT_CONTACT_EXTREMISTS',
        text:
          'Do not contact anyone who you know has been arrested, charged, or convicted of any extremist-related offence unless it’s approved by your probation officer. This includes:<ul class="disc"><li>contact through social media</li><li>asking someone else to contact them for you</li><li>leaving a message for them to find</li></ul>',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Extremism',
        subgroup_name: null,
      },
      {
        id: 'DO_NOT_GO_TO_WORSHIP_MEETINGS',
        text:
          'Do not go to or organise any meetings or gatherings except for worship unless it’s approved by your probation officer.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Extremism',
        subgroup_name: null,
      },
      {
        id: 'DO_NOT_GIVE_SERMON',
        text:
          'Do not give any lecture, talk, or sermon (including acts of worship) unless it’s approved by your probation officer.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Extremism',
        subgroup_name: null,
      },
      {
        id: 'DO_NOT_PROMOTE_EXTREMISM',
        text:
          'Do not discuss or promote the grooming or influencing of an individual or group for extremism or radicalisation.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Extremism',
        subgroup_name: null,
      },
      {
        id: 'DO_NOT_DEMONSTRATE',
        text:
          'Do not organise or contribute to any demonstration, meeting, gathering or website unless it’s approved by your probation officer.<br /><br />Your probation officer will review this condition every month and decide if it’s safe to change or remove it.',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Extremism',
        subgroup_name: null,
      },
      {
        id: 'DO_NOT_HAVE_ENCODED_INFORMATION',
        text:
          'Do not have any handwritten, printed or electronically-recorded material (unless it’s approved by your probation officer) which:<ul class="disc"><li>contains encoded information</li><li>promotes the destruction of hatred for any religious or ethnic group</li><li>celebrates, justifies or promotes acts of violence</li><li>contains information about military or paramilitary technology, weapons, techniques or tactics</li></ul>',
        user_input: null,
        active: use2019Conditions,
        field_position: null,
        group_name: 'Extremism',
        subgroup_name: null,
      },
    ].filter(condition => condition.active),

  multiFields: {
    appointmentDetails: {
      fields: ['appointmentAddress', 'appointmentDate', 'appointmentTime'],
      joining: [' on ', ' at '],
    },
    appointmentDetailsInDrugsSection: {
      fields: ['appointmentAddressInDrugsSection', 'appointmentDateInDrugsSection', 'appointmentTimeInDrugsSection'],
      joining: [' on ', ' at '],
    },
    attendSampleDetails: {
      fields: ['attendSampleDetailsName', 'attendSampleDetailsAddress'],
      joining: [', '],
    },
    drug_testing: {
      fields: ['drug_testing_name', 'drug_testing_address'],
      joining: [', '],
    },
  },
}
