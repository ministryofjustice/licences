const appInsights = require('./azure-appinsights')
// eslint-disable-next-line import/order
const winston = require('winston')

const { combine, colorize, simple, timestamp, json, prettyPrint } = winston.format
const { flattenMeta } = require('./server/misc')

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'grey',
})

const flattened = winston.format((meta) => {
  const { message, level, timestamp: ts, ...rest } = meta
  const result = flattenMeta(rest)
  Object.entries(result).forEach(([key, val]) => {
    // eslint-disable-next-line no-param-reassign
    meta[key] = val
  })
  return meta
})

const format =
  process.env.NODE_ENV === 'test'
    ? combine(timestamp(), colorize(), simple(), prettyPrint())
    : combine(timestamp(), flattened(), json())

const logger = winston.createLogger({
  format,
  transports: [new winston.transports.Console({ level: 'info', handleExceptions: true })],
})

if (appInsights) {
  logger.info('Application insights logger is active')
}

module.exports = logger
