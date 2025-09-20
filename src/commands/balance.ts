import type { TGBotContext, TGBotUser } from '../services/tg/tg-bot.service.js'
import { UserRejectsError } from '@tonconnect/sdk'
import { InlineKeyboard, InputFile } from 'grammy'
import QRCode from 'qrcode'
import { utcNow } from '../common/date.js'
import logger from '../common/logger.js'
import { formatMarkdownMessages } from '../common/string.js'
import { orderService, productService, tgBotService } from '../services/index.js'

function buildBalanceMessage(ctx: TGBotContext, user: TGBotUser) {
  return ctx.i18n.t('balance.message', {
    plan: user.isVip ? ctx.i18n.t('common.premium') : ctx.i18n.t('common.free'),
    expiresAt: user.vipExpireAt ? utcNow(user.vipExpireAt).format('YYYY-MM-DD HH:mm:ss') : '-',
    remaining: user.isVip ? '∞' : user.coins,
  })
}

export function defineBalanceCommand() {
  const balanceMenu = tgBotService.createMenu('balance')

  balanceMenu.dynamic(async (ctx, range) => {
    const products = await productService.getProductList(1, 100)
    const paymentInfo = ctx.session.paymentInfo

    if (!paymentInfo) {
      for (const product of products) {
        const productName = ctx.i18n.t(product.description || product.name)
        range.text(productName, async (ctx) => {
          tgBotService.updateSession(ctx, { paymentInfo: { productId: product.id } })
          await ctx.editMessageText(ctx.i18n.t('balance.buyProduct', { product: productName }))
        }).row()
      }

      return
    }

    range.text('⭐️ Stars', async (ctx) => {
      const chatId = ctx.chatId?.toString()
      const productId = paymentInfo.productId
      if (!productId || !chatId) {
        return
      }

      const product = products.find(product => product.id === productId)
      const { order, message } = await orderService.createAndSendProduceOrderWithStars(
        ctx.session.user,
        productId,
        1,
        chatId,
        product ? ctx.i18n.t(product.name) : undefined,
        product ? ctx.i18n.t(product.description ?? '') : undefined,
      )
      tgBotService.updateSession(ctx, {
        paymentInfo: {
          ...paymentInfo,
          orderId: order.id,
        },
      })

      const offOrderSuccess = orderService.onOrderSuccess(async ({ product, id }) => {
        if (order.id !== id) {
          return
        }
        logger.info(`[BalanceCommand] payment success: ${id} - ${product.name}`)
        message.delete()
        offOrderSuccess()
      })
    })

    range.text('💎 Ton', async (ctx) => {
      const chatId = ctx.chatId
      const productId = paymentInfo.productId
      if (!productId || !chatId) {
        return
      }

      const { order, wallet, sendTransaction } = await orderService.createProduceOrderWithTon(
        ctx.session.user,
        chatId,
        productId,
        1,
      )
      tgBotService.updateSession(ctx, {
        paymentInfo: {
          ...paymentInfo,
          orderId: order.id,
        },
      })

      const paymentLink = order.paymentLink
      if (!paymentLink) {
        logger.error(`[BalanceCommand] payment failed: ${order.id} - No payment link`)
        return
      }

      const sendTransactionAndReply = async () => {
        const inlineKeyboard = new InlineKeyboard()
        inlineKeyboard.url('💎 Pay', paymentLink)
        const message = await ctx.reply(ctx.i18n.t('balance.paymentProcessing'), {
          reply_markup: inlineKeyboard,
        })

        try {
          await sendTransaction()
        }
        catch (error) {
          if (error instanceof UserRejectsError) {
            await message.editText(ctx.i18n.t('balance.paymentRejected'))
            return
          }

          logger.error(`[BalanceCommand] payment failed: ${order.id}, error: ${error}`)
          await message.editText(ctx.i18n.t('balance.paymentFailed'))
        }
      }

      if (wallet.isConnected) {
        await sendTransactionAndReply()
      }
      else {
        const inlineKeyboard = new InlineKeyboard()
        inlineKeyboard.url('🔗 Connect Wallet', paymentLink)
        const message = await ctx.reply(ctx.i18n.t('balance.connectWallet'), {
          reply_markup: inlineKeyboard,
        })
        wallet.connecter.onStatusChange(async (wallet) => {
          if (!wallet)
            return
          message.delete()
          sendTransactionAndReply()
        })
      }
    })

    range.text('💰 USDT', async (ctx) => {
      const chatId = ctx.chatId
      const productId = paymentInfo.productId
      if (!productId || !chatId) {
        return
      }

      const product = products.find(product => product.id === productId)
      if (!product) {
        return
      }

      const { account, amount, chain, paymentLink, expireAt } = await orderService.createProduceOrderWithUsdt(
        ctx.session.user,
        productId,
        1,
        ctx.i18n.t(product.name),
        ctx.session.languageCode,
      )
      const { message_id } = await ctx.replyWithPhoto(new InputFile(await QRCode.toBuffer(account, { width: 512 })), {
        caption: formatMarkdownMessages(ctx.i18n.t('balance.usdt', {
          account,
          amount,
          network: chain.name,
          expiresAt: utcNow(expireAt).format('YYYY-MM-DD HH:mm:ss'),
        })),
        parse_mode: 'MarkdownV2',
        reply_markup: new InlineKeyboard().url(ctx.i18n.t('balance.usdt.pay'), paymentLink),
      })

      setTimeout(() => {
        tgBotService.api.editMessageCaption(chatId, message_id, {
          caption: ctx.i18n.t('balance.usdt.expired'),
          parse_mode: 'MarkdownV2',
          reply_markup: undefined,
        })
      }, utcNow(expireAt).diff(utcNow(), 'ms'))
    })

    range.row()
    range.text('🔙 Back', async (ctx) => {
      tgBotService.updateSession(ctx, { paymentInfo: undefined })
      await ctx.editMessageText(buildBalanceMessage(ctx, ctx.session.user), { reply_markup: balanceMenu })
    })
  })

  tgBotService.use(balanceMenu)
  tgBotService.defineCommand({
    command: 'balance',
    description: 'balance.command.description',
    i18n: true,
    callback: async (ctx) => {
      tgBotService.updateSession(ctx, { paymentInfo: undefined })
      await ctx.reply(buildBalanceMessage(ctx, ctx.session.user), { reply_markup: balanceMenu })
    },
  })
}
