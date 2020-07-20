### From the application's entrypoint...

server.js - reports a health check, then calls listen on
the express instance built in index.js
index.js - builds services, injects into app instance.

app.js - exports createApp. Takes pre-built services, constructs an Express web application

The application is assembled from express routers defined as modules in server/routes/\*

Middleware (middleware == interceptor stack) is installed:

- helmet - security
- cookieSession
- passport = OAuth support
- bodyParser
- cookieParser
- csurf
- compression
- sassMiddleware (dev mode only)
- express.static - to serve static assets, images, css etc
- expressWinston
- flash

The application uses a 'config' object, defined in server/config.js
This object is exported from the module and many other modules import its values directly. In some cases the
object is injected using a factory function.

The 'routes' modules, under server/routes/\*, all follow the same pattern. They return a single function that
takes an express router as its first argument. The function configures the supplied router and returns it.
Optional second and third arguments are an audit (middleware) callback and a (the) config object.

An instance of 'standardRouter' from routes/routeWorkers/standardRouter.js wraps all the routers built by the
router configuring functions in the routes modules.

standardRouter accepts a partially configured router configuring fn, passes a pre-configured router
into the function and returns the result.

standardRouter adds audit, authentication, checkLicence and authorisation middleware to the router.
If a request has a bookingId then checkLicenceMiddleware adds the following objects to res.locals

```
      licence,         // from licenceService.getLicence
      prisoner,        // from elite2Api POST /offender-sentences/bookings with bookingId
      postRelease      // flag, computed as prisoner.agencyLocationId === 'OUT', implies that the prisoner has been released
      licenceStatus
```

bookingId is present whenever the current page is 'prisoner' oriented. The taskList page and task related pages always
include a bookingId in the request.

The res.locals.licence object is _not_ a row from the licence table or an object from the licence column of the licence table

It is a combination of

- a formatted variant of the licence object from the licences table for :bookingId
- the stage, version and vary_version from that row plus a formatted string containing that information
- the version and vary_version from the latest licence_versions row for :bookingId plus a formatted string containing that information

```ecmascript 6
{
  licence,               // Formatted version of the object in the licences column of the licences table for :bookingId
  stage,                 // From the licence row for :bookingId
  version,               // `${version}.${vary_version}` where version and vary_version are from the licence table
  versionDetails,        // { version, vary_version } from the licence table
  approvedVersion,       // `${version}.${vary_version}` from the most recent row of licence_versions table for :bookingId
  approvedVersionDetails // { version, vary_version, template, timestamp } from the licence_versions table as above.
}
```

For reference, the DDL for the licences table is:

```postgresql
create table licences
(
	id              serial                    not null constraint licences_pkey primary key,
	licence         jsonb,
	booking_id      integer                   not null,
	stage           varchar(255)              not null,
	version         integer                   not null,
	transition_date timestamp with time zone,
	vary_version    integer default 0         not null
);
```

and for the licence_versions table:

```postgresql
create table licence_versions
(
	id           serial                                             not null constraint licence_versions_pkey primary key,
	timestamp    timestamp with time zone default CURRENT_TIMESTAMP not null,
	licence      jsonb,
	booking_id   integer                                            not null,
	version      integer                                            not null,
	template     varchar(255)                                       not null,
	vary_version integer default 0                                  not null,

	constraint licence_versions_booking_id_version_vary_version_unique unique (booking_id, version, vary_version)
);
```

The prisoner object is an OffenderSentenceDetail object in elite2Api:

