import { GotenbergClient, PdfOptions } from '../data/gotenbergClient'
import logger from '../../log'

// eslint-disable-next-line no-unused-vars
export = function pdfRenderer(client: GotenbergClient) {
  return (req, res, next) => {
    res.renderPDF = (
      view,
      pageData,
      options: { filename: string; pdfOptions: PdfOptions } = { filename: 'document.pdf', pdfOptions: {} }
    ) => {
      res.render(view, pageData, (error, html) => {
        if (error) {
          throw error
        }

        res.header('Content-Type', 'application/pdf')
        res.header('Content-Transfer-Encoding', 'binary')
        res.header('Content-Disposition', `inline; filename=${options.filename}`)

        return client
          .renderPdfFromHtml(html, options?.pdfOptions)
          .then((buffer) => res.send(buffer))
          .catch((reason) => {
            logger.warn(reason)
          })
      })
    }
    next()
  }
}
