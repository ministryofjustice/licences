import express from 'express'
import path from 'path'
import request from 'supertest'
import { PDFParse } from 'pdf-parse'

import pdfRenderer from '../../server/utils/renderPdf'
import { GotenbergClient } from '../../server/data/gotenbergClient'

describe('pdfRenderer', () => {
  let app

  beforeEach(() => {
    app = express()
    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'pug')
    app.use(pdfRenderer(new GotenbergClient('http://localhost:3001')))
  })

  it('sets response headers for PDF', () => {
    app.use('/pdf', (req, res) => {
      res.renderPDF('helloWorld', { message: 'Hello World!' }, { filename: 'test.pdf' })
    })

    return request(app)
      .get('/pdf')
      .expect(200)
      .expect('Content-Type', 'application/pdf')
      .expect('Content-Disposition', 'inline; filename=test.pdf')
      .then((response) => {
        expect(Buffer.isBuffer(response.body)).toBe(true)
      })
  })

  it('returns a buffer from the response', () => {
    app.use('/pdf', (req, res) => {
      res.renderPDF('helloWorld', { message: 'Hello World!' }, { filename: 'test.pdf' })
    })

    return request(app)
      .get('/pdf')
      .expect('Content-Transfer-Encoding', 'binary')
      .expect(200)
      .then((response) => {
        expect(Buffer.isBuffer(response.body)).toBe(true)
      })
  })

  it('uses default filename if none set', () => {
    app.use('/pdf', (req, res) => {
      res.renderPDF('helloWorld', { message: 'Hello World!' })
    })

    return request(app).get('/pdf').expect(200).expect('Content-Disposition', 'inline; filename=document.pdf')
  })

  it('passes on error to the next middleware', () => {
    app.use('/pdf', (req, res) => {
      res.renderPDF('non-existant-template', {
        message: 'Hello World!',
      })
    })

    // eslint-disable-next-line no-unused-vars
    app.use((error, req, res, next) => {
      res.status(500).send('Something went wrong')
    })

    return request(app)
      .get('/pdf')
      .expect(500)
      .then((res) => {
        expect(res.text).toBe('Something went wrong')
      })
  })

  it('renders template content into the PDF buffer', async () => {
    app.use('/pdf', (req, res) => {
      res.renderPDF(
        'simple',
        { message: 'variable' },
        { pdfOptions: { headerHtml: '<p>Header</p>', footerHtml: '<p>Footer</p>' } }
      )
    })

    const res = await request(app).get('/pdf')
    const parser = new PDFParse(res.body)
    const pdf = await parser.getText()

    expect(pdf.pages).toBe(1)
    expect(pdf.text).toContain('\nfixed\nvariable')
    expect(pdf.text).toContain('Header')
    expect(pdf.text).toContain('Footer')
  })
})
