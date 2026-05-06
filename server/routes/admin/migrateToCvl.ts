
import { asyncMiddleware, authorisationMiddleware } from '../../utils/middleware'
import { HdcService } from '../../services/hdc/hdcService'

const logger = require('../../../log')

export = (hdcService: HdcService) => (router) => {
    router.use(authorisationMiddleware)

    router.get(
        '/licence/:licenceId',
        asyncMiddleware(async (req, res) => {
            const licenceId = Number(req.params.licenceId)
            await hdcService.migrateSingleLicenceToCvl(licenceId)

            return res.render('admin/migrateToCvl/licenceMigrated', {licenceId})
        })
    )

    router.get(
        '/batch',
        asyncMiddleware(async (req, res) => {
            const migrationPromise = hdcService.migrateBatchToCvl()

            let timeoutHandle: NodeJS.Timeout | undefined

            try {
                const timeoutPromise = new Promise<'still-running'>((resolve) => {
                    timeoutHandle = setTimeout(() => resolve('still-running'), 60000)
                })
                const completionPromise = migrationPromise.then(() => 'completed' as const)

                const result = await Promise.race([
                    completionPromise,
                    timeoutPromise,
                ])

                if (result === 'completed') {
                    return res.render('admin/migrateToCvl/batchFinished')
                }

                migrationPromise.catch((error) => {
                    logger.error('Background migration failed', error)
                })

                return res.render('admin/migrateToCvl/batchStarted')
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Unknown error'

                logger.error('Migration failed before timeout', error)

                return res.render('admin/migrateToCvl/batchFailed', { message })
            } finally {
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle)
                }
            }
        })
    )

    return router
}
