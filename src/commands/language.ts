import { tgBotService } from '../services/index.js'

export function defineLanguageCommand() {
  const languageMenu = tgBotService.createMenu('language', {
    autoAnswer: false,
  })

  languageMenu.dynamic(async (ctx, languageMenu) => {
    languageMenu.text(ctx.i18n.t('language.zh'), async (ctx) => {
      tgBotService.updateSession(ctx, { languageCode: 'zh' })
      ctx.i18n.changeLanguage('zh')
      ctx.answerCallbackQuery({ text: ctx.i18n.t('language.updated') })
    })
    languageMenu.text(ctx.i18n.t('language.en'), async (ctx) => {
      tgBotService.updateSession(ctx, { languageCode: 'en' })
      ctx.i18n.changeLanguage('en')
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
