import type { TGBotUser } from '../services/tg/tg-bot.service.js'
import { UserRejectsError } from '@tonconnect/sdk'
import { InlineKeyboard } from 'grammy'
import { utcNow } from '../common/date.js'
import logger from '../common/logger.js'
import i18n from '../locales/index.js'
import { orderService, productService, tgBotService } from '../services/index.js'

function buildBalanceMessage(user: TGBotUser) {
  return i18n.t('balance.message', {
    plan: user.isVip ? i18n.t('common.premium') : i18n.t('common.free'),
    expiresAt: user.vipExpireAt ? utcNow(user.vipExpireAt).format('YYYY-MM-DD HH:mm:ss') : '-',
  })
}

export function defineBalanceCommand() {
  const balanceMenu = tgBotService.createMenu('balance')

  balanceMenu.dynamic(async (ctx, range) => {
    const products = await productService.getProductList(1, 100)
    const paymentInfo = ctx.session.paymentInfo
    if (paymentInfo) {
      range.text('⭐️ Stars', async (ctx) => {
        const chatId = ctx.chatId?.toString()
        if (!chatId) {
          return
        }

        const productId = paymentInfo.productId
        if (!productId) {
          return
        }

        const { order, message } = await orderService.createAndSendProduceOrderWithStars(
          ctx.session.user,
          productId,
          1,
          chatId,
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
        if (!chatId) {
          return
        }

        const productId = paymentInfo.productId
        if (!productId) {
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
          const message = await ctx.reply('Payment is processing, please open your wallet to pay', {
            reply_markup: inlineKeyboard,
          })

          try {
            await sendTransaction()
          }
          catch (error) {
            if (error instanceof UserRejectsError) {
              await message.editText('You rejected the payment, please try again')
              return
            }

            logger.error(`[BalanceCommand] payment failed: ${order.id}, error: ${error}`)
            await message.editText('Payment failed, please try again')
          }
        }

        if (wallet.isConnected) {
          await sendTransactionAndReply()
        }
        else {
          const inlineKeyboard = new InlineKeyboard()
          inlineKeyboard.url('🔗 Connect Wallet', paymentLink)
          const message = await ctx.reply('Please connect your Ton wallet to continue', {
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

      range.row()
      range.text('🔙 Back', async (ctx) => {
        tgBotService.updateSession(ctx, {
          paymentInfo: undefined,
        })
        await ctx.editMessageText(buildBalanceMessage(ctx.session.user), { reply_markup: balanceMenu })
      })
    }
    else {
      for (const product of products) {
        range.text(product.description || product.name, async (ctx) => {
          tgBotService.updateSession(ctx, {
            paymentInfo: {
              productId: product.id,
            },
          })
          await ctx.editMessageText(`Buy ${product.description || product.name}\n\nPlease select your payment method:`)
        }).row()
      }
    }
  })

  tgBotService.use(balanceMenu)
  tgBotService.defineCommand({
    command: 'balance',
    description: 'Balance',
    callback: async (ctx) => {
      await ctx.reply(buildBalanceMessage(ctx.session.user), { reply_markup: balanceMenu })
    },
  })
}
