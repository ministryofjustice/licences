#!/usr/bin/env node
const fs = require('fs').promises
const { Client } = require('pg')
const config = require('./config')

const fname = process.argv[2]

if (!fname) {
  console.log('Provide a filename to load licences data from')
  process.exit(1)
}

const client = new Client({
  user: config.db.username,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
  host: config.db.server,
  ssl: config.db.sslEnabled === 'true',
})

const readJson = async () => {
  const fh = await fs.open(`${fname}`, 'r')
  const json = await fh.readFile({ encoding: 'utf-8' })
  await fh.close()
  return JSON.parse(json)
}

const writeRow = (row) =>
  client.query(
    'insert into licences (id, licence, booking_id, stage, version, transition_date, vary_version) values ($1, $2, $3, $4, $5, $6, $7)',
    [row.id, row.licence, row.booking_id, row.stage, row.version, row.transition_date, row.vary_version]
  )

const writeTable = async (rows) => {
  await client.connect()
  await client.query('truncate licences')
  await rows.reduce((p, row) => p.then(() => writeRow(row)), Promise.resolve())
  return client.end()
}

const load = async () => {
  const rows = await readJson()
  return writeTable(rows)
}

load()
