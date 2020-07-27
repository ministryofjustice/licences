#!/usr/bin/env node
const fs = require('fs')
const fsp = require('fs').promises
const { Client } = require('pg')
const config = require('./config')

const fname = process.argv[2]

if (!fname) {
  // eslint-disable-next-line no-console
  console.log('Provide a filename to write licences data to')
  process.exit(1)
}

const client = new Client({
  user: config.db.username,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
  host: config.db.server,
  ssl:
    config.db.sslEnabled === 'true'
      ? {
          ca: fs.readFileSync('root.cert'),
          rejectUnauthorized: false,
        }
      : false,
})

const readTable = async () => {
  await client.connect()
  const result = await client.query(
    'select id, licence, booking_id, stage, version, transition_date, vary_version from licences'
  )
  await client.end()
  return JSON.stringify(result.rows, undefined, 2)
}

const writeToFile = async (json) => {
  const fh = await fsp.open(`${fname}.json`, 'w')
  await fh.write(json)
  return fh.close()
}

const doDump = async () => {
  const json = await readTable()
  return writeToFile(json)
}

doDump()
