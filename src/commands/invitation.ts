import type { TGBotContext } from '../services/tg/tg-bot.service.js'
import { formatMarkdownMessages } from '../common/string.js'
import i18n from '../locales/index.js'
import { tgBotService, userService } from '../services/index.js'

async function buildInviteText(ctx: TGBotContext) {
  const link = tgBotService.generateStartLink('i', ctx.session.user.inviteCode.code)
  const ancestors = await userService.getDescendants(ctx.session.user)
  return formatMarkdownMessages(i18n.t('invitation.message', {
    botName: tgBotService.botInfo.username,
    link,
    count: ancestors.length,
  }))
}

export function defineInvitationCommand() {
  tgBotService.defineCommand({
    command: 'invitation',
    description: i18n.t('invitation.description'),
    callback: async (ctx) => {
      await ctx.reply(await buildInviteText(ctx), {
        parse_mode: 'MarkdownV2',
      })
    },
  })
}
