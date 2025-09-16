import i18n from '../locales/index.js'
import { tgBotService } from '../services/index.js'

export function defineLanguageCommand() {
  const languageMenu = tgBotService.createMenu('language', {
    autoAnswer: false,
  })
  languageMenu.text(i18n.t('language.zh'), async (ctx) => {
    tgBotService.updateSession(ctx, { languageCode: 'zh' })
    ctx.i18n.changeLanguage('zh')
    ctx.answerCallbackQuery({ text: ctx.i18n.t('language.updated') })
  })
  languageMenu.text(i18n.t('language.en'), async (ctx) => {
    tgBotService.updateSession(ctx, { languageCode: 'en' })
    ctx.i18n.changeLanguage('en')
    ctx.answerCallbackQuery({ text: ctx.i18n.t('language.updated') })
  })
  tgBotService.use(languageMenu)
  tgBotService.defineCommand({
    command: 'language',
    description: i18n.t('language.description'),
    callback: async (ctx) => {
      ctx.reply(ctx.i18n.t('language.message'), { reply_markup: languageMenu })
    },
  })
}
