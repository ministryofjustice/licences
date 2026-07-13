
import { asyncMiddleware, authorisationMiddleware } from '../../utils/middleware'
import { HdcService } from '../../services/hdc/hdcService'
import { Pageable } from '../../@types/hdcApiImport'

const logger = require('../../../log')

export = (hdcService: HdcService) => (router) => {
    router.use(authorisationMiddleware)

    router.get(
        '/hdcToCvlMigration',
        asyncMiddleware(async (req, res) => {
             return res.render('admin/migrateToCvl/main')
        })
    )

    router.get(
        '/licence/:migrateBookingId/migrate',
        asyncMiddleware(async (req, res) => {
            logger.info(`Migrating a licence, booking id : '${req.params.migrateBookingId}'`)
            const bookingId = Number(req.params.migrateBookingId)
            try {
                await hdcService.migrateSingleLicenceToCvl(bookingId)
                return res.render('admin/migrateToCvl/licenceMigrated', {bookingId})
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Unknown error'
                logger.error('Migration failed', error)
                return res.render('admin/migrateToCvl/licenceMigrationFailed', { bookingId, message })
            }
        })
    )

    router.get(
        '/batch',
        asyncMiddleware(async (req, res) => {
               try {
                   await hdcService.migrateBatchToCvl()
                   return res.render('admin/migrateToCvl/batchStarted')
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Unknown error'

                logger.error('Migration failed before timeout', error)

                return res.render('admin/migrateToCvl/batchFailed', { message })
            }
        })
    )

    router.get(
        '/licence/:licenceId/preview',
        asyncMiddleware(async (req, res) => {
            const licenceId = Number(req.params.licenceId)

            try {
                const preview = await hdcService.migrateSingleLicenceToCvlPreview(licenceId)

                return res.json(preview)
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Unknown error'

                logger.error('Preview migration failed', error)

                return res.status(500).json({ message })
            }
        }),
    )

    router.get(
        '/migration-logs',
        asyncMiddleware(async (req, res) => {
            const { licenceVersionId, bookingId, errorSource, success, page, size, sort } = req.query as any
            const pageable: Pageable = {
                page: page ? Number(page) : 0,
                size: size ? Number(size) : 50,
            }
            if (sort) {
                pageable.sort = Array.isArray(sort) ? (sort as string[]) : [sort as string]
            }
            let successFilter : boolean | undefined
            if (success === 'true') {
                successFilter = true
            } else if (success === 'false') {
                successFilter = false
            }

            if (req.query.format === 'csv') {
                let currentPageNumber = 0

                const logs = await hdcService.getMigrationLogs(
                    licenceVersionId ? Number(licenceVersionId) : undefined,
                    bookingId ? Number(bookingId) : undefined,
                    errorSource ? errorSource as string : undefined,
                    successFilter,
                    { page: currentPageNumber, size: 100, sort: pageable.sort }
                )

                const {totalPages} = logs

                const allContent = [...logs.content]

                currentPageNumber +=1

                while (currentPageNumber < totalPages) {
                    // eslint-disable-next-line no-await-in-loop
                    const pageResult = await hdcService.getMigrationLogs(
                        licenceVersionId ? Number(licenceVersionId) : undefined,
                        bookingId ? Number(bookingId) : undefined,
                        errorSource ? errorSource as string : undefined,
                        successFilter,
                        { page: currentPageNumber, size: 100, sort: pageable.sort }
                    )
                    allContent.push(...pageResult.content)
                    currentPageNumber+=1
                }

                const records = await hdcService.getMigrationLogsCsv(allContent)
                res.contentType('text/csv')
                res.set('Content-Disposition', `attachment;filename=migration-logs.csv`)
                return res.send(records)
            }


            const logs = await hdcService.getMigrationLogs(
                licenceVersionId ? Number(licenceVersionId) : undefined,
                bookingId ? Number(bookingId) : undefined,
                errorSource ? errorSource as string : undefined,
                successFilter,
                pageable
            )

            return res.render('admin/migrateToCvl/migrationLogs', {
                logs,
                licenceVersionId,
                bookingId,
                errorSource,
                success,
                page,
                size,
                sort,
            })
        })
    )

    router.get(
        '/retry/:logId/:retryValue',
        asyncMiddleware(async (req, res) => {

            const logId = Number(req.params.logId)
            const retryValue = req.params.retryValue === 'true'

            await hdcService.setMigrationLogRetry(logId, retryValue)

            return res.redirect(
                `/admin/migrateToCvl/migration-logs#log-${logId}`
            )
        })
    )

    return router
}
