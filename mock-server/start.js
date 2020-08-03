/* eslint-disable no-console */
const http = require('http')
const app = require('./app')

const port = process.env.PORT || '8080'
app.set('port', port)

const server = http.createServer(app)

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`${port} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(`${port} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

function onListening() {
  const addr = server.address()
  console.log(`Started`, addr)
}
