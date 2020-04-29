import * as R from 'ramda'
import { asyncMiddleware, authorisationMiddleware } from '../../utils/middleware'
import { FunctionalMailboxService, LduMap, LdusWithTeamsMap } from '../../../types/probationTeams'

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
    '/probationAreas/:probationAreaCode/ldusAndTeams',
    asyncMiddleware(async (req, res) => {
      const ldusWithTeams =
        (await functionalMailboxService.getLdusAndTeamsForProbationArea(req.params.probationAreaCode)) || {}
      const viewData = lduWithTeamsMapToView(ldusWithTeams)
      viewData.msg = req.flash('success')
      res.render('admin/functionalMailboxes/ldusAndTeams', viewData)
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
        msg: req.flash('success'),
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
        lduWithTeams,
        // msg: req.flash('success'),
      }
      res.render('admin/functionalMailboxes/lduWithTeams', viewData)
    })
  )

  return router
}
