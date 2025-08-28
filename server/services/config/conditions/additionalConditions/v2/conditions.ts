import moment from 'moment'
import { ConditionMetadata } from '../../../../../data/licenceClientTypes'
import { AdditionalConditions, AdditionalConditionsV2 } from '../../../../../data/licenceTypes'
import { isEmpty } from '../../../../../utils/functionalHelpers'

enum GroupName {
  RESIDENCE_AT_A_SPECIFIC_PLACE = 'Residence at a specific place',
  RESTRICTION_OF_RESIDENCY = 'Restriction of residency',
  MAKING_OR_MAINTAINING_CONTACT = 'Making or maintaining contact with a person',
  PARTICIPATION = 'Participation in, or co-operation with, a programme or set of activities',
  POSSESSION = 'Possession, ownership, control or inspection of specified items or documents.',
  DISCLOSURE_OF_INFO = ' Disclosure of information',
  CURFEW_ARRANGEMENT = 'Curfew arrangement',
  FREEDOM_OF_MOVEMENT = 'Freedom of movement',
  COMMUNITY_SUPERVISION = 'Supervision in the community by the supervising officer, or other responsible officer, or organisation',
  SPECIFIC_CONDUCT_OR_ACTS = 'Restriction of specified conduct or specified acts',
  EXTREMISM = 'Extremism',
  POLYGRAPH = 'Polygraph Condition',
  DRUG_TESTING = 'Drug Testing Conditions',
  ELECTRONIC_MONITORING = 'Electronic Monitoring Conditions',
  POST_SENTENCE_SUPERVISION_ONLY = 'Post-sentence supervision only',
}

export const modifyAdditionalConditions = (someConditions: AdditionalConditions) => {
  const conditions = someConditions as AdditionalConditionsV2

  const abuseAndBehavioursConditions = conditions?.COMPLY_REQUIREMENTS?.abuseAndBehaviours

  if (Array.isArray(abuseAndBehavioursConditions)) {
    Object.assign(
      abuseAndBehavioursConditions,
      abuseAndBehavioursConditions.map((condition, index) => (index > 0 ? ` ${condition}` : condition))
    )
  }

  const appointmentProfessions = conditions?.ATTEND_ALL?.appointmentProfessions

  if (Array.isArray(appointmentProfessions)) {
    Object.assign(
      appointmentProfessions,
      appointmentProfessions.map((condition, index) => (index > 0 ? ` ${condition}` : condition))
    )
  }

  if (!isEmpty(conditions?.REPORT_TO)) {
    const { reportingTime, reportingDaily, ...rest } = conditions?.REPORT_TO

    conditions.REPORT_TO = {
      reportingTime: reportingTime ? `at ${reportingTime}` : reportingDaily,
      reportingDaily: reportingDaily,
      ...rest,
    }
  }
}

export const pssConditions = ['ATTEND_SAMPLE', 'ATTEND_DEPENDENCY']

