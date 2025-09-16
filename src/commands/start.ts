import { CONFIG } from '../constants/config.js'
import i18n from '../locales/index.js'
import { coinIFTService, tgBotService } from '../services/index.js'

export function defineStartCommand() {
  const startMenu = tgBotService.createMenu('start')
  const searchTradePairMenu = tgBotService.createMenu('searchTradePair')
  const analysisMenu = tgBotService.createMenu('analysis', {
    autoAnswer: false,
  })

  analysisMenu.text(i18n.t('analysis.realtime'), async (ctx) => {
    ctx.answerCallbackQuery({ text: i18n.t('analysis.loading') })
    const response = await coinIFTService.getWhaleAnalysis('BTC', coinIFTService.type.Realtime)
    ctx.reply(response.data.message)
  }).row()

  analysisMenu.text(i18n.t('analysis.intraday'), async (ctx) => {
    ctx.answerCallbackQuery({ text: i18n.t('analysis.loading') })
    const response = await coinIFTService.getWhaleAnalysis('BTC', coinIFTService.type.Intraday)
    ctx.reply(response.data.message)
  }).row()

  analysisMenu.text(i18n.t('analysis.longterm'), async (ctx) => {
    ctx.answerCallbackQuery({ text: i18n.t('analysis.loading') })
    const response = await coinIFTService.getWhaleAnalysis('BTC', coinIFTService.type.Longterm)
    ctx.reply(response.data.message)
  })

  Object.entries(CONFIG.TRADE_PAIRS).forEach(([key], i) => {
    searchTradePairMenu.text(key, async (ctx) => {
      tgBotService.updateSession(ctx, {
        state: 'none',
        pair: key,
      })
      ctx.reply(i18n.t('analysis.selectType', { pair: key }), { reply_markup: analysisMenu })
    })
    if (i % 2) {
      searchTradePairMenu.row()
    }
  })
  searchTradePairMenu.text(i18n.t('analysis.others'), async (ctx) => {
    tgBotService.updateSession(ctx, {
      state: 'searchTradePair',
    })
    ctx.reply(i18n.t('analysis.inputPair'))
  })

  // startMenu.text(i18n.t('analysis.multiSinglePopularity'), async (ctx) => {
  //   tgBotService.updateSession(ctx, {
  //     state: 'none',
  //     pair: 'BTC',
  //   })
  //   ctx.reply(i18n.t('analysis.selectType'), { reply_markup: analysisMenu })
  // })

  // startMenu.text(i18n.t('analysis.emptyPopularity'), async (ctx) => {
  //   tgBotService.updateSession(ctx, {
  //     state: 'none',
  //     pair: 'BTC',
  //   })
  //   ctx.reply(i18n.t('analysis.selectType'), { reply_markup: analysisMenu })
  // }).row()

  startMenu.text(i18n.t('analysis.tradeAnalysis'), async (ctx) => {
    ctx.reply(i18n.t('analysis.tradeAnalysisDescription'), { reply_markup: searchTradePairMenu })
  })

  startMenu.register(searchTradePairMenu)
  searchTradePairMenu.register(analysisMenu)
  tgBotService.use(startMenu)
  tgBotService.defineCommand({
    command: 'start',
    description: i18n.t('command.start.description'),
    callback: async (ctx) => {
      ctx.reply(i18n.t('analysis.description'), { reply_markup: startMenu })
    },
  })

  tgBotService.on('message').filter((ctx) => {
    return ctx.msg.chat.type === 'private' && ctx.session.state === 'searchTradePair'
  }, async (ctx) => {
    const pair = ctx.msg.text?.trim().toUpperCase()
    if (!pair) {
      ctx.reply(i18n.t('analysis.invalidInput'))
      return
    }

    tgBotService.updateSession(ctx, {
      state: 'none',
      pair,
    })
    ctx.reply(i18n.t('analysis.selectType', { pair }), { reply_markup: analysisMenu })
  })
}
