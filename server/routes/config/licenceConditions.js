module.exports = {
  standard: {
    fields: [
      {
        additionalConditionsRequired: {
          responseType: 'requiredYesNo',
          validationMessage: 'Select yes or no',
        },
      },
    ],
    nextPath: {
      decisions: {
        discriminator: 'additionalConditionsRequired',
        Yes: {
          path: '/hdc/licenceConditions/additionalConditions/',
          change: '/hdc/licenceConditions/additionalConditions/change/',
        },
        No: {
          path: '/hdc/taskList/',
          change: '/hdc/review/licenceDetails/',
        },
      },
      path: '/hdc/taskList/',
      change: '/hdc/review/licenceDetails/',
    },
    modificationRequiresApproval: true,
  },
  additional: {
    fields: [
      {
        NOCONTACTASSOCIATE: {
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
        INTIMATERELATIONSHIP: {
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
        NOCONTACTNAMED: {
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
        NORESIDE: {
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
        NOUNSUPERVISEDCONTACT: {
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
        NOCHILDRENSAREA: {
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
        NOWORKWITHAGE: {
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
        NOCOMMUNICATEVICTIM: {
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
        COMPLYREQUIREMENTS: {
          contains: [
            {
              courseOrCentre: {
                validationMessage: 'Enter name of course / centre',
              },
            },
          ],
        },
      },
      {
        ATTENDALL: {
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
        HOMEVISITS: {
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
        REMAINADDRESS: {
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
        CONFINEADDRESS: {
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
        REPORTTO: {
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
        VEHICLEDETAILS: {
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
        EXCLUSIONADDRESS: {
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
        EXCLUSIONAREA: {
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
        ATTENDDEPENDENCY: {
          contains: [
            {
              appointmentDate: {
                validationMessage: 'Enter appointment date',
              },
            },
            {
              appointmentTime: {
                validationMessage: 'Enter appointment time',
              },
            },
            {
              appointmentAddress: {
                validationMessage: 'Enter appointment name and address',
              },
            },
          ],
        },
      },
      {
        ATTENDSAMPLE: {
          contains: [
            {
              attendSampleDetailsName: {
                validationMessage: 'Enter appointment name',
              },
            },
            {
              attendSampleDetailsAddress: {
                validationMessage: 'Enter appointment address',
              },
            },
          ],
        },
      },
      // 2019
      {
        DO_NOT_MEET: {
          contains: [
            {
              do_not_meet_name: {
                validationMessage: 'Enter name',
              },
            },
          ],
        },
      },
      {
        TELL_PROBATION_ABOUT_RELATIONSHIP: {
          contains: [
            {
              tell_probation_about_relationship_gender: {
                validationMessage: 'Select an option',
              },
            },
          ],
        },
      },
      {
        DO_NOT_LIVE_OR_STAY: {
          contains: [
            {
              do_not_live: {
                validationMessage: 'Select an option',
              },
            },
          ],
        },
      },
      {
        NO_UNSUPERVISED_CONTACT: {
          contains: [
            {
              do_not_unsupervised_contact: {
                validationMessage: 'Select an option',
              },
            },
            {
              do_not_unsupervised_social_services_dept_name: {
                validationMessage: 'Enter social services name',
              },
            },
          ],
        },
      },
      {
        DO_NOT_STAY_IN_SIGHT_OF: {
          contains: [
            {
              do_not_in_sight_of_type: {
                validationMessage: 'Enter a type of location',
              },
            },
          ],
        },
      },
      {
        DO_NOT_TAKE_PART_IN_ACTIVITY: {
          contains: [
            {
              do_not_work_involve: {
                validationMessage: 'Select an option',
              },
            },
          ],
        },
      },
      {
        DO_NOT_CONTACT_VICTIM: {
          contains: [
            {
              do_not_contact_victim_name: {
                validationMessage: 'Enter a victim name',
              },
            },
            {
              do_not_contact_victim_social_services_dept_name: {
                validationMessage: 'Enter social services name',
              },
            },
          ],
        },
      },
      {
        FOLLOW_REHABILITATION_INSTRUCTIONS: {
          contains: [
            {
              follow_rehabilitation_instructions: {
                validationMessage: 'Select an option',
              },
            },
          ],
        },
      },
      {
        GIVE_URINE_SAMPLE: {
          contains: [
            {
              give_sample: {
                validationMessage: 'Select an option',
              },
            },
          ],
        },
      },
    ],
  },
  conditionsSummary: {
    nextPath: {
      path: '/hdc/taskList/',
      change: '/hdc/review/licenceDetails/',
    },
  },
}
