export const additionalConditionsV2 = {
  version: 2,
  fields: [
    {
      NO_CONTACT_ASSOCIATE: {
        contains: [
          {
            groupsOrOrganisation: {
              validationMessage: 'Enter a name or describe specific groups or organisations',
            },
          },
        ],
      },
    },
    {
      INTIMATE_RELATIONSHIP: {
        contains: [
          {
            intimateGender: {
              validationMessage: 'Select women / men / women or men',
            },
          },
        ],
      },
    },
    {
      NO_CONTACT_NAMED: {
        contains: [
          {
            noContactOffenders: {
              validationMessage: 'Enter named offender(s) or individual(s)',
            },
          },
        ],
      },
    },
    {
      NO_RESIDE: {
        contains: [
          {
            notResideWithGender: {
              validationMessage: 'Select any / any female / any male',
            },
          },
          {
            notResideWithAge: {
              validationMessage: 'Enter age',
            },
          },
        ],
      },
    },
    {
      NO_UNSUPERVISED_CONTACT: {
        contains: [
          {
            unsupervisedContactGender: {
              validationMessage: 'Select any / any female / any male',
            },
          },
          {
            unsupervisedContactAge: {
              validationMessage: 'Enter age',
            },
          },
          {
            unsupervisedContactSocial: {
              validationMessage: 'Enter name of appropriate social service department',
            },
          },
        ],
      },
    },
    {
      NO_CHILDRENS_AREA: {
        contains: [
          {
            notInSightOf: {
              validationMessage: "Enter location, for example children's play area",
            },
          },
        ],
      },
    },
    {
      NO_WORK_WITH_AGE: {
        contains: [
          {
            noWorkWithAge: {
              validationMessage: 'Enter age',
            },
          },
        ],
      },
    },
    {
      NO_COMMUNICATE_VICTIM: {
        contains: [
          {
            victimFamilyMembers: {
              validationMessage: 'Enter name of victim and /or family members',
            },
          },
          {
            socialServicesDept: {
              validationMessage: 'Enter name of appropriate social service department',
            },
          },
        ],
      },
    },
    {
      COMPLY_REQUIREMENTS: {
        contains: [
          {
            courseOrCentre: {
              validationMessage: 'Enter name of course / centre',
            },
          },
          {
            abuseAndBehaviours: {
              validationMessage:
                'Select at least one option from the alcohol abuse / drug abuse / sexual behaviour / violent behaviour / gambling / solvent abuse / anger / debt / prolific behaviour / offending behaviour',
            },
          },
        ],
      },
    },
    {
      ATTEND_ALL: {
        contains: [
          {
            appointmentName: {
              validationMessage: 'Enter name',
            },
          },
          {
            appointmentProfession: {
              validationMessage: 'Select psychiatrist / psychologist / medical practitioner',
            },
          },
        ],
      },
    },
    {
      HOME_VISITS: {
        contains: [
          {
            mentalHealthName: {
              validationMessage: 'Enter name',
            },
          },
        ],
      },
    },
    {
      REMAIN_ADDRESS: {
        contains: [
          {
            curfewAddress: {
              validationMessage: 'Enter curfew address',
            },
          },
          {
            curfewFrom: {
              validationMessage: 'Enter start of curfew hours',
            },
          },
          {
            curfewTo: {
              validationMessage: 'Enter end of curfew hours',
            },
          },
        ],
      },
    },
    {
      CONFINE_ADDRESS: {
        contains: [
          {
            confinedTo: {
              validationMessage: 'Enter time',
            },
          },
          {
            confinedFrom: {
              validationMessage: 'Enter time',
            },
          },
          {
            confinedReviewFrequency: {
              validationMessage: 'Enter frequency, for example weekly',
            },
          },
        ],
      },
    },
    {
      REPORT_TO: {
        contains: [
          {
            reportingAddress: {
              validationMessage: 'Enter name of approved premises / police station',
            },
          },
          {
            reportingTime: {
              validationMessage: 'Enter time / daily',
            },
          },
          {
            reportingDaily: {
              validationMessage: 'Enter time / daily',
            },
          },
          {
            reportingFrequency: {
              validationMessage: 'Enter frequency, for example weekly',
            },
          },
        ],
      },
    },
    {
      VEHICLE_DETAILS: {
        contains: [
          {
            vehicleDetails: {
              validationMessage: 'Enter details, for example make, model',
            },
          },
        ],
      },
    },
    {
      EXCLUSION_ADDRESS: {
        contains: [
          {
            noEnterPlace: {
              validationMessage: 'Enter name / type of premises / address / road',
            },
          },
        ],
      },
    },
    {
      EXCLUSION_AREA: {
        contains: [
          {
            exclusionArea: {
              validationMessage: 'Enter clearly specified area',
            },
          },
        ],
      },
    },
    {
      DRUG_TESTING: {
        contains: [
          {
            drug_testing_name: {
              validationMessage: 'Enter appointment name',
            },
          },
          {
            drug_testing_address: {
              validationMessage: 'Enter appointment address',
            },
          },
        ],
      },
    },
    {
      ATTEND_DEPENDENCY_IN_DRUGS_SECTION: {
        contains: [
          {
            appointmentDateInDrugsSection: {
              validationMessage: 'Enter appointment date',
            },
          },
          {
            appointmentTimeInDrugsSection: {
              validationMessage: 'Enter appointment time',
            },
          },
          {
            appointmentAddressInDrugsSection: {
              validationMessage: 'Enter appointment name and address',
            },
          },
        ],
      },
    },
  ],
}
