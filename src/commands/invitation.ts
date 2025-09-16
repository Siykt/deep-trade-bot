import type { TGBotContext } from '../services/tg/tg-bot.service.js'
import { formatMarkdownMessages } from '../common/string.js'
import { CONFIG } from '../constants/config.js'
import { tgBotService, userService } from '../services/index.js'

async function buildInviteText(ctx: TGBotContext) {
  const link = tgBotService.generateStartLink('i', ctx.session.user.inviteCode.code)
  const ancestors = await userService.getDescendants(ctx.session.user)
  return `${formatMarkdownMessages(`💗 @${tgBotService.botInfo.username}

Already invited: ${ancestors.length}
Already claimed: ${ancestors.length * CONFIG.REWARDS.INVITE_NEW_USER}

🌟Invite & Earn!

Each person you invite will receive ${CONFIG.REWARDS.INVITE_NEW_USER} rewards!
Join now using your exclusive Dream AI+ invitation link👇`)}
🔗 \`${link}\``
}

export function defineInvitationCommand() {
  tgBotService.defineCommand({
    command: 'invitation',
    description: '🔥 Invite your friends to join the bot',
    callback: async (ctx) => {
      await ctx.reply(await buildInviteText(ctx), {
        parse_mode: 'MarkdownV2',
      })
    },
  })
}
