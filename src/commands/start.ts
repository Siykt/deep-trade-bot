import { CONFIG } from '../constants/config.js'
import { tgBotService } from '../services/index.js'

export function defineStartCommand() {
  const startMenu = tgBotService.createMenu('start')
  const searchTradePairMenu = tgBotService.createMenu('searchTradePair')

  Object.entries(CONFIG.TRADE_PAIRS).forEach(([key, value], i) => {
    searchTradePairMenu.text(key, async (ctx) => {
      ctx.reply(value)
    })
    if (i % 2) {
      searchTradePairMenu.row()
    }
  })
  searchTradePairMenu.text('Others（手动输入）', async (ctx) => {
    tgBotService.updateSession(ctx, {
      state: 'searchTradePair',
    })
    ctx.reply('请输入你要查询的币种：')
  })

  startMenu.text('多单热门🔥', async (ctx) => {
    ctx.reply('多单热门')
  })

  startMenu.text('空单热门🔥', async (ctx) => {
    ctx.reply('空单热门')
  }).row()

  startMenu.text('📊币种分析', async (ctx) => {
    ctx.reply(`选择你要查询的币种：
15秒内未返回数据，可能该币未收录或庄家不在场，请尝试其他币种或稍后再试
`, { reply_markup: searchTradePairMenu })
  })

  startMenu.register(searchTradePairMenu)
  tgBotService.use(startMenu)
  tgBotService.defineCommand({
    command: 'start',
    description: 'Start!',
    callback: async (ctx) => {
      ctx.reply(`选择你要查询的交易类型：
🔥 多单热门/空单热门：捕捉当前大资金动态，多空单布局，寻找投资机会
📊 币种分析：分析当前庄家行为，寻找短线投资机会和精确投资建议
`, { reply_markup: startMenu })
    },
  })

  tgBotService.on('message').filter((ctx) => {
    return ctx.msg.chat.type === 'private' && ctx.session.state === 'searchTradePair'
  }, async (ctx) => {
    tgBotService.updateSession(ctx, {
      state: 'none',
    })
    ctx.reply(`您查询的币种是：${ctx.msg.text}/USDT`)
  })
}
