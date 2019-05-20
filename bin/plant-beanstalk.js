const fs = require('fs')
const path = require('path')
const AdmZip = require('adm-zip')

const version = process.argv[2]

if (!version) {
  throw new Error('Missing <version> argument')
}

const dockerrun = {
  AWSEBDockerrunVersion: '1',
  Image: {
    Name: `mojdigitalstudio/licences:${version}`,
    Update: 'true',
  },
  Ports: [{ ContainerPort: '3000' }],
}

const output = JSON.stringify(dockerrun, null, 2)

fs.writeFileSync(path.resolve(__dirname, '../Dockerrun.aws.json'), output)

const zip = new AdmZip()
zip.addLocalFile(`${__dirname}/../Dockerrun.aws.json`)
zip.addLocalFile(`${__dirname}/../.ebextensions/nginx.config`, '.ebextensions')
zip.writeZip(`${__dirname}/../deploy.zip`)
