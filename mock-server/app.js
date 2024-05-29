/* eslint-disable no-param-reassign */
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const authUserRouter = require('./routes/authuser')
const oauthRouter = require('./routes/oauth')
const sentencesRouter = require('./routes/sentences')
const bookingsRouter = require('./routes/bookings')
const personsRouter = require('./routes/persons')
const movementsRouter = require('./routes/movements')
const prisonersRouter = require('./routes/prisoners')
const imagesRouter = require('./routes/image')
const relationshipsRouter = require('./routes/relationships')
const agenciesRouter = require('./routes/agencies')
const deliusRouter = require('./routes/delius')
const probationteamsRouter = require('./routes/probationteams')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`)
  next()
})

app.use('/', indexRouter)
app.use('/prisonApi/api/oauth', oauthRouter)
app.use('/prisonApi/api/users', usersRouter)
app.use('/prisonApi/api/offender-sentences', sentencesRouter)
app.use('/prisonApi/api/bookings', bookingsRouter)
app.use('/prisonApi/api/persons', personsRouter)
app.use('/prisonApi/api/images', imagesRouter)
app.use('/prisonApi/api/offender-relationships', relationshipsRouter)
app.use('/prisonApi/api/agencies', agenciesRouter)
app.use('/prisonApi/api/movements', movementsRouter)
app.use('/prisonApi/api/prisoners', prisonersRouter)

app.use('/manageUsersApi', authUserRouter)

app.use('/delius', deliusRouter)
app.use('/probationteams', probationteamsRouter)

app.get('/prisonApi/health/ping', (req, res) => {
  res.send({ status: 'UP' })
})

app.get('/probationteams/health/ping', (req, res) => {
  res.send({ status: 'UP' })
})

app.get('/manageUsersApi/health/ping', (req, res) => {
  res.send({ status: 'UP' })
})

app.get('/delius/health/ping', (req, res) => {
  res.send('pong')
})

app.get('/prisonApi/ping', (req, res) => {
  res.send('pong')
})

app.get('/manageUsersApi/ping', (req, res) => {
  res.send('pong')
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  console.log()
  console.log('UNMATCHED:')
  console.log(req.method)
  console.log(req.originalUrl)
  console.log(req.body)
  console.log(req.headers)

  const e = Error()
  // @ts-ignore
  e.status = 404
  next(e)
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send(err)
})

module.exports = app
