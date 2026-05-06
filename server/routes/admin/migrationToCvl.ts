
import { asyncMiddleware, authorisationMiddleware } from '../../utils/middleware'
import { HdcService } from '../../services/hdc/hdcService'

const logger = require('../../../log')

export = (hdcService: HdcService) => (router) => {
    router.use(authorisationMiddleware)

    router.get(
        '/licence/:licenceId',
        asyncMiddleware(async (req, res) => {
            const licenceId = Number(req.params.licenceId)
            await hdcService.migrateToCvl(licenceId)

            return res.render('admin/migrateToCvl/licenceMigrated', {licenceId})
        })
    )

    router.get(
        '/batch',
        asyncMiddleware(async (req, res) => {
            const migrationPromise = hdcService.migrateBatchToCvl()

            try {

                const timeoutPromise = new Promise<'still-running'>((resolve) => {
                    setTimeout(() => resolve('still-running'), 60000)
                })

                const result = await Promise.race([
                    migrationPromise.then(() => 'completed' as const),
                    timeoutPromise
                ])

                if (result === 'completed') {
                    return res.render('admin/migrateToCvl/batchFinished')
                }

                migrationPromise.catch((error) => {
                    logger.error('Background migration failed', error)
                })

                return res.render('admin/migrateToCvl/batchStarted')
            } catch (error) {
                let message = 'Unknown error'
                if (error instanceof Error) {
                    message = error.message
                }
                logger.error('Migration failed before timeout', error)
                return res.render('admin/migrateToCvl/batchFailed', {message})
            }
        })
    )

    return router
}
