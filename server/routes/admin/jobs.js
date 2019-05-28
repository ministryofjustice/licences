const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')

module.exports = ({ jobSchedulerService }) => router => {
  router.use(authorisationMiddleware)

  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      return res.render('admin/jobs/list', { jobs: await jobSchedulerService.listJobs() })
    })
  )

  router.post(
    '/cancel',
    asyncMiddleware(async (req, res) => {
      jobSchedulerService.cancelJob(req.body.jobName)
      res.redirect('/admin/jobs')
    })
  )

  router.post(
    '/reschedule',
    asyncMiddleware(async (req, res) => {
      jobSchedulerService.startJob(req.body.jobName)
      res.redirect('/admin/jobs')
    })
  )

  router.post(
    '/update',
    asyncMiddleware(async (req, res) => {
      const { jobName, schedule } = req.body
      await jobSchedulerService.updateJob(jobName, schedule)
      res.redirect('/admin/jobs')
    })
  )

  return router
}
