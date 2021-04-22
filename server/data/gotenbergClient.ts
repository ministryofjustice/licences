import superagent from 'superagent'
import { buildErrorHandler } from './clientErrorHandler'

const handleError = buildErrorHandler('Gotenberg API')

export type PdfOptions = {
  headerHtml?: string
  footerHtml?: string
  marginTop?: string
  marginBottom?: string
  marginLeft?: string
  marginRight?: string
}

export class GotenbergClient {
  private gotenbergHost: string

  constructor(gotenbergHost: string) {
    this.gotenbergHost = gotenbergHost
  }

  async renderPdfFromHtml(html: String, options: PdfOptions = {}): Promise<Buffer> {
    const { headerHtml, footerHtml, marginBottom, marginLeft, marginRight, marginTop } = options
    try {
      const request = superagent
        .post(`${this.gotenbergHost}/convert/html`)
        .attach('files', Buffer.from(html), 'index.html')
        .responseType('blob')

      if (headerHtml) request.attach('files', Buffer.from(headerHtml), 'header.html')
      if (footerHtml) request.attach('files', Buffer.from(footerHtml), 'footer.html')
      // Gotenberg defaults to A4 format. Page size and margins specified in inches

      if (marginTop) request.field('marginTop', marginTop)
      if (marginBottom) request.field('marginBottom', marginBottom)
      if (marginLeft) request.field('marginLeft', marginLeft)
      if (marginRight) request.field('marginRight', marginRight)

      const response = await request
      return response.body
    } catch (err) {
      handleError(err, this.gotenbergHost)
      return undefined
    }
  }
}