export const conditions: ConditionMetadata[] = [
  {
    id: 'RESIDE_AT_SPECIFIC_PLACE',
    text: 'You must reside within [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
    user_input: 'resideWithinRegion',
    field_position: { region: 0 },
    group_name: GroupName.RESIDENCE_AT_A_SPECIFIC_PLACE,
    subgroup_name: null,
  },
  {
    id: 'NO_RESIDE',
    text: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
    user_input: 'notToReside',
    field_position: {
      notResideWithAge: 1,
      notResideWithGender: 0,
    },
    group_name: GroupName.RESTRICTION_OF_RESIDENCY,
    subgroup_name: null,
  },
  {
    id: 'ATTEND_ALL',
    text: 'Attend all appointments arranged for you with a [PSYCHIATRIST / PSYCHOLOGIST / MEDICAL PRACTITIONER] and co-operate fully with any care or treatment they recommend.',
    user_input: 'attendAll',
    field_position: {
      appointmentProfessions: 0,
    },
    group_name: GroupName.MAKING_OR_MAINTAINING_CONTACT,
    subgroup_name: null,
    displayForEdit: (inputtedCondition) => {
      const result = inputtedCondition.appointmentProfessions
      const appointmentProfessions = typeof result === 'string' ? [result] : result
      return {
        ...inputtedCondition,
        appointmentProfessions,
      }
    },
  },
  {
    id: 'HOME_VISITS',
    text: 'Receive home visits from [INSERT NAME] Mental Health Worker.',
    user_input: 'mentalHealthName',
    field_position: {
      mentalHealthName: 0,
    },
    group_name: GroupName.MAKING_OR_MAINTAINING_CONTACT,
    subgroup_name: null,
  },
  {
    id: 'ATTEND_DEPENDENCY_IN_DRUGS_SECTION',
    text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
    user_input: 'appointmentDetailsInDrugsSection',
    field_position: {
      appointmentDateInDrugsSection: 0,
      appointmentTimeInDrugsSection: 1,
      appointmentAddressInDrugsSection: 2,
    },
    group_name: GroupName.MAKING_OR_MAINTAINING_CONTACT,
    subgroup_name: null,
    displayForEdit: (inputtedCondition) => {
      const appointmentDate = moment(inputtedCondition.appointmentDateInDrugsSection, 'DD/MM/YYYY')
      return {
        ...inputtedCondition,
        appointmentDayInDrugsSection: appointmentDate.format('DD'),
        appointmentMonthInDrugsSection: appointmentDate.format('MM'),
        appointmentYearInDrugsSection: appointmentDate.format('YYYY'),
      }
    },
  },
  {
    id: 'NO_COMMUNICATE_VICTIM',
    text: 'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
    user_input: 'victimDetails',
    field_position: {
      socialServicesDept: 1,
      victimFamilyMembers: 0,
    },
    group_name: GroupName.MAKING_OR_MAINTAINING_CONTACT,
    subgroup_name: null,
  },
  {
    id: 'RETURN_TO_UK',
    text: 'Should you return to the UK and Islands before the expiry date of your licence then your licence conditions will be in force and you must report within two working days to our supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.MAKING_OR_MAINTAINING_CONTACT,
    subgroup_name: null,
  },
  {
    id: 'NO_UNSUPERVISED_CONTACT',
    text: 'Not to have unsupervised contact with  [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.',
    user_input: 'noUnsupervisedContact',
    field_position: {
      unsupervisedContactAge: 1,
      unsupervisedContactGender: 0,
      unsupervisedContactSocial: 2,
    },
    group_name: GroupName.MAKING_OR_MAINTAINING_CONTACT,
    subgroup_name: null,
  },
  {
    id: 'NO_CONTACT_NAMED',
    text: 'Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.',
    user_input: 'noContactOffenders',
    field_position: {
      noContactOffenders: 0,
    },
    group_name: GroupName.MAKING_OR_MAINTAINING_CONTACT,
    subgroup_name: null,
  },
  {
    id: 'NO_CONTACT_SEX_OFFENDER',
    text: 'Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.MAKING_OR_MAINTAINING_CONTACT,
    subgroup_name: null,
  },
  {
    id: 'NO_CONTACT_PRISONER',
    text: 'Not to contact directly or indirectly any person who is a serving or remand prisoner or detained in State custody, without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.MAKING_OR_MAINTAINING_CONTACT,
    subgroup_name: null,
  },
  {
    id: 'NO_CONTACT_ASSOCIATE',
    text: 'Not to associate with any person currently or formerly associated with [NAME OR DESCRIBE SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer.',
    user_input: 'groupsOrOrganisations',
    field_position: {
      groupsOrOrganisation: 0,
    },
    group_name: GroupName.MAKING_OR_MAINTAINING_CONTACT,
    subgroup_name: null,
  },
  {
    id: 'COMPLY_REQUIREMENTS',
    text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your [alcohol / drug / sexual / violent / gambling / solvent abuse / anger / debt / prolific / offending behaviour] problems at the [NAME OF COURSE / CENTRE].',
    user_input: 'courseOrCentreV2',
    field_position: {
      abuseAndBehaviours: 0,
      courseOrCentre: 1,
    },
    group_name: GroupName.PARTICIPATION,
    subgroup_name: null,
    displayForEdit: (inputtedCondition) => {
      const result = inputtedCondition.abuseAndBehaviours
      const abuseAndBehaviours = typeof result === 'string' ? [result] : result
      return {
        ...inputtedCondition,
        abuseAndBehaviours,
      }
    },
  },
  {
    id: 'NO_WORK_WITH_AGE',
    text: 'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.',
    user_input: 'noWorkWithAge',
    field_position: {
      noWorkWithAge: 0,
    },
    group_name: GroupName.PARTICIPATION,
    subgroup_name: null,
  },
  {
    id: 'ONE_PHONE',
    text: 'Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone or one you have regular use of, including the IMEI number and the SIM card that you possess.',
    user_input: null,
    field_position: null,
    group_name: GroupName.POSSESSION,
    subgroup_name: null,
  },
  {
    id: 'NO_CAMERA_PHONE',
    text: 'Not to own or possess a mobile phone with a photographic function without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.POSSESSION,
    subgroup_name: null,
  },
  {
    id: 'CAMERA_APPROVAL',
    text: 'Not to own or use a camera without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.POSSESSION,
    subgroup_name: null,
  },
  {
    id: 'NO_CAMERA',
    text: 'To make any device capable of making or storing digital images (including a camera and a mobile phone with a camera function) available for inspection on request by your supervising officer and/or a police officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.POSSESSION,
    subgroup_name: null,
  },
  {
    id: 'SURRENDER_PASSPORT',
    text: 'To surrender your passport(s) to your supervising officer and to notify your supervising officer of any intention to apply for a new passport.',
    user_input: null,
    field_position: null,
    group_name: GroupName.POSSESSION,
    subgroup_name: null,
  },
  {
    id: 'NO_INTERNET',
    text: 'Not to use or access any computer or device which is internet enabled without the prior approval of your supervising officer; and only for the purpose, and only at a specific location, as specified by that officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.POSSESSION,
    subgroup_name: null,
  },
  {
    id: 'USAGE_HISTORY',
    text: 'Not to delete the usage history on any internet enabled device or computer used and to allow such items to be inspected as required by the police or your supervising officer. Such inspection may include removal of the device for inspection and the installation of monitoring software.',
    user_input: null,
    field_position: null,
    group_name: GroupName.POSSESSION,
    subgroup_name: null,
  },
  {
    id: 'SPECIFIC_ITEM',
    text: 'Not to own or possess a [SPECIFIED ITEM] without the prior approval of your supervising officer.',
    user_input: 'specificItem',
    field_position: {
      specificItem: 0,
    },
    group_name: GroupName.POSSESSION,
    subgroup_name: null,
  },
  {
    id: 'VEHICLE_DETAILS',
    text: 'Provide your supervising officer with details [SUCH AS MAKE, MODEL, COLOUR, REGISTRATION] of any vehicle you own, hire for more than a short journey or have regular use of, prior to any journey taking place.',
    user_input: 'vehicleDetails',
    field_position: {
      vehicleDetails: 0,
    },
    group_name: GroupName.DISCLOSURE_OF_INFO,
    subgroup_name: null,
  },
  {
    id: 'INTIMATE_RELATIONSHIP',
    text: 'Notify your supervising officer of any developing intimate relationships with [WOMEN / MEN / WOMEN OR MEN].',
    user_input: 'intimateGender',
    field_position: {
      intimateGender: 0,
    },
    group_name: GroupName.DISCLOSURE_OF_INFO,
    subgroup_name: null,
  },
  {
    id: 'NOTIFY_RELATIONSHIP',
    text: 'Notify your supervising officer of any developing personal relationships, whether intimate or not, with any person you know or believe to be resident in a household containing children under the age of 18. This includes persons known to you prior to your time in custody with whom you are renewing or developing a personal relationship with.',
    user_input: null,
    field_position: null,
    group_name: GroupName.DISCLOSURE_OF_INFO,
    subgroup_name: null,
  },
  {
    id: 'NOTIFY_PASSPORT',
    text: 'To notify your supervising officer of the details of any passport that you possess (including passport number), and of any intention to apply for a new passport.',
    user_input: null,
    field_position: null,
    group_name: GroupName.DISCLOSURE_OF_INFO,
    subgroup_name: null,
  },
  {
    id: 'NOTIFY_BANKING',
    text: 'Provide your supervising officer with the details of any bank accounts to which you are a signatory and of any credit cards you possess. You must also notify your supervising officer when becoming a signatory to any new bank account or credit card, and provide the account/card details. This condition will be reviewed on a monthly basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
    user_input: null,
    field_position: null,
    group_name: GroupName.DISCLOSURE_OF_INFO,
    subgroup_name: null,
  },
  {
    id: 'CONFINE_ADDRESS',
    text: 'Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
    user_input: 'confinedDetails',
    field_position: {
      confinedTo: 0,
      confinedFrom: 1,
      confinedReviewFrequency: 2,
    },
    group_name: GroupName.CURFEW_ARRANGEMENT,
    subgroup_name: null,
  },
  {
    id: 'REMAIN_ADDRESS',
    text: 'Confine yourself to remain at [CURFEW ADDRESS] initially from [START OF CURFEW HOURS] until [END OF CURFEW HOURS] each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored [WHETHER BY ELECTRONIC MEANS INVOLVING YOUR WEARING AN ELECTRONIC TAG OR OTHERWISE].',
    user_input: 'curfewDetails',
    field_position: {
      curfewTo: 2,
      curfewFrom: 1,
      curfewAddress: 0,
      curfewTagRequired: 3,
    },
    group_name: GroupName.CURFEW_ARRANGEMENT,
    subgroup_name: null,
  },
  {
    id: 'EXCLUSION_AREA',
    text: 'Not to enter the area of [CLEARLY SPECIFIED AREA], as defined by the attached map without the prior approval of your supervising officer.',
    user_input: 'exclusionArea',
    field_position: {
      exclusionArea: 0,
    },
    group_name: GroupName.FREEDOM_OF_MOVEMENT,
    subgroup_name: null,
  },
  {
    id: 'EXCLUSION_ADDRESS',
    text: 'Not to enter [NAME/TYPE OF PREMISES / ADDRESS / ROAD] without the prior approval of your supervising officer.',
    user_input: 'noEnterPlace',
    field_position: {
      noEnterPlace: 0,
    },
    group_name: GroupName.FREEDOM_OF_MOVEMENT,
    subgroup_name: null,
  },
  {
    id: 'NO_CHILDRENS_AREA',
    text: 'Not to enter or remain in sight of any [CHILDREN’S PLAY AREA, SWIMMING BATHS, SCHOOL ETC] without the prior approval of your supervising officer.',
    user_input: 'notInSightOf',
    field_position: {
      notInSightOf: 0,
    },
    group_name: GroupName.FREEDOM_OF_MOVEMENT,
    subgroup_name: null,
  },
  {
    id: 'POLICE_ESCORT',
    text: 'On release to be escorted by police to Approved Premises.',
    user_input: null,
    field_position: null,
    group_name: GroupName.FREEDOM_OF_MOVEMENT,
    subgroup_name: null,
  },
  {
    id: 'PLACE_OF_WORSHIP',
    text: 'To only attend places of worship which have been previously agreed with your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.FREEDOM_OF_MOVEMENT,
    subgroup_name: null,
  },
  {
    id: 'REPORT_TO',
    text: 'Report to staff at [NAME OF APPROVED PREMISES / POLICE STATION] [at TIME / DAILY], unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
    user_input: 'reportingDetailsV2',
    field_position: {
      reportingTime: 1,
      reportingDaily: 5,
      reportingAddress: 0,
      reportingFrequency: 2,
    },
    group_name: GroupName.COMMUNITY_SUPERVISION,
    subgroup_name: null,
  },
  {
    id: 'SPECIFIC_CONDUCT_OR_ACTS',
    text: 'Not to participate directly or indirectly in organising and/or contributing to any demonstration, meeting, gathering or website without the prior approval of your supervising officer. This condition will be reviewed on a monthly basis and may be amended or removed if your risk is assessed as having changed.',
    user_input: null,
    field_position: null,
    group_name: GroupName.SPECIFIC_CONDUCT_OR_ACTS,
    subgroup_name: null,
  },
  {
    id: 'CONTACT_EXTREME',
    text: 'Not to contact directly or indirectly any person whom you know or believe to have been charged or convicted of any extremist related offence, without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.EXTREMISM,
    subgroup_name: null,
  },
  {
    id: 'ATTEND_EXTREME',
    text: 'Not to attend or organise any meetings or gatherings other than those convened solely for the purposes of worship without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.EXTREMISM,
    subgroup_name: null,
  },
  {
    id: 'DELIVER_EXTREME',
    text: 'Not to give or engage in the delivery of any lecture, talk, or sermon whether part of an act of worship or not, without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.EXTREMISM,
    subgroup_name: null,
  },
  {
    id: 'PROMOTE_EXTREME',
    text: 'Not to engage in any discussion or act to promote grooming or influencing of an individual or a group for the purpose of extremism or radicalisation.',
    user_input: null,
    field_position: null,
    group_name: GroupName.EXTREMISM,
    subgroup_name: null,
  },
  {
    id: 'EXTREME_MATERIALS',
    text: 'Not to have in your possession any printed or electronically recorded material or handwritten notes which contain encoded information or that promote the destruction of or hatred for any religious or ethnic group or that celebrates, justifies or promotes acts of violence, or that contain information about military or paramilitary technology, weapons, techniques or tactics without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.EXTREMISM,
    subgroup_name: null,
  },
  {
    id: 'ALLOW_POLICE_SEARCH',
    text: 'You must let the police search you if they ask. You must also let them search a vehicle you are with, like a car or a motorbike.',
    user_input: null,
    field_position: null,
    group_name: GroupName.EXTREMISM,
    subgroup_name: null,
  },
  {
    id: 'POLYGRAPH',
    text: 'To comply with any instruction given by your supervising officer requiring you to attend polygraph testing. To participate in polygraph sessions and examinations as instructed by or under the authority of your supervising officer and to comply with any instruction given to you during a polygraph session by the person conducting the polygraph.',
    user_input: null,
    field_position: null,
    group_name: GroupName.POLYGRAPH,
    subgroup_name: null,
  },
  {
    id: 'DRUG_TESTING',
    text: 'Attend [INSERT NAME AND ADDRESS], as reasonably required by your supervising officer, to give a sample of oral fluid / urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the condition of your licence requiring you to be of good behaviour.',
    user_input: 'drug_testing',
    field_position: {
      drug_testing_name: 0,
      drug_testing_address: 1,
    },
    group_name: GroupName.DRUG_TESTING,
    subgroup_name: null,
  },
  {
    id: 'DONT_HAMPER_DRUG_TESTING',
    text: 'Not to take any action that could hamper or frustrate the drug testing process.',
    user_input: null,
    field_position: null,
    group_name: GroupName.DRUG_TESTING,
    subgroup_name: null,
  },
  {
    id: 'ELECTRONIC_MONITORING_INSTALLATION',
    text: 'Allow person(s) as designated by your supervising officer to install an electronic monitoring tag on you and access to install any associated equipment in your property, and for the purpose of ensuring that equipment is functioning correctly. You must not damage or tamper with these devices and ensure that the tag is charged, and report to your supervising officer and the EM provider immediately if the tag or the associated equipment are not working correctly. This will be for the purpose of monitoring your [INSERT TYPES OF CONDITIONS TO BE ELECTRONICALLY MONITORED HERE] licence condition(s) unless otherwise authorised by your supervising officer.',
    user_input: 'electronicMonitoringInstallation',
    field_position: {
      conditionTypes: 0,
    },
    group_name: GroupName.ELECTRONIC_MONITORING,
    subgroup_name: null,
  },
  {
    id: 'ELECTRONIC_MONITORING_TRAIL',
    text: 'You will be subject to trail monitoring. Your whereabouts will be electronically monitored by GPS Satellite Tagging, ending on [INSERT END DATE], and you must cooperate with the monitoring as directed by your supervising officer unless otherwise authorised by your supervising officer.',
    user_input: 'electronicTrailMonitoring',
    field_position: {
      trailEndDate: 0,
    },
    group_name: GroupName.ELECTRONIC_MONITORING,
    subgroup_name: null,
    displayForEdit: (inputtedCondition) => {
      const trailEndDate = moment(inputtedCondition.trailEndDate, 'DD/MM/YYYY')
      return {
        ...inputtedCondition,
        trailEndDay: trailEndDate.format('DD'),
        trailEndMonth: trailEndDate.format('MM'),
        trailEndYear: trailEndDate.format('YYYY'),
      }
    },
  },
  {
    id: 'CURFEW_UNTIL_INSTALLATION',
    text: 'You must stay at [APPROVED ADDRESS] between 5pm and midnight every day until your electronic tag is installed unless otherwise authorised by your supervising officer.',
    user_input: 'curfewUntilInstallation',
    field_position: {
      approvedAddress: 0,
    },
    group_name: GroupName.ELECTRONIC_MONITORING,
    subgroup_name: null,
  },
  {
    id: 'ALCOHOL_MONITORING',
    text: 'You are subject to alcohol monitoring. Your alcohol intake will be electronically monitoring for a period of [INSERT TIMEFRAME AND END DATE], and you may not consume units of alcohol, unless otherwise permitted by your supervising officer.',
    user_input: 'alcoholMonitoring',
    field_position: {
      timeframe: 0,
      endDate: 1,
    },
    group_name: GroupName.ELECTRONIC_MONITORING,
    subgroup_name: null,
    displayForEdit: (inputtedCondition) => {
      const endDate = moment(inputtedCondition.endDate, 'DD/MM/YYYY')
      return {
        ...inputtedCondition,
        endDay: endDate.format('DD'),
        endMonth: endDate.format('MM'),
        endYear: endDate.format('YYYY'),
      }
    },
  },
  {
    id: 'ATTEND_SAMPLE',
    text: 'Attend [INSERT APPOINTMENT NAME AND ADDRESS], as reasonably required by your supervisor, to give a sample of oral fluid/urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of supervision period requiring you to be of good behaviour.',
    user_input: 'attendSampleDetails',
    field_position: {
      attendSampleDetailsName: 0,
      attendSampleDetailsAddress: 1,
    },
    group_name: GroupName.POST_SENTENCE_SUPERVISION_ONLY,
    subgroup_name: null,
  },
  {
    id: 'ATTEND_DEPENDENCY',
    text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
    user_input: 'appointmentDetails',
    field_position: {
      appointmentDate: 0,
      appointmentTime: 1,
      appointmentAddress: 2,
    },
    group_name: GroupName.POST_SENTENCE_SUPERVISION_ONLY,
    subgroup_name: null,
    displayForEdit: (inputtedCondition) => {
      const appointmentDate = moment(inputtedCondition.appointmentDate, 'DD/MM/YYYY')
      return {
        ...inputtedCondition,
        appointmentDay: appointmentDate.format('DD'),
        appointmentMonth: appointmentDate.format('MM'),
        appointmentYear: appointmentDate.format('YYYY'),
      }
    },
  },
]
