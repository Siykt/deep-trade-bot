import type { WhaleAnalysisType } from '../services/external/coinIFT.js'
import type { TGBotContext } from '../services/tg/tg-bot.service.js'
import logger from '../common/logger.js'
import { CONFIG } from '../constants/config.js'
import { chatGPTService, coinIFTService, tgBotService, userService } from '../services/index.js'

const startMenu = tgBotService.createMenu('start')
const searchTradePairMenu = tgBotService.createMenu('searchTradePair')
const analysisMenu = tgBotService.createMenu('analysis', {
  autoAnswer: false,
})
const analysisResultMenu = tgBotService.createMenu('analysisResult')
const notEnoughBalanceMenu = tgBotService.createMenu('notEnoughBalance')

async function answerWhaleAnalysis(ctx: TGBotContext, type: WhaleAnalysisType) {
  if (!ctx.session.pair) {
    ctx.answerCallbackQuery({ text: ctx.i18n.t('analysis.invalidInput') })
    return
  }

  if (!coinIFTService.isEnoughCost(ctx.session.user)) {
    ctx.answerCallbackQuery({ text: ctx.i18n.t('analysis.balanceNotEnoughTip') })
    ctx.reply(ctx.i18n.t('analysis.balanceNotEnough'), { reply_markup: notEnoughBalanceMenu })
    return
  }

  ctx.answerCallbackQuery({ text: ctx.i18n.t('analysis.loading') })
  ctx.react('👌')
  if (!ctx.session.user.isVip) {
    await tgBotService.updateSessionUserCoins(ctx, -CONFIG.COST.ANALYSIS)
  }

  try {
    let { result } = await coinIFTService.getWhaleAnalysisAndRecord(ctx.session.user, ctx.session.pair, type)
    if (ctx.session.languageCode !== 'zh') {
      result = await chatGPTService.translate(result, 'zh', ctx.session.languageCode as string)

      // 将en中的Market Maker替换成Whale，不区分大小写
      result = result.replace(/market maker/gi, 'Whale')
    }

    result = `${ctx.i18n.t(`analysis.result.${type}`)}\n\n${result}`
    logger.info(`analysisResult: ${result}`)
    tgBotService.updateSession(ctx, { analysisResult: result })
    ctx.editMessageText(result, { reply_markup: analysisResultMenu })
    ctx.react('🐳')
  }
  catch (error) {
    logger.error(`[TgGenerationService] answerWhaleAnalysis: ${error}`)
    // 退回金币
    if (!ctx.session.user.isVip) {
      await tgBotService.updateSessionUserCoins(ctx, CONFIG.COST.ANALYSIS)
    }
    ctx.react('💔')
  }
}

async function inviteStart(ctx: TGBotContext, code: string) {
  try {
    const user = await userService.findByIdOrThrow(ctx.session.user.id)
    const ancestor = await userService.createInviteRelation(user, code)
    await userService.updateCoins(ancestor.id, CONFIG.COST.INVITE)
    tgBotService.forceUpdateSession(ancestor.telegramId)
    // ctx.api.sendMessage(ancestor.telegramId, `Invite success, you will receive ${CONFIG.COST.INVITE}💗 rewards!`)
  }
  catch (error) {
    logger.error(`[TgGenerationService] inviteStart: ${error}`)
  }
}

