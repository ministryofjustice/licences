import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
  allowlist: {
    'node_modules/@parcel/watcher@2.5.1': 'ALLOW',
    'node_modules/@scarf/scarf@1.4.0': 'FORBID',
    'node_modules/fsevents@2.3.3': 'ALLOW',
    'node_modules/unrs-resolver@1.11.1': 'ALLOW',
  },
})
