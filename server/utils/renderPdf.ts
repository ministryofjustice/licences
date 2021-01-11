import puppeteer, { LaunchOptions } from 'puppeteer'

async function send(puppeteerOptions, res, options, html) {
  res.header('Content-Type', 'application/pdf')
  res.header('Content-Transfer-Encoding', 'binary')
  res.header('Content-Disposition', `inline; filename=${options.filename}`)

  const browser = await puppeteer.launch(puppeteerOptions)
  const page = await browser.newPage()
  await page.setContent(html)
  const pdf = await page.pdf(options.pdfOptions)
  await browser.close()

  res.send(pdf)
}

// eslint-disable-next-line no-unused-vars
function render(req, res, next, puppeteerOptions) {
  return (view, pageData, options = { filename: 'document.pdf' }) => {
    res.render(view, pageData, (error, html) => {
      if (error) {
        throw error
      }
      return send(puppeteerOptions, res, options, html)
    })
  }
}

export = function pdfRenderer(
  puppeteerOptions: LaunchOptions = { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
) {
  return (req, res, next) => {
    res.renderPDF = render(req, res, next, puppeteerOptions)
    next()
  }
}
