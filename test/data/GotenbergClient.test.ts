import pdfParse from 'pdf-parse'

import { GotenbergClient } from '../../server/data/gotenbergClient'

describe.skip('Gotenberg API', () => {
  const client = new GotenbergClient('http://localhost:3001')
  describe('renderPdf from string', () => {
    it('should render', async () => {
      const pdf = await client.renderPdfFromHtml(
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>My PDF</title></head><body><h1>Hello world!</h1></body></html>'
      )
      const pdfText = await pdfParse(pdf)
      expect(pdfText.text).toContain('Hello world!')
    })
  })
})
