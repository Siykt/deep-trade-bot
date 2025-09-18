import process from 'node:process'
import { config } from 'dotenv'

let appHost = process.env.APP_HOST ?? 'http://127.0.0.1'

if (!appHost.startsWith('http')) {
  appHost = `https://${appHost}`
}

config()

export const ENV = {
  // logger
  LOGGER_DIR_PATH: process.env.LOGGER_DIR_PATH ?? './',

  // Telegram
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? '',

  // server auth
  SERVER_AUTH_PASSWORD: process.env.SERVER_AUTH_PASSWORD ?? 'SERVER_AUTH_PASSWORD',

  // ton center
  TON_CENTER_API_KEY: process.env.TON_CENTER_API_KEY ?? '',
  TON_WALLETS_APP_MANIFEST_URL: process.env.TON_WALLETS_APP_MANIFEST_URL ?? '',

  // socks proxy
  SOCKS_PROXY_HOST: process.env.SOCKS_PROXY_HOST ?? '',
  SOCKS_PROXY_PORT: process.env.SOCKS_PROXY_PORT ?? '',

  // web3
  MNEMONIC: process.env.MNEMONIC ?? '',
  ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY ?? '',

  // coin_ift
  COIN_IFT_API_URL: process.env.COIN_IFT_API_URL ?? '',

  // chatgpt
  CHATGPT_BASE_URL: process.env.CHATGPT_BASE_URL,
  CHATGPT_DEFAULT_MODEL: process.env.CHATGPT_DEFAULT_MODEL ?? '',
  CHATGPT_API_KEY: process.env.CHATGPT_API_KEY ?? '',
}
