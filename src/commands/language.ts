import { languages } from '../locales/index.js'
import { tgBotService } from '../services/index.js'

export function defineLanguageCommand() {
  const languageMenu = tgBotService.createMenu('language', {
    autoAnswer: false,
  })

  languages.forEach((language) => {
    languageMenu.text(language.name, async (ctx) => {
      tgBotService.updateSession(ctx, { languageCode: language.code })
      ctx.i18n.changeLanguage(language.code)
      ctx.answerCallbackQuery({ text: ctx.i18n.t('language.updated') })
    })
  })

  tgBotService.use(languageMenu)
  tgBotService.defineCommand({
    command: 'language',
    i18n: true,
    description: 'language.description',
    callback: async (ctx) => {
      ctx.reply(ctx.i18n.t('language.message'), { reply_markup: languageMenu })
    },
  })
}
