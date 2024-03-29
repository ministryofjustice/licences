import moment from 'moment'
import { ConditionMetadata } from '../../../../../data/licenceClientTypes'
import { AdditionalConditions, AdditionalConditionsV1 } from '../../../../../data/licenceTypes'

enum GroupName {
  PEOPLE_CONTACT_AND_RELATIONSHIPS = 'People, contact and relationships',
  DRUGS_HEALTH_AND_BEHAVIOUR = 'Drugs, health and behaviour',
  CURFEW_AND_REPORTING = 'Curfew and reporting',
  TRAVEL = 'Travel',
  EXCLUSION = 'Exclusion',
  TECHNOLOGY = 'Technology',
  POST_SENTENCE_SUPERVISION_ONLY = 'Post-sentence supervision only',
  RESTRICTED = 'Restricted additional conditions',
}

export const modifyAdditionalConditions = (someConditions: AdditionalConditions) => {
  const conditions = someConditions as AdditionalConditionsV1

  const abuseAndBehavioursConditions = conditions?.COMPLYREQUIREMENTS?.abuseAndBehaviours

  if (Array.isArray(abuseAndBehavioursConditions)) {
    Object.assign(
      abuseAndBehavioursConditions,
      abuseAndBehavioursConditions.map((condition, index) => (index > 0 ? ` ${condition}` : condition))
    )
  }
}
export const pssConditions = ['ATTENDSAMPLE', 'ATTENDDEPENDENCY']
export const conditions: ConditionMetadata[] = [
  {
    id: 'NOCONTACTPRISONER',
    text: 'Not to contact directly or indirectly any person who is a serving or remand offender or detained in State custody, without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.PEOPLE_CONTACT_AND_RELATIONSHIPS,
    subgroup_name: 'Person or group',
  },
  {
    id: 'NOCONTACTASSOCIATE',
    text: 'Not to associate with any person currently or formerly associated with [NAME OR DESCRIBE SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer.',
    user_input: 'groupsOrOrganisations',
    field_position: {
      groupsOrOrganisation: 0,
    },
    group_name: GroupName.PEOPLE_CONTACT_AND_RELATIONSHIPS,
    subgroup_name: 'Person or group',
  },
  {
    id: 'NOCONTACTSEXOFFENDER',
    text: 'Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.PEOPLE_CONTACT_AND_RELATIONSHIPS,
    subgroup_name: 'Person or group',
  },
  {
    id: 'INTIMATERELATIONSHIP',
    text: 'Notify your supervising officer of any developing intimate relationships with [WOMEN / MEN / WOMEN OR MEN].',
    user_input: 'intimateGender',
    field_position: {
      intimateGender: 0,
    },
    group_name: GroupName.PEOPLE_CONTACT_AND_RELATIONSHIPS,
    subgroup_name: 'Person or group',
  },
  {
    id: 'NOCONTACTNAMED',
    text: 'Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.',
    user_input: 'noContactOffenders',
    field_position: {
      noContactOffenders: 0,
    },
    group_name: GroupName.PEOPLE_CONTACT_AND_RELATIONSHIPS,
    subgroup_name: 'Person or group',
  },
  {
    id: 'NORESIDE',
    text: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
    user_input: 'notToReside',
    field_position: {
      notResideWithAge: 1,
      notResideWithGender: 0,
    },
    group_name: GroupName.PEOPLE_CONTACT_AND_RELATIONSHIPS,
    subgroup_name: 'Children',
  },
  {
    id: 'NOUNSUPERVISEDCONTACT',
    text: 'Not to have unsupervised contact with  [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.',
    user_input: 'noUnsupervisedContact',
    field_position: {
      unsupervisedContactAge: 1,
      unsupervisedContactGender: 0,
      unsupervisedContactSocial: 2,
    },
    group_name: GroupName.PEOPLE_CONTACT_AND_RELATIONSHIPS,
    subgroup_name: 'Children',
  },
  {
    id: 'NOCHILDRENSAREA',
    text: 'Not to enter or remain in sight of any [CHILDREN’S PLAY AREA, SWIMMING BATHS, SCHOOL ETC] without the prior approval of your supervising officer.',
    user_input: 'notInSightOf',
    field_position: {
      notInSightOf: 0,
    },
    group_name: GroupName.PEOPLE_CONTACT_AND_RELATIONSHIPS,
    subgroup_name: 'Children',
  },
  {
    id: 'NOWORKWITHAGE',
    text: 'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.',
    user_input: 'noWorkWithAge',
    field_position: {
      noWorkWithAge: 0,
    },
    group_name: GroupName.PEOPLE_CONTACT_AND_RELATIONSHIPS,
    subgroup_name: 'Children',
  },
  {
    id: 'NOTIFYRELATIONSHIP',
    text: 'Notify your supervising officer of any developing personal relationships, whether intimate or not, with any person you know or believe to be resident in a household containing children under the age of 18. This includes persons known to you prior to your time in custody with whom you are renewing or developing a personal relationship with.',
    user_input: null,
    field_position: null,
    group_name: GroupName.PEOPLE_CONTACT_AND_RELATIONSHIPS,
    subgroup_name: 'Children',
  },
  {
    id: 'NOCOMMUNICATEVICTIM',
    text: 'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
    user_input: 'victimDetails',
    field_position: {
      socialServicesDept: 1,
      victimFamilyMembers: 0,
    },
    group_name: GroupName.PEOPLE_CONTACT_AND_RELATIONSHIPS,
    subgroup_name: 'Victims',
  },
  {
    id: 'ATTENDDEPENDENCYINDRUGSSECTION',
    text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
    user_input: 'appointmentDetailsInDrugsSection',
    field_position: {
      appointmentDateInDrugsSection: 0,
      appointmentTimeInDrugsSection: 1,
      appointmentAddressInDrugsSection: 2,
    },
    group_name: GroupName.DRUGS_HEALTH_AND_BEHAVIOUR,
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
    id: 'COMPLYREQUIREMENTS',
    text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your [alcohol abuse / drug abuse / sexual behaviour / violent behaviour / gambling / solvent abuse / anger / debt / prolific behaviour/ offending behaviour] problems at the [NAME OF COURSE / CENTRE].',
    user_input: 'courseOrCentre',
    field_position: {
      abuseAndBehaviours: 0,
      courseOrCentre: 1,
    },
    group_name: GroupName.DRUGS_HEALTH_AND_BEHAVIOUR,
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
    id: 'ATTENDALL',
    text: 'Attend all appointments arranged for you with [INSERT NAME], a [PSYCHIATRIST / PSYCHOLOGIST / MEDICAL PRACTITIONER] and co-operate fully with any care or treatment they recommend.',
    user_input: 'appointmentName',
    field_position: {
      appointmentName: 0,
      appointmentProfession: 1,
    },
    group_name: GroupName.DRUGS_HEALTH_AND_BEHAVIOUR,
    subgroup_name: null,
  },
  {
    id: 'HOMEVISITS',
    text: 'Receive home visits from [INSERT NAME] Mental Health Worker.',
    user_input: 'mentalHealthName',
    field_position: {
      mentalHealthName: 0,
    },
    group_name: GroupName.DRUGS_HEALTH_AND_BEHAVIOUR,
    subgroup_name: null,
  },
  {
    id: 'REMAINADDRESS',
    text: 'Confine yourself to remain at [CURFEW ADDRESS] initially from [START OF CURFEW HOURS] until [END OF CURFEW HOURS] each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored [WHETHER BY ELECTRONIC MEANS INVOLVING YOUR WEARING AN ELECTRONIC TAG OR OTHERWISE].',
    user_input: 'curfewDetails',
    field_position: {
      curfewTo: 2,
      curfewFrom: 1,
      curfewAddress: 0,
      curfewTagRequired: 3,
    },
    group_name: GroupName.CURFEW_AND_REPORTING,
    subgroup_name: null,
  },
  {
    id: 'CONFINEADDRESS',
    text: 'Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
    user_input: 'confinedDetails',
    field_position: {
      confinedTo: 0,
      confinedFrom: 1,
      confinedReviewFrequency: 2,
    },
    group_name: GroupName.CURFEW_AND_REPORTING,
    subgroup_name: null,
  },
  {
    id: 'REPORTTO',
    text: 'Report to staff at [NAME OF APPROVED PREMISES / POLICE STATION] at [TIME / DAILY], unless otherwise authorised by your supervising officer.  This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
    user_input: 'reportingDetails',
    field_position: {
      reportingTime: 1,
      reportingDaily: 2,
      reportingAddress: 0,
      reportingFrequency: 3,
    },
    group_name: GroupName.CURFEW_AND_REPORTING,
    subgroup_name: null,
  },
  {
    id: 'RETURNTOUK',
    text: 'Should you return to the UK and Islands before the expiry date of your licence then your licence conditions will be in force and you must report within two working days to  our supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.TRAVEL,
    subgroup_name: null,
  },
  {
    id: 'NOTIFYPASSPORT',
    text: 'To notify your supervising officer of the details of any passport that you possess (including passport number), and of any intention to apply for a new passport.',
    user_input: null,
    field_position: null,
    group_name: GroupName.TRAVEL,
    subgroup_name: 'Passports',
  },
  {
    id: 'SURRENDERPASSPORT',
    text: 'To surrender your passport(s) to your supervising officer and to notify your supervising officer of any intention to apply for a new passport.',
    user_input: null,
    field_position: null,
    group_name: GroupName.TRAVEL,
    subgroup_name: 'Passports',
  },
  {
    id: 'VEHICLEDETAILS',
    text: 'Provide your supervising officer with details [SUCH AS MAKE, MODEL, COLOUR, REGISTRATION] of any vehicle you own, hire for more than a short journey or have regular use of, prior to any journey taking place.',
    user_input: 'vehicleDetails',
    field_position: {
      vehicleDetails: 0,
    },
    group_name: GroupName.TRAVEL,
    subgroup_name: 'Vehicles',
  },
  {
    id: 'EXCLUSIONADDRESS',
    text: 'Not to enter [NAME/TYPE OF PREMISES / ADDRESS / ROAD] without the prior approval of your supervising officer.',
    user_input: 'noEnterPlace',
    field_position: {
      noEnterPlace: 0,
    },
    group_name: GroupName.EXCLUSION,
    subgroup_name: null,
  },
  {
    id: 'EXCLUSIONAREA',
    text: 'Not to enter the area of [CLEARLY SPECIFIED AREA], as defined by the attached map without the prior approval of your supervising officer.',
    user_input: 'exclusionArea',
    field_position: {
      exclusionArea: 0,
    },
    group_name: GroupName.EXCLUSION,
    subgroup_name: null,
  },
  {
    id: 'ONEPHONE',
    text: 'Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone, including the IMEI number and the SIM card that you possess.',
    user_input: null,
    field_position: null,
    group_name: GroupName.TECHNOLOGY,
    subgroup_name: 'Mobile phones',
  },
  {
    id: 'NOINTERNET',
    text: 'Not to use or access any computer or device which is internet enabled without the prior approval of your supervising officer; and only for the purpose, and only at a public location, as specified by that officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.TECHNOLOGY,
    subgroup_name: 'Computers and internet',
  },
  {
    id: 'USAGEHISTORY',
    text: 'Not to delete the usage history on any internet enabled device or computer used and to allow such items to be inspected as required by the police or your supervising officer. Such inspection may include removal of the device for inspection and the installation of monitoring software.',
    user_input: null,
    field_position: null,
    group_name: GroupName.TECHNOLOGY,
    subgroup_name: 'Computers and internet',
  },
  {
    id: 'NOCAMERA',
    text: 'To make any device capable of making or storing digital images (including a camera and a mobile phone with a camera function) available for inspection on request by your supervising officer and/or a police officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.TECHNOLOGY,
    subgroup_name: 'Cameras and photos',
  },
  {
    id: 'CAMERAAPPROVAL',
    text: 'Not to own or use a camera without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.TECHNOLOGY,
    subgroup_name: 'Cameras and photos',
  },
  {
    id: 'NOCAMERAPHONE',
    text: 'Not to own or possess a mobile phone with a photographic function without the prior approval of your supervising officer.',
    user_input: null,
    field_position: null,
    group_name: GroupName.TECHNOLOGY,
    subgroup_name: 'Cameras and photos',
  },
  {
    id: 'POLYGRAPH',
    text: 'To comply with any instruction given by your supervising officer requiring you to attend polygraph testing. To participate in polygraph sessions and examinations as instructed by or under the authority of your supervising officer and to comply with any instruction given to you during a polygraph session by the person conducting the polygraph.',
    user_input: null,
    field_position: null,
    group_name: GroupName.RESTRICTED,
    subgroup_name: null,
  },
  {
    id: 'DRUG_TESTING',
    text: 'Attend [INSERT NAME AND ADDRESS], as reasonably required by your supervising officer, to give a sample of oral fluid / urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the condition of your licence requiring you to be of good behaviour. Not to take any action that could hamper or frustrate the drug testing process.',
    user_input: 'drug_testing',
    field_position: {
      drug_testing_name: 0,
      drug_testing_address: 1,
    },
    group_name: GroupName.RESTRICTED,
    subgroup_name: null,
  },
  {
    id: 'ATTENDSAMPLE',
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
    id: 'ATTENDDEPENDENCY',
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
