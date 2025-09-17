import { dirname } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import logger from './common/logger.js'
import { setupI18n } from './locales/index.js'
import { tgBotService } from './services/index.js'
import 'reflect-metadata'
import './commands/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

globalThis.__dirname = __dirname
globalThis.__filename = __filename

async function bootstrap() {
  setupI18n()
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection at:', reason)
  })

  tgBotService.run()
  logger.info('Bot started')
}

bootstrap()
