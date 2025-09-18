import type { WhaleAnalysisType } from '../services/external/coinIFT.js'
import type { TGBotContext } from '../services/tg/tg-bot.service.js'
import logger from '../common/logger.js'
import { CONFIG } from '../constants/config.js'
import { chatGPTService, coinIFTService, tgBotService, userService } from '../services/index.js'

async function answerWhaleAnalysis(ctx: TGBotContext, type: WhaleAnalysisType) {
  if (!ctx.session.pair) {
    ctx.answerCallbackQuery({ text: ctx.i18n.t('analysis.invalidInput') })
    return
  }

  ctx.answerCallbackQuery({ text: ctx.i18n.t('analysis.loading') })
  await tgBotService.updateSessionUserCoins(ctx, -CONFIG.COST.ANALYSIS)

  try {
    const response = await coinIFTService.getWhaleAnalysisAndRecord(ctx.session.user, ctx.session.pair, type)
    if (ctx.session.languageCode !== 'zh') {
      ctx.reply(
        await chatGPTService.translate(response.result, 'zh', ctx.session.languageCode as string),
      )
    }
    else {
      ctx.reply(response.result)
    }
  }
  catch (error) {
    logger.error(`[TgGenerationService] answerWhaleAnalysis: ${error}`)
    // 退回金币
    await tgBotService.updateSessionUserCoins(ctx, CONFIG.COST.ANALYSIS)
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
  const startMenu = tgBotService.createMenu('start')
  const searchTradePairMenu = tgBotService.createMenu('searchTradePair')
  const analysisMenu = tgBotService.createMenu('analysis', {
    autoAnswer: false,
  })

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
      })
      ctx.reply(ctx.i18n.t('analysis.selectType', { pair: key }), { reply_markup: analysisMenu })
    })
    if (i % 2) {
      searchTradePairMenu.row()
    }
  })

  searchTradePairMenu.dynamic(async (ctx, searchTradePairMenu) => {
    searchTradePairMenu.text(ctx.i18n.t('analysis.others'), async (ctx) => {
      tgBotService.updateSession(ctx, {
        state: 'searchTradePair',
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

  startMenu.register(searchTradePairMenu)
  searchTradePairMenu.register(analysisMenu)
  tgBotService.use(startMenu)
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

      ctx.reply(ctx.i18n.t('analysis.description'), { reply_markup: startMenu })
    },
  })

  tgBotService.on('message').filter((ctx) => {
    return ctx.msg.chat.type === 'private' && ctx.session.state === 'searchTradePair'
  }, async (ctx) => {
    const pair = ctx.msg.text?.trim().toUpperCase()
    if (!pair) {
      ctx.reply(ctx.i18n.t('analysis.invalidInput'))
      return
    }

    tgBotService.updateSession(ctx, {
      state: 'none',
      pair,
    })
    ctx.reply(ctx.i18n.t('analysis.selectType', { pair }), { reply_markup: analysisMenu })
  })
}
