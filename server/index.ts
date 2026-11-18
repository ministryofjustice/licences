import createApp from './app'
import { services } from './services'
import applicationInfo from './applicationInfo'

const app = createApp(services, applicationInfo())

export default app