For reference, it looks like this: (from https://api-dev.prison.service.justice.gov.uk/swagger-ui.html#//offender-sentences/postOffenderSentencesBookings)

```
{
    bookingId*	            integer($int64) Offender booking id.
    offenderNo*	            string
    firstName*	            string
    lastName*	            string
    agencyLocationId	    string  Agency Id
    dateOfBirth*	        string($date)
    agencyLocationDesc*	    string
    internalLocationDesc*	string
    facialImageId	        integer($int64)
    sentenceDetail	SentenceDetail  {
        bookingId*                         integer($int64)
        sentenceStartDate                  string($date)
        confirmedReleaseDate               string($date)
        releaseDate                        string($date)   Confirmed, actual, approved, provisional or calculated release date for offender, according to offender release date algorithm.
        nonDtoReleaseDateType              string          Indicates which type of non-DTO release date is the effective release date. One of 'ARD’, 'CRD’, ‘NPD’ or 'PRRD’. Enum: Array [ 4 ]
        additionalDaysAwarded              integer($int32) ADA - days added to sentence term due to adjustments.
        automaticReleaseOverrideDate       string($date)   ARD (override) - automatic (unconditional) release override date for offender.
        conditionalReleaseOverrideDate     string($date)   CRD (override) - conditional release override date for offender.
        nonParoleOverrideDate              string($date)   NPD (override) - non-parole override date for offender.
        postRecallReleaseOverrideDate      string($date)   PRRD (override) - post-recall release override date for offender.
        nonDtoReleaseDate                  string($date)   Release date for non-DTO sentence (if applicable). This will be based on one of ARD, CRD, NPD or PRRD.
        sentenceExpiryDate                 string($date)   SED - date on which sentence expires.
        automaticReleaseDate               string($date)   ARD - calculated automatic (unconditional) release date for offender.
        conditionalReleaseDate             string($date)   CRD - calculated conditional release date for offender.
        nonParoleDate                      string($date)   NPD - calculated non-parole date for offender (relating to the 1991 act).
        postRecallReleaseDate              string($date)   PRRD - calculated post-recall release date for offender.
        licenceExpiryDate                  string($date)   LED - date on which offender licence expires.
        homeDetentionCurfewEligibilityDate string($date)   HDCED - date on which offender will be eligible for home detention curfew.
        paroleEligibilityDate              string($date)   PED - date on which offender is eligible for parole.
        homeDetentionCurfewActualDate      string($date)   HDCAD - the offender’s actual home detention curfew date.
        actualParoleDate                   string($date)   APD - the offender’s actual parole date.
        releaseOnTemporaryLicenceDate      string($date)   ROTL - the date on which offender will be released on temporary licence.
        earlyRemovalSchemeEligibilityDate  string($date)   ERSED - the date on which offender will be eligible for early removal (under the Early Removal Scheme for foreign nationals).
        earlyTermDate                      string($date)   ETD - early term date for offender.
        midTermDate                        string($date)   MTD - mid term date for offender.
        lateTermDate                       string($date)   LTD - late term date for offender.
        topupSupervisionExpiryDate         string($date)   TUSED - top-up supervision expiry date for offender.
        tariffDate                         string($date)   Date on which minimum term is reached for parole (indeterminate/life sentences).
    }
}
```

The licenceStatus object describes the overall state (or perhaps progress) of a licence application. It is defined in server/utils/licenceStatus.js
where its value is derived from a licence record.

The licenceStatus object looks like

```javascript 1.6
{
    stage: theStage, // values from server/services/config/licenceStages.js
                     // UNSTARTED, ELIGIBILITY, PROCESSING_RO, PROCESSING_CA, APPROVAL, DECIDED, MODIFIED, MODIFIED_APPROVAL, VARY
    decisions: {
        // Each field is an object describing the state of a 'decision'.
        // decisions are things like exceptionalCircumstances, excluded, eligible etc
        // All boolean values. Derived from a licences object.
    },
    tasks: {
        // fields for each task showing the task's state. values from server/services/config/taskStates
        // UNSTARTED, STARTED, DONE
    }
}
```

After authenticating, a normal user arrives at the Case list page. /caseList/active
Routes handled by server/routes/caseList.js
The caselist is created by server/services/caseListService.js (getHdcCaseList)
The caselist is constructed differently for CA, DM and RO.
For,

```
    CA and DM: elite2Api, /offender-sentences/home-detention-curfew-candidates     -> OffenderSentenceCalc
    RO:        deliusApi, /staff/staffCode/${deliusStaffCode}/managedOffenders -> OffenderSummary
```

Every row links to a taskList: hdc/taskList/:bookingId

Tasklists are the heart of the licences application.
Tasks are undertaken by CAs and ROs. A task is something like assessing risk, recording where an offender might live,
defining and assessing curfew conditions.

Task progress and state is recorded in a licence object. There is a licence object for each case (bookingId. licence
objects are persistent, being stored as JSON in the licence column of the licences table. (PK bookingId)

The tasklist view of a case (booking) shows a list of tasks for that booking.
The tasklist varies depending upon who (CA,RO, DM) is viewing it, the state of the tasks and the licence stage.

A case progresses through a series of stages. Only one role (CA, DM, RO) is able to carry out tasks at any time. Other
roles are typically restricted to read only view of tasks. Precisely which roles can update or view a task
depends upon the stage the case (licence) is at and upon how far each task has progressed.
A case (licence) progresses from one stage to another when either the currently 'active' role 'sends' the case to the
next stage (represented by the role that will then become active), or certain tasks have been completed.

The overall happy path flow for a case (tasklist? licence?) is

UNSTARTED (CA) -> ELIGIBILITY (CA) -> PROCESSING_RO (RO) -> PROCESSING_CA (CA) -> APPROVAL (DM) -> DECIDED (CA)

GET and POST requests for the taskList page (hdc/taskList) are handled by the taskList router (server/routes/taskList)

```
 GET hdc/taskList/:bookingId
POST hdc/taskList/eligibilityStart
POST hdc/taskList/varyStart
 GET hdc/taskList/image/:imageId
```

GET taskList/:bookingId is the key URI. It renders the current user's view of the current state of task list.
A user interacts with a Tasks by selecting it from this list of currently available tasks.

```
   View data:
       prisonerInfo   from:   server/services/prisonerService.js getPrisonserDetails.
          prisoner,           from elite2Api POST /offender-sentences/bookings with bookingId (Also at res.locals.prisoner??? See above)
          aliases,            from elite2Api  GET /bookings/${bookingId}/aliases
          offences,           from elite2Api  GET /bookings/${bookingId}/mainOffence
          responsibleOfficer, from elite2Api or Delius
          PNC,
          CRO,
          image,
       licence                the current state of the licence object (Also at res.locals.licence ??? See above)
       licenceStatus          computed from licence object            (Also at res.locals.licenceStatus ??? See above)
       allowedTransition      from licenceStatus and user's role (req.user.role) server/utils/licenceStatusTransitions.js
                              one of 'roToCa', 'dmToCa', 'caToDmRefusal', 'caToDm', 'caToRo' or null
       statuslabel            from licenceStatus and user's role. server/utils/licenceStatusLables.js (not used???)
       taskListModel          computed by server/viewModels/taskListModels.js
```

The taskListModel which is central to GET hdc/taskList/:bookingId is built from:

- licenceStatus (decisions, tasks, stage)
- allowedTransition

The starting point for selecting the set of Tasks and their state is to select a particular grouping (where
grouping === taskListMethod, a function which yields a list of tasks)
The grouping is selected by <role, stage, postRelease>. see getTaskListName and taskListConfig in taskListModel.js

If postRelease then 'vary'

Otherwise the first of the following that matches by stage and role:

```
 caTasksEligibility: { stages: ['ELIGIBILITY', 'UNSTARTED'], role: 'CA' },
 caTasksPostApproval: { stages: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'], role: 'CA' },
 caTasksFinalChecks: { stages: ['PROCESSING_CA', 'PROCESSING_RO', 'APPROVAL'], role: 'CA' },
 roTasks: { stages: ['PROCESSING_RO', 'PROCESSING_CA', 'APPROVAL', 'ELIGIBILITY'], role: 'RO' },
 roTasksPostApproval: { stages: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'], role: 'RO' },
 dmTasks: { role: 'DM' },
```

The taskList methods are in server/routs/viewModels/taskLists/

```
  caTasks.js
  dmTasks.js
  roTasks.js
  varyTasks.js
```

Each Task in this model is an object that has the following Fields. The model is used to render
information about the task.

```ecmascript 6
const aTask = {
    title: 'Proposed curfew address', // A string. The displayed name of the task
    label: 'Opted out',               // Explanatory text, displayed under the title.
    action:
        // The action(s) to be performed if the actions button/link is clicked. In practice how to render the 'action'.
        // One object, or an array of objects with the following shape:
        {
            type: 'btn', // The 'type' of action. (to be rendered. 'link', 'btn', 'btn-secondary')
            href: '/hdc/proposedAddress/curfewAddressChoice/', // The action's href ( '/caseList/active', '/hdc/review/bassRequest/', etc)
            text: 'View/Edit', // The text to display in the rendered 'action'
        },
    visible: boolean
}
```

The content of a Task's label and action may be static or computed from the licenceState's decisions and tasks
(which in turn are computed from the licence)

Typically the task models which contain a static label and action are defined in-line in the task list method files above.
Those whose label and action are dynamic are defined separately so that the logic for each task model is held in
a separate file. These files are in server/routes/viewModels/taskLists/tasks/\*.js
(additionalConditions.js, bassArea.js ...)

The logic for the 'visible' flag on each task model is all determined in the taskListMethod files above.

Many of the 'actions' follow one of a few standard patterns. There are functions for creating these actions in
server/routes/viewModels/taskLists/tasks/utils/actions.js

### Tasks.

A task is represented by a page or pages. The pages contain
questions, some as confirmation of actions having been performed, some as precursors to selecting other questions.
form elements for collecting data - an address, a date, curfew hours etc.

The router construction methods for these task oriented pages are all in server/routes/\*.js

Standard Routes.
There are many task oriented pages/routes that follow a standard pattern:

- GET the data for a task, render it as a form
- POST the form, validate the posted data, update the licence record, redirect to a GET on a url.

server/routes/routeWorkers/standard.js contains the encodings of these two behaviours as

```
 get(req, res) and
post(req, res)
```

standard.js uses licenceService to update the licence and nomisPushService to push data back to NOMIS.
get and post are preconfigured with a formConfig object, a sectionName and the global config object.

get and post work with three values from the request url: :formName, :bookingId and :action

    :bookingId and :formName are mandatory,  :action is optional.

The key configuration data for each set of standard task pages is therefore formConfig + sectionName

There are many formConfig objects. Each is a static object defined in one of the server/routes/config/\*.js files

A formConfig is a hierarchy of objects.
At the top level are objects whose keys are 'formNames'. The :formName parameter selects one of these objects.

The configuration for each section consists of

```{
    licenceSection: 'string', // otional?
    pageDataMap: ['licence','bassReferral',] // just an example.  This field is optional.  If present, selects the
                                             // part of res.locals.licence supplied to the view as 'data'
    validate: boolean, // optional?
    fields: [  // Mainly used to configure validation in the POST handler.
        [fieldName]: {
            responseType: '' // types are defined in:
            validationMessage: 'string'
        }
    ]
  nextPath: {
    decisions: {
        discriminator: 'string'
        Yes: 'href'
        No: 'href'
    },
    path: 'href',
    change: 'href',
    discriminator: 'string'
    'A Key': 'href'
    'Another key': 'href'
  },
}
```

### GET

When the request is a GET, data is extracted from the formConfig object as follows

const { licenceSection, nextPath, pageDataMap } = formConfig[formName]

part of res.locals.licence is extracted using pageDataMap if present, or ['licence', sectionName, licenceSection] otherwise.
N.B. 'licence' is fixed (obviously)
sectionName is configured when the 'standard' route instance is built.
licenceSection is formConfig[formName].licenceSection

pageDataMap is a way to take data from another part of the licence for rendering the get view.  
 For example, routes/config/bassReferral.js 'bassAreaCheck' has pageDataMap: ['licence','bassReferral']
bassAreaCheck is a RO stage task. licence.bassReferral was previously submitted by the CA before sending to the RO.

All assembled data is passed to the view selected by `'${sectionName}/${formName}`

### POST

Post is more involved.

- Compute path for redirect.
- licenceSection and formName _might_ be overridden by saveSection array in formConfig, but this is rare.
- Extract field configuration data from the fields section of the selected formConfig
- use the extracted field configuration data to process the POST data.
- Update an in-memory copy of the current licence with the processed POST data. No validation done yet.
- Update the persisted licence with these new, unvalidated, values.
- possibly update the licence stage (to one of licenceStages in server/services/config/licenceStages.js)
- If formConfig.validate then

```
    validate the licence[section][form] part of the updated licence.
      This is done by licenceService.validateForm(), but that delegates to the validate function in server/services/utils/formValidation.js
    If there are errors then flash the errors and redirect to
       `/hdc/${sectionName}/${formName}/${actionPath}${bookingId}`
```

- Otherwise if form validation passed, optionally push data to NOMIS. These update nomis HDC data using PUT requests:

```
     /offender-sentences/booking/${bookingId}/home-detention-curfews/latest/checks-passed
     /offender-sentences/booking/${bookingId}/home-detention-curfews/latest/approval-status
```

Done using pushStatus and pushChecksPassed from server/services/nomisPushService.js

- Finally, redirect to the first of

```
    req.body.anchor -> ${nextPath}${bookingId}#${req.body.anchor}
    req.body.path   -> ${nextPath}${req.body.path}/${bookingId}
    default         -> ${nextPath}${bookingId}
```

### Form validation

Form validation, in server/services/utils/formValidation.js, depends heavily on the 'joi' package, (now @hapi/joi)

For 'standard' validation the fieldOptions object in formValidation.js defines the possible validations. The
'responseType' field of a field's definition in a formConfig selects one of these fieldOptions.

### An example.

A BASS referral route.

app.js builds routes under `/hdc/bassReferral/` as
`secureRoute(bassReferralRouter({licenceService))` where `bassReferralRouter` is imported
from server/routes/bassReferral.js

routes/bassReferral.js contains 'bespoke' route configurations for

```
POST /rejected/:bookingId
POST /unsuitable/:bookingId
GET /bassOffer/:bookingId
POST /bassOffer/withdraw/:bookingId
POST /bassOffer/reinstate/:bookingId
```

It also configures 'standard routes' as follows.

```ecmascript 6
  // other imports
  const formConfig = require('./config/bassReferral')

  // code from the exported routes configuration function:
  const standard = createStandardRoutes({ formConfig, licenceService, sectionName: 'bassReferral' })

  // config for bespoke routes, followed by:

  router.get('/:formName/:action/:bookingId', asyncMiddleware(standard.get))
  router.post('/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post))

  router.get('/:formName/:bookingId', asyncMiddleware(standard.get))
  router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))
```

So the 'standard' routes are configured with section name 'bassReferral' and formConfig
from /config/bassReferral.js

Consider the url `bassReferral/bassAreaCheck/:bookingId`

The first part of the url selects the bassReferral router - because that's how the route is configured in app.js.
bassAreaCheck isn't one of the 'bespoke routes configured in bassReferral.js
so it is handled by the standard route behaviour for GET and POST.

Since it uses the standard routes the section name is 'bassReferral' (see above) and the formName is 'bassAreaCheck'

server/routes/config/bassReferral.js has

```
    bassAreaCheck: {
        licenceSection: 'bassAreaCheck',
        pageDataMap: ['licence', 'bassReferral'],
        validate: true,
        fields: [ ... ],
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/',
        }
     }
```

So the form name selects this part of config/bassReferral.js

Now we know that:

For a GET request: standard.js will extract data from that part of the licence object selected by bassAreaCheck.pageDataMap,
that is 'licence.bassReferral'. It will adapt this data using bassAreaCheck.fields, then render the Pug template
at `${sectionName}/${formName}`. Section name was set to 'bassReferral' and form name, from the request is 'bassAreaCheck',
so the Pug template is at bassReferral/bassAreaCheck.pug

For a POST request: The formName is 'bassAreaCheck' and the sectionName is 'bassReferral' as before.
There's no :action' part in the url, there's no 'decision' field within nextPath, so the request will redirect to
${bassAreaCheck.nextPath.path}/${bookingId} in other words /hdc/taskList/\${bookingId}

licenceService will create an updated version of the licence object using

- config: the bassAreaCheck part of the config/bassReferral.js object. Only the 'fields' part is used.
- licenceSection: There's no 'saveSection' in the selected config so this is sectionName, ie. 'bassReferral'
- formName: Again, there's no 'saveSection' so this is formName, ie. 'bassAreaCheck'
- and the data from the request.

The original licence object will be updated using
{
...licence,
[licenceSection] : {
...licence[licenceSection],
[formName]: answers
}
}

in other words:
{
...licence,
['bassReferral']: {
...licence['bassReferral'],
['bassAreaCheck']: answers
}
}

Note that the _replaces_ the whole `licence.licenceSection.formName` object with `answers`

So the bassReferral.bassAreaCheck part of the licences object is overwritten with 'answers'. where 'answers'
is the body of the response (as a json object) after processing using configuration from 'bassAreaCheck.fields'

The processing mostly filters userInput to just those field names in the fields object. lists, inner fields, and split dates
are subject to some massaging.

Validation is performed on the licence.bassReferral.bassAreaCheck part of the updated licence using 'bassAreaCheck' as the form name.

### Another example. Risk Management.

The url `/hdc/risk/riskManagement/:bookingId` matches the app.js configuration for 'risk', which is a router
configured by routes/risk.js

The router configuration in routes/risk.js delegates to an instance of the standard router in standard.js for all routes.
This router is built as

```ecmascript 6
const formConfig = require('./config/risk')

 const standard = createStandardRoutes({ formConfig, licenceService, sectionName: 'risk' })
```

The form name path parameter for the url is 'riskManagement'. This form name selects this part of
routes/config/risk.js

```
  riskManagement : {
      licenceSection: 'riskManagement'
      fields: [ ... ],
      nextPath: {
          path: '/hdc/taskList/',
        change: '/hdc/review/licenceDetails/'
      }
  }
```

The section name (above) is 'risk'. The licenceSection is 'riskManagement'.

Now we know that for a GET request:

There is no pageDataMap in this object, so the router selects the 'licence.risk.riskMangement'
part of the licence object to populate the form.

## Extended example. LIC-1051 'Add reporting date and time to RO reporting instructions screen'

This boils down to two requirements

1. Make the Reporting Instructions form editable for a PCA.
2. Add the Reporting Date and Time to the Reporting Instructions form so that both ROs and PCAs can enter or change these values
   from the Reporting Instructions page/form.

Note that the existing 'Reporting date' licence creation task should be left unaltered.

### Discussion

#### Existing Reporting Date task

There is a CA task list for creating licences that have been approved by the DM.

This task list is accessed via the 'Create licence' task which is present when the case (application?) has been approved.
`http://localhost:3000/hdc/pdf/selectLicenceType/:bookingId`

Once a licence type has been selected the CA is presented with the licence creation task list at
`http://localhost:3000/hdc/pdf/taskList/:licenceType/:bookingId`

Where :licenceType is one of hdc_ap, hdc_ap_pss, hdc_pss and optionally hdc_u12,

One of the options in this list is Reporting Dates at `http://localhost:3000/hdc/reporting/reportingDate/hdc_ap/1200635`

There is a bug here. The task is shown as complete even when no reporting date or time has been provided.
Submitting this form POSTs to `hdc/reporting/reportingDate/hdc_ap/1200635` which redirects to `/hdc/pdf/taskList/hdc_ap/1200635`

The body of the POST is application/x-www-form-urlencoded as, for example

```
_csrf: wLqtq0Ey-B0jeenCGRuYHhLWHxdCvPEX5gf4
bookingId: 1200635
path: hdc_ap
reportingDay: 21
reportingMonth: 08
reportingYear: 2019
reportingTime: 12:34
```

The router for urls starting with /hdc/reporting is defined in routes/reporting.js
All route handling is delegated to an instance of 'standard' router, configured using:

```ecmascript 6
  const formConfig = require('./config/reporting')
  // ...
  const standard = createStandardRoutes({ formConfig, licenceService, sectionName: 'reporting' })
```

This means that a GET to `/hdc/reporting/reportingDate/hdc_ap/1200635`
defines a form name of 'reportingDate' which means the configuration data will be the reportingDate object from within routes/config/reporting.js:

```ecmascript 6
const config = {
  reportingDate: {
    licenceSection: 'reportingDate',
    fields: [
      {
        reportingDate: {
          splitDate: { day: 'reportingDay', month: 'reportingMonth', year: 'reportingYear' },
          responseType: 'requiredDate',
        },
      },
      {
        reportingTime: {
          responseType: 'requiredTime',
        },
      },
    ],
    validate: true,
    noModify: true,
    nextPath: {
      path: '/hdc/pdf/taskList/',
    },
  },
}
```

This url also has an :action part which in this case is 'hdc_ap', but could have been any of the other licence types.

The post updates the `licences.reporting.reportingDate` part of the licence object.

#### The existing Reporting Reporting Instructions task.

The RO is the first role to see this task. It's url is hdc/reporting/reportingInstructions/:bookingId

THis uses the same router and standard routes configuration as the reporting date task. The only difference is the form
name which is 'reportingInstructions' This selects the reportingInstructions part of routes/config/reporting.js

```ecmascript 6
const config = {
  reportingInstructions: {
    licenceSection: 'reportingInstructions',
    fields: [
      // ...
    ],
    nextPath: {
      path: '/hdc/taskList/',
      change: '/hdc/review/licenceDetails/',
    },
  },
}
```

The POST updates the `licence.reporting.reportingInstructions` part of the licence object.

#### New behaviour for the Reporting Instructions task

The Reporting Instructions task has to change so that it also asks for, presents to the user, validates and saves the fields currently described
by routes/config/reporting.js, subsection 'reportingDate'. Because this requirement spans two separate form configurations
and licence sections standard.js can not be used to implement the form. (Both `licence.reporting.reportingInstructions` and
`licence.reporting.reportingDate` must be read, rendered in the form, updated, persisted and validated).

Alternatively, the reportingDate and reportingInstructions sections could be merged. Then it would be possible to have
two form configurations which both operated on sub-sets of the same data (fields).

This would require a knex-migrate script to update existing data stored by the application when the new code is introduced. Hmmm.

There's a problem. the reportingDate formConfig has { validate: true, noModify: true }, the reportingInstructions form
has neither of these fields.

1. How is noModify used??? It seems to prevent the licence.stage being changed
   from DECIDED or MODIFIED to MODIFIED_APPROVAL or DECIDED to MODIFIED if the date/time are changed. Hmmm.
2. can validate be added to the reportingInstructions form?

So changing the Reporting Date/Time does not count as a modification. Currently changing the Reporting Instructions is not possible, so
the question doesn't arise. Making Reporting Instructions modifiable by a CA then makes { noModify: true } a plausible option...

Louise says that any change to Reporting Instructions should not change licence.stage so merging the two forms seems to be the
simplest option.

### To Do:

1. Merge the markup from server/views/reporting/reportingDate.pug into reportingInstructions.pug.
1. Change the read-only 'review' views of a case so that they display the reporting date and time.
1. Change the form configuration in server/routes/config/reporting.js
1. Change the CA task list for the final checks stage, defined in server/routes/viewModels/taskLists/caTasks.js to make the
   Reporting Instructions task View/Edit instead of just View.
1. Change server/routes/config/authorisation.js to allow the path /hdc/reporting for a CA at the PROCESSING_CA stage
1. Change getReportingInstructionsState in server/utils/licenceStatus.js to include the reportingDate and reportingTime fields in the
   task complete check.
1.
1. Change the way data is extracted from a licence object when rendering a PDF licence (server/services/config/pdfData.js)
1. Fix up the unit tests
1. Fix up the integration tests
1. Write a knex-migrate migration to copy the reportingDate object into reportingInstructions object in the persistent licence.licence objects.

The read-write view seen by the RO and CA (post decision) is at `hdc/reporting/reportingInstructions/:bookingId`

The read only view shown to the CA when the case is sent to the RO, and to the DM is at `hdc/review/licence/:bookingId`

The read-only view of the reportingInstructions shown to the CA when the case is sent to them by the RO for final checks is
at `hdc/review/reporting/:bookingId`

Having two forms which operate on sub-sets of the same data is a challenge, especially from the validation viewpoint.

The code in standard.js which handles a POST request _replaces_ a complete licence.sectionName.licenceSection object
with a new version that is the set of values submitted from the form. See above. Therefore it is not possible to
update a subset of the data in a licenceSection. This means that the reportingDate form must update the whole form.
The easiest way to do this is to add hidden input fields to the reportingDate form for the original reportingInstructions fields.

config/reporting.js now looks like

```ecmascript 6
module.exports = {
  reportingInstructions: {
    licenceSection: 'reportingInstructions',
    fields,
    validate: true,
    noModify: true,
    nextPath: {
      path: '/hdc/taskList/',
      change: '/hdc/review/licenceDetails/',
    },
  },

  reportingDate: {
    licenceSection: 'reportingInstructions',
    saveSection: ['reporting', 'reportingInstructions'],
    fields,
    validate: true,
    noModify: true,
    nextPath: {
      path: '/hdc/pdf/taskList/',
    },
  },
}
```

Where `fields` is the combination of the original reportingInstructions and reportingDate 'field' configurations.

### The Joy of Validation

Note the { validate: true, noModify: true } for both forms. Now all fields in the reportingInstructions 'licenceSection'
are always validated against the field configurations. All the fields in these configurations are specified as required
except for buildingAndStreet2 which is optional. Now the RO _must_ supply valid values for all these fields.
This is a change to the application's behaviour, made necessary by the need to ensure that the reportingDate and
reportingTime fields contain values that make sense. (A date of 12/34/57 is obviously nonsense).

Some questions:

1. Why, when the original reportingInstructions configuration did not specify valid: true, were most of those fields'
   responseType 'requiredString', 'requiredPostcode' or 'requiredPhone'? Is there some part of the application where
   those constraints are applied to the data?

Answer: routes/review.ts uses licencesService.validateFormGroup conditionally based on the user's role, the stage the case
is at and whether the case is 'postApproval' where

```ecmascript 6
      const postApproval = ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(stage)
```

The conditions where validation will be performed on 'review' views of the tasks (case? case data? form data?) are
described in the following table.
| role | stage | validate |

---

| CA | ELIGIBILITY | true |
| CA | PROCESSING_CA | true |
| CA | FINAL_CHECKS | true |
| CA | DECIDED | true |
| CA | MODIFIED | true |
| CA | MODIFIED_APPROVAL | true |
| RO | PROCESSING_RO | true |
| DM | APPROVAL | true |

No validation is performed for any other combination of role and stage. Note that the 'postApproval' flag has been
subsumed into this table. The table is derived from the `shouldValidate` function in review.ts

Note that the value of the `validate` flag in the formConfiguration files/object has no effect here.

Where does the review.ts handler come into play? It handles GET request for URLs like /hdc/review/:sectionName/:bookingId
and makes use of pug templates at server/views/review. There are templates for these sectionNames:
address, approvedPremisesAddress, bassOffer, bassRequest, conditions, curfewAddress, curfewHours, eligibility, finalChecks,
reporting, risk and victimLiason). There are also templates for the 'pseudo' sectionNames 'licence' and 'licenceDetails'.

So, review pages display read-only views of sections or all of the form data for a licence, and may also validate
and display validation errors iff the user's role and the case stage match one of the combinations in the table above.

Where are these pages used?
Search within server/routes for `/hdc/review`. There are 30 matches in 13 files.

- Some of those matches are in the server/routes/viewModels/tasksLists/tasks directory. Modules in that directory
  define re-usable label/action pairs that are then used repeatedly in the task list definitions in server/routes/viewModels/tasksLists.
  So 'review' pages are reachable in numerous ways from task lists.
- There are many server/routes/config modules where a formConfig has formConfig.nextPath.change: '/hdc/review/licenceDetails'
  When routes are handled by standard.js then for POST requests the 'change' path is selected by the value of :action in the POST url,
  whereas GET requests pass nextPath through to pug templates (but there are no templates that make use of nextPath).
  So those nextPath.change links that point to urls like /hdc/review/\* are only selected as a result of a POST
  request where the url looks like '/:formName/:action/:bookingId' and :action is 'change'. In other words there are forms
  that POST to urls that have an action component set to 'change'.

One hdc/review/licenceDetails/:bookingId is the task through which a case is forwarded between CA RO and DM. So
at these points the user may be presented with a validated summary of the licence data and given the opportunity to
correct that data. The user is not obliged to correct validation errors, so invalid or missing data may be passed between stages/roles.

There is a final review stage associated with creating/printing a licence. I suspect that this is currently broken.

It seems that the Story's requirements cannot be met using standard.js and modifying formConfig objects alone. It will
be necessary to replace some of the behaviour in standard.js as it is used in server/routes/reporting.js

### Bespoke code

Most of the changes made above can stand. The original reportingInstructions and reportingDate should be merged into
reportingInstructions and reportingDate removed. Application logic should work with this modified data structure.

As before reportingInstructions should not be validated, but reportingDate should be, but on the reportingDate form only.

## Licence Versions

A licence is really a physical document which defines the conditions and obligations placed on a prisoner who is to
be released under a Home Detention Curfew and / or supervision. This document, produced as a PDF file by the licence
application, is versioned. What this means is that the data on which the PDF document depends is assigned a unique identifier that is
displayed in the document and within the application.
The data from which a document version was produced is stored as a snapshot in the licence_versions table.
The next time a licence PDF is generated the data on which it depends is compared with the most recent snapshot.
If a change is detected then a new version is assigned to the document and another snapshot recorded otherwise
the PDF document is generated from the existing licence data using the current version information.

### Detail

A licence version is represented by two numbers, `version` and `vary_version`. `version` starts at 1, `vary_version` at 0.
Before an offender is released each new licence version is represented by incrementing `version` and after release by
incrementing `vary_version`.
For example, a licence is created, then modified twice before the offender is released, then after release modified once more.
The sequence of combined versions (version.vary_version) should be 1.0 -> 2.0 -> 3.0 (release) -> 3.1

licenceClient.ts provides the functions for interacting with the licences and licence_versions tables.
Licence PDFs are generated from pug templates. Below `template` is the name or key of a particular licence template.  
The template names/ids are defined in server/routes/config/pdf.js, and a
spec for the data provided to each template is in server/services/config/pdf.js
Here are the functions that interact with the licence_versions table.

- getApprovedLicenceVersion(bookingId) returns the most recent version, vary_version, template, and timestamp from
  licence_versions for a bookingId.
- saveApprovedLicenceVersion(bookingId, template) insert a copy of the licences row for `booking_id` into licence_versions.

The licence record for a booking is created by `createLicence`. `createLicence` defaults to using version=1, vary_version=0

The `version` or `vary_version` on a licence record are changed using `updateVersion(bookingId, postRelease)`. `postRelease` selects
the `vary_version` column if truthy otherwise `version`. The selected column's value is set to its maximum value in the
licence_versions table + 1. Calling this function has no effect unless a new snapshot has been added to the licence_versions table
since it was last called. `updateVersion` is only called from within licencesClient.js by:

- `updateLicence(bookingId, licence={}, postRelease)` Replaces licence BSON with supplied value, then calls `updateVersion(bookingId, postRelease)`
- `updateSection(section, bookingId, object, postRelease)` Replaces that part of the licence BSON selected by `section` with object, then call `updateVersion(bookingId, postRelease)`

So every call to `updateLicence` or `updateSection` will update a version number but _only_ whn preceded by a call to
`saveApprovedLicenceVersion`. In other words, any persisted change to a licences record made after `saveApprovedLicenceVersion`
has been called will increment the licence version (once only)

#### When is saveApprovedLicenceVersion called?

licenceService.ts delegates to `saveApprovedLicenceVersion`. pdfService.js has two calls to this function in

1. `updateLicenceTypeTemplate` not exported. called by `getPdfLicenceDataAndUpdateLicenceType`.
1. `checkAndUpdateVersion` not exported. Called by `getPdfLicenceData`.

The second version appears to be much older than the first. They are very similar.
The difference being that the first introduces an `offeneceBeforeCutoff` flag.
This flag is passed through to updateLicenceTypeTemplate where it is used as an additional value.

Let us examine what the original version does.

The first thing getPdfLicenceData does is call checkAndUpdateVersion. Then it retrieves, formats and
returns data with which to populate a licence document.

What does checkAndUpdateVersion do? It uses server/utils/versionInfo.js to test the supplied 'rawLicence'.

The test returns an object containing:

```ecmascript 6
{
    currentVersion,     // version from supplied rawLicence
    lastVersion,        // approvedVersionDetails from rawLicence
    isNewVersion,       // flag, see below
    templateLabel,      // template label - the user friendly name of the licence type. derived from supplied templateName
    lastTemplateLabel,  // ditto - for approvedVersionDetails.template (name)
    isNewTemplate,      // flag, see below
  }
```

N.B. inspection of calls to getPdfLicenceData (all in routes/pdf.js) shows that
rawLicence is res.locals.licence (see above) so,

- rawLicence.version is `${version}.${vary_version}` from licences table
- rawLicence.approvedVersionDetails is the latest `{ version, vary_version, template, timestamp }` from licence_versions.

`isNewTemplate` is true iff there is an approvedVersionDetails and the supplied template name doesn't match the value in approvedVersionDetails

`isNewVersion` is true iff there is no approvedVersionDetails or either of the version numbers from the licences record (rawLicence) is
greater than the values in approvedVersionDetails.

In pdfService `checkAndUpdateVersion`:

- isNewTemplate => call `licenceService.update`
- isNewVersion || isNewTemplate => call `licenceService.saveApprovedLicenceVersion`

What does licenceService.update do?

1. uses getUpdatedLicence to create an in memory copy of rawLicence.licence using

```ecmascript 6
{
    licence: originalLicence.licence,
    fieldMap: [{ decision: {} }],
    userInput: { decision: template },
    licenceSection: 'document',
    formName: 'template'
}
```

as input. What does that do?
returns

```ecmascript 6
{
 ...licence,
 document: {
   ...licence.document,
   template: userInput.decision // ie template.
 }
}
```

In other words it makes a copy of licence with licence.document.template set to the passed template (name)

2. If applying the changes does not change licence then return
3. Store the new state of licence using licenceClient.updateLicence
4. call updateModificationStage to... check and optionally update licences.stage.

updateModificationStage details:
if noModify do nothing

if stage is 'DECIDED' or 'MODIFIED' then
if requiresApproval then
stage := MODIFIED_APPROVAL

else if stage is 'DECIDED' then
stage := MODIFIED

In this case the call to licenceService.update from pdfService has config.noModfy: true, so it does... nothing.

To summarize, if the template name changes then the new name is persisted in licences.licence at document.template.
That's all that the licenceService.update call does in this situation.

And to summarize `checkAndUpdateVersion`:

1. if the template name changes store the new name in licences.licence.document.template.
2. if the template name changed or there's no licence_versions or the licences versions are newer than the current licence_versions
   copy the current state of licences to licence_versions.

This means that every call to `getPdfLicenceData(templateName, bookingId, rawLicence, token, postRelease)`
will take a snapshot of the current state of the licences row for the booking iff the template name has changed
or there is no snapshot or the licence has been changed since the last snapshot.

Provided that no further changes are made to the licences row (by updateLicence or updateSection in licenceClient.ts)
then every subsequent call to getPdfLicenceData will have no effect on snapshots or licence versions.

Any call to updateLicence or updateSection will bump the licence version (once) so that the next call to
getLicencePdfData will take a new snapshot.

Blimey.

#### Aside - other updates to licences record

There are a number of calls to the updateLicence and updateSection functions in licenceClient.ts
All calls to licenceClient.ts' updateLicence function are from licenceService.ts
Calls to updateSection are in licenceService.ts, routes/address.js, routes/curfew.js (licenceService.ts declares
a function 'updateSection that just delegates to updateSection in licenceClient.ts )

The key related function in licencesService.js is update. This function is called from formPost in server/routes/routeWorkers/standard.js
This means that update is called pretty much whenever a task is updated. See previous discussion about this.

#### Uses of getPdfLicenceData, getPdfLicenceDataAndUpdateLicenceType and updateLicenceTypeFields from pdfService.js

All calls to these functions come from routes/pdf.js

### routes/pdf.js

GET /selectLicenceType/:bookingId
POST /selectLicenceType/:bookingId { offenceBeforeCutoff, licenceTypeRadio }
GET /taskList/:templateName/:bookingId
GET /missing/:section/:templateName/:bookingId
GET /create/:templateName/:bookingId
