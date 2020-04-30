import * as R from 'ramda'
import * as Joi from 'joi'
import { asyncMiddleware, authorisationMiddleware } from '../../utils/middleware'
import { FunctionalMailboxService, LdusWithTeamsMap } from '../../../types/probationTeams'

const objectToSortedList = R.pipe(
  R.toPairs,
  R.map(([key, value]) => ({ ...value, code: key })),
  R.sortWith([R.ascend(R.propOr('', 'description')), R.ascend(R.prop('code'))])
)

export const lduWithTeamsMapToView = (ldus: LdusWithTeamsMap) =>
  objectToSortedList(ldus).map((ldu) => ({
    ...ldu,
    probationTeams: ldu.probationTeams ? objectToSortedList(ldu.probationTeams) : [],
  }))

const codeSchema = Joi.string()
  .trim()
  .required()
  .regex(/^[0-9A-Z_]{1,10}$/)

const lduFmbSchema = Joi.object({
  probationAreaCode: codeSchema,
  lduCode: codeSchema,
  // functionalMailbox - absence indicates that the FMB should be deleted
  functionalMailbox: Joi.string().trim().allow('').email().label('Functional Mailbox'),
})

const probationTeamFmbSchema = Joi.object({
  probationAreaCode: codeSchema,
  lduCode: codeSchema,
  teamCode: codeSchema,
  // functionalMailbox - absence indicates that the FMB should be deleted
  functionalMailbox: Joi.string().trim().allow('').email().label('Functional Mailbox'),
})

export const validateLduFmb = (probationAreaCode, lduCode, functionalMailbox) =>
  Joi.validate({ probationAreaCode, lduCode, functionalMailbox }, lduFmbSchema, { abortEarly: false })

export const validateProbationTeamFmb = (probationAreaCode, lduCode, teamCode, functionalMailbox) =>
  Joi.validate({ probationAreaCode, lduCode, teamCode, functionalMailbox }, probationTeamFmbSchema, {
    abortEarly: false,
  })

export const functionalMailboxRouter = (functionalMailboxService: FunctionalMailboxService) => (router, audited) => {
  router.use(authorisationMiddleware)

  router.get(
    '/probationAreas',
    asyncMiddleware(async (req, res) => {
      const probationAreas = await functionalMailboxService.getAllProbationAreas()
      res.render('admin/functionalMailboxes/probationAreas', { probationAreas })
    })
  )

  router.get(
    '/probationAreas/:probationAreaCode/ldus',
    asyncMiddleware(async (req, res) => {
      const { probationAreaCode } = req.params
      const ldus = (await functionalMailboxService.getLdusForProbationArea(probationAreaCode)) || {}
      const viewData = {
        probationAreaCode,
        ldus: objectToSortedList(ldus),
      }
      res.render('admin/functionalMailboxes/ldus', viewData)
    })
  )

  router.get(
    '/probationAreas/:probationAreaCode/ldus/:lduCode',
    asyncMiddleware(async (req, res) => {
      const { probationAreaCode, lduCode } = req.params
      const lduWithTeams = await functionalMailboxService.getLduWithTeams(probationAreaCode, lduCode)
      lduWithTeams.probationTeams = objectToSortedList(lduWithTeams.probationTeams)
      const viewData = {
        probationAreaCode,
        lduCode,
        ...lduWithTeams,
        success: req.flash('success'),
        errors: req.flash('errors'),
      }
      res.render('admin/functionalMailboxes/lduWithTeams', viewData)
    })
  )

  router.post(
    '/probationAreas/:probationAreaCode/ldus/:lduCode',
    asyncMiddleware(async (req, res) => {
      const {
        body: { functionalMailbox },
        params: { lduCode, probationAreaCode },
      } = req
      const { error, value } = validateLduFmb(probationAreaCode, lduCode, functionalMailbox)
      if (error) {
        req.flash('errors', error.details[0])
      } else {
        await functionalMailboxService.updateLduFunctionalMailbox(probationAreaCode, lduCode, value.functionalMailbox)
        if (value.functionalMailbox) {
          req.flash('success', `Updated functional mailbox for LDU ${lduCode} to "${value.functionalMailbox}"`)
        } else {
          req.flash('success', `Deleted functional mailbox for LDU ${lduCode}`)
        }
      }
      res.redirect(`/admin/functionalMailboxes/probationAreas/${probationAreaCode}/ldus/${lduCode}`)
    })
  )

  router.post(
    '/probationAreas/:probationAreaCode/ldus/:lduCode/probationTeams/:teamCode',
    asyncMiddleware(async (req, res) => {
      const {
        body: { functionalMailbox },
        params: { lduCode, probationAreaCode, teamCode },
      } = req
      const { error, value } = validateProbationTeamFmb(probationAreaCode, lduCode, teamCode, functionalMailbox)
      if (error) {
        req.flash('errors', error.details[0])
      } else {
        await functionalMailboxService.updateProbationTeamFunctionalMailbox(
          probationAreaCode,
          lduCode,
          teamCode,
          value.functionalMailbox
        )
        if (value.functionalMailbox) {
          req.flash(
            'success',
            `Updated functional mailbox for Probation Team ${teamCode} to "${value.functionalMailbox}"`
          )
        } else {
          req.flash('success', `Deleted functional mailbox for Probation Team ${teamCode}`)
        }
      }
      res.redirect(`/admin/functionalMailboxes/probationAreas/${probationAreaCode}/ldus/${lduCode}`)
    })
  )

  return router
}