export function defineStartCommand() {
  analysisMenu.dynamic(async (ctx, analysisMenu) => {
    analysisMenu.text(ctx.i18n.t('analysis.realtime'), async (ctx) => {
      await answerWhaleAnalysis(ctx, coinIFTService.type.Realtime)
    }).row()

    analysisMenu.text(ctx.i18n.t('analysis.intraday'), async (ctx) => {
      await answerWhaleAnalysis(ctx, coinIFTService.type.Intraday)
    }).row()

    analysisMenu.text(ctx.i18n.t('analysis.longterm'), async (ctx) => {
      await answerWhaleAnalysis(ctx, coinIFTService.type.Longterm)
    })
  })

  Object.entries(CONFIG.TRADE_PAIRS).forEach(([key], i) => {
    searchTradePairMenu.text(key, async (ctx) => {
      tgBotService.updateSession(ctx, {
        state: 'none',
        pair: key,
        analysisResult: '',
      })
      ctx.editMessageText(ctx.i18n.t('analysis.selectType', { pair: key }), { reply_markup: analysisMenu })
    })
    if (i % 2) {
      searchTradePairMenu.row()
    }
  })

  searchTradePairMenu.dynamic(async (ctx, searchTradePairMenu) => {
    searchTradePairMenu.text(ctx.i18n.t('analysis.others'), async (ctx) => {
      tgBotService.updateSession(ctx, {
        analysisResult: '',
      })
      ctx.reply(ctx.i18n.t('analysis.inputPair'))
    })
  })

  startMenu.dynamic(async (ctx, startMenu) => {
    // startMenu.text(ctx.i18n.t('analysis.multiSinglePopularity'), async (ctx) => {
    //   tgBotService.updateSession(ctx, {
    //     state: 'none',
    //     pair: 'BTC',
    //   })
    //   ctx.reply(ctx.i18n.t('analysis.selectType'), { reply_markup: analysisMenu })
    // })

    // startMenu.text(ctx.i18n.t('analysis.emptyPopularity'), async (ctx) => {
    //   tgBotService.updateSession(ctx, {
    //     state: 'none',
    //     pair: 'BTC',
    //   })
    //   ctx.reply(ctx.i18n.t('analysis.selectType'), { reply_markup: analysisMenu })
    // }).row()

    startMenu.text(ctx.i18n.t('analysis.tradeAnalysis'), async (ctx) => {
      ctx.reply(ctx.i18n.t('analysis.tradeAnalysisDescription'), { reply_markup: searchTradePairMenu })
    })
  })

  analysisResultMenu.dynamic(async (ctx, analysisResultMenu) => {
    analysisResultMenu.text(ctx.i18n.t('analysis.result.backToAnalysis'), async (ctx) => {
      ctx.editMessageText(ctx.i18n.t('analysis.description', { botName: tgBotService.botInfo.username }), { reply_markup: searchTradePairMenu })
    }).row()
    analysisResultMenu.switchInline(ctx.i18n.t('analysis.result.share'), ctx.session.analysisResult)
  })

  notEnoughBalanceMenu.dynamic(async (ctx, notEnoughBalanceMenu) => {
    notEnoughBalanceMenu.text(ctx.i18n.t('analysis.upgrade'), async (ctx, next) => {
      tgBotService.dispatchCommand(ctx, next, 'balance')
    }).row()
    notEnoughBalanceMenu.text(ctx.i18n.t('analysis.invitation', { cost: CONFIG.COST.INVITE }), (ctx, next) => {
      tgBotService.dispatchCommand(ctx, next, 'invitation')
    })
  })

  // startMenu.register(searchTradePairMenu)
  searchTradePairMenu.register(analysisMenu)
  analysisMenu.register(analysisResultMenu)
  analysisMenu.register(notEnoughBalanceMenu)
  tgBotService.use(searchTradePairMenu)
  tgBotService.defineCommand({
    command: 'start',
    i18n: true,
    description: 'command.start.description',
    callback: async (ctx) => {
      const payload = ctx.match?.toString()
      if (payload) {
        const { type, params } = tgBotService.parserStartParam<[string]>(payload)
        switch (type) {
          case 'i':
            await inviteStart(ctx, params[0])
            break
        }
      }

      ctx.reply(ctx.i18n.t('analysis.description', { botName: tgBotService.botInfo.username }), { reply_markup: searchTradePairMenu })
    },
  })

  tgBotService.on('message').filter((ctx) => {
    const message = ctx.msg
    if (!message || !message.text) {
      return false
    }

    // 非命令
    if (message.text.includes('/')) {
      return false
    }

    // 仅私聊
    if (ctx.msg.chat.type !== 'private') {
      return false
    }

    return true
  }, async (ctx) => {
    const pair = ctx.msg.text?.trim().toUpperCase()
    if (!pair) {
      ctx.reply(ctx.i18n.t('analysis.invalidInput'))
      return
    }

    tgBotService.updateSession(ctx, {
      analysisResult: '',
      pair,
    })
    ctx.reply(ctx.i18n.t('analysis.selectType'), { reply_markup: analysisMenu })
  })
}
