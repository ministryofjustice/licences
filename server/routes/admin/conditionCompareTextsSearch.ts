import { firstItem } from '../../utils/functionalHelpers'
import { Request, Router } from 'express'
import { HdcService, LicenceDiff } from '../../services/hdc/hdcService'

const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')
const logger = require('../../../log')

function getSingleValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  //NO SQL injection, please
  const cleaned = value
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9_]/gi, '')

  return cleaned || undefined
}

function getIdsFromReq(req: Request) {
  let idFrom = Number(getSingleValue(req.body?.idFrom ?? req.query?.idFrom) ?? 0)
  let idTo = Number(getSingleValue(req.body?.idTo ?? req.query?.idTo) ?? 100)
  const codeFilter = getSingleValue(req.body?.codeFilter ?? req.query?.codeFilter)
  const versionRaw = getSingleValue(req.body?.version ?? req.query?.version)
  const version = versionRaw ? Number(versionRaw) : undefined

  if (req.body?.action === 'Next') {
    const rangeSize = idTo - idFrom
    idFrom = idTo + 1
    idTo = idFrom + rangeSize
  }

  return { idFrom, idTo, codeFilter, version }
}

async function fetchLicenceResults(hdcService: HdcService, req: Request): Promise<LicenceDiff[]> {
  const { idFrom, idTo, codeFilter, version } = getIdsFromReq(req)
  return hdcService.compareConditions(idFrom, idTo, codeFilter, version)
}

export = (hdcService: HdcService) => (router: Router, audited: any) => {
  router.use(authorisationMiddleware)

  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      const errors = firstItem(req.flash('errors')) || {}

      // Use session results if available
      let result = Array.isArray(req.session!.searchResults) ? req.session!.searchResults : []

      // If session empty, fetch from service
      if (!result.length) {
        const licenceDiffs = await fetchLicenceResults(hdcService, req)
        result = Array.isArray(licenceDiffs) ? licenceDiffs : []
      }

      // Reset
      req.session!.searchResults = undefined

      const { idFrom, idTo, codeFilter, version } = getIdsFromReq(req)

      logger.info({ idFrom, idTo, count: result.length }, 'GET search for licences')

      return res.render('admin/licences/conditionCompareTextsSearch', {
        errors,
        result,
        idFrom,
        idTo,
        codeFilter,
        version,
      })
    })
  )

  router.post(
    '/',
    audited,
    asyncMiddleware(async (req, res) => {
      const licenceDiffs = await fetchLicenceResults(hdcService, req)
      let { idFrom, idTo, codeFilter, version } = getIdsFromReq(req)

      if (!licenceDiffs.length) {
        req.flash('errors', { id: `Could not find mismatched conditions` })
      }

      // Store results
      req.session!.searchResults = licenceDiffs

      const queryParams = `?idFrom=${idFrom}&idTo=${idTo}${codeFilter ? `&codeFilter=${codeFilter}` : ''} ${version ? `&version=${version}` : ''}`
      return res.redirect(`/admin/conditionCompareTextsSearch${queryParams}`)
    })
  )

  return router
}
