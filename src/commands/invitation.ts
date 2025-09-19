import type { TGBotContext } from '../services/tg/tg-bot.service.js'
import { formatMarkdownMessages } from '../common/string.js'
import { CONFIG } from '../constants/config.js'
import { tgBotService, userService } from '../services/index.js'

async function buildInviteText(ctx: TGBotContext) {
  const link = tgBotService.generateStartLink('i', ctx.session.user.inviteCode.code)
  const ancestors = await userService.getDescendants(ctx.session.user)
  return formatMarkdownMessages(ctx.i18n.t('invitation.message', {
    botName: tgBotService.botInfo.username,
    link,
    count: ancestors.length,
    cost: CONFIG.COST.INVITE,
  }))
}

export function defineInvitationCommand() {
  tgBotService.defineCommand({
    command: 'invitation',
    i18n: true,
    description: 'invitation.description',
    i18nData: () => ({ botName: tgBotService.botInfo.username }),
    callback: async (ctx) => {
      await ctx.reply(await buildInviteText(ctx), { parse_mode: 'MarkdownV2' })
    },
  })
}
