import type { Order, Prisma, Product, User } from '@prisma/client'
import EventEmitter from 'node:events'
import { pMapPool } from '@atp-tools/lib'
import { toNano } from '@ton/core'
import { inject } from 'inversify'
import _ from 'lodash'
import { customAlphabet, urlAlphabet } from 'nanoid'
import cron from 'node-cron'
import { OrderCreateInputSchema } from '../../../prisma/generated/zod/index.js'
import { utcNow } from '../../common/date.js'
import { Service } from '../../common/decorators/service.js'
import { ApiError, ApiErrorCode } from '../../common/errors.js'
import { isDev } from '../../common/is.js'
import { AsyncLock } from '../../common/lock.js'
import logger from '../../common/logger.js'
import { prisma } from '../../common/prisma.js'
import { CONFIG } from '../../constants/config.js'
import { ProductService } from '../product/product.service.js'
import { TGBotService } from '../tg/tg-bot.service.js'
import { TGPaymentService } from '../tg/tg-payment.service.js'
import { UserService } from '../user/user.service.js'
import { TonWalletService } from '../web3/ton-wallet.service.js'

/**
 * ```mermaid
 * stateDiagram-v2
 *   [*] --> PENDING: 创建订单
 *   PENDING --> PROCESSING: 用户发起支付
 *   PROCESSING --> SUCCESS: 支付成功
 *   PROCESSING --> FAILED: 支付失败
 *   PENDING --> EXPIRED: 超过有效期
 *   FAILED --> PROCESSING: 重试支付
 *   SUCCESS --> [*]: 终态
 *   EXPIRED --> [*]: 终态
 * ```
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
  EXPIRED = 'EXPIRED',
}

class OrderStatusRelationTree {
  readonly transitions = {
    [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.EXPIRED],
    [OrderStatus.PROCESSING]: [OrderStatus.SUCCESS, OrderStatus.FAILED, OrderStatus.EXPIRED],
    [OrderStatus.FAILED]: [OrderStatus.PROCESSING, OrderStatus.EXPIRED],
  }

  canTransition(from: OrderStatus, to: OrderStatus) {
    return this.transitions[from as keyof typeof this.transitions]?.includes(to) || false
  }

  getNotEndedStatuses() {
    return [OrderStatus.PENDING, OrderStatus.PROCESSING]
  }

  isEndStatus(status: string) {
    return ([OrderStatus.SUCCESS, OrderStatus.EXPIRED, OrderStatus.FAILED] as OrderStatus[]).includes(status as OrderStatus)
  }
}

export enum PaymentType {
  TON = 'TON',
  STARS = 'STARS',
}

@Service()
export class OrderService {
  readonly emitter = new EventEmitter()
  readonly payloadGenerator = customAlphabet(urlAlphabet, 8)
  readonly orderStatusRelationTree = new OrderStatusRelationTree()

  constructor(
    @inject(UserService)
    private readonly userService: UserService,
    @inject(ProductService)
    private readonly productService: ProductService,
    @inject(TonWalletService)
    private readonly tonWalletService: TonWalletService,
    @inject(TGPaymentService)
    private readonly tgPaymentService: TGPaymentService,
    @inject(TGBotService)
    private readonly tgBotService: TGBotService,
  ) {
    this.setupTgStarsCheckout()
    this.checkExpiredOrders()
    // 冷启动时需要检查过去30天的所有交易, 避免漏掉交易
    this.checkTonPaymentTransactions(utcNow().subtract(30, 'day').unix()).catch((error) => {
      logger.error(`Error checking ton payment transactions: ${error}`)
    })
    // 每分钟检查一次
    cron.schedule('* * * * *', () => {
      // 非严格过去 1 小时的交易
      const startUTime = utcNow().startOf('h').subtract(1, 'h').unix()
      this.checkTonPaymentTransactions(startUTime).catch((error) => {
        logger.error(`Error checking ton payment transactions: ${error}`)
      })
    })
    // 每30分钟检查一次过期订单
    cron.schedule('*/30 * * * *', () => {
      this.checkExpiredOrders().catch((error) => {
        logger.error(`Error checking expired orders: ${error}`)
      })
    })
  }

  private async checkTonPaymentTransactions(startUTime?: number) {
    const transactions = await this.tonWalletService.getTransactions([CONFIG.PAY_TON_ADDRESS], startUTime)

    if (!transactions || transactions.length === 0) {
      logger.info(`[OrderService] No transactions found`)
      return
    }
    else if (transactions.length === 1000) {
      logger.info(`[OrderService] Transactions length is 1000, continue checking`)

      let nextTransactions = await this.tonWalletService.getTransactions([CONFIG.PAY_TON_ADDRESS], startUTime, transactions.length)
      while (nextTransactions.length < 1000) {
        transactions.push(...nextTransactions)
        nextTransactions = await this.tonWalletService.getTransactions([CONFIG.PAY_TON_ADDRESS], startUTime, transactions.length)
      }
    }

    const hasCommentTransactions = transactions.filter(transaction => transaction.comment)
    if (hasCommentTransactions.length === 0) {
      logger.info(`[OrderService] No comment transactions found`)
      return
    }

    logger.info(`[OrderService] Found ${hasCommentTransactions.length} transactions with comment`)

    const orders = await prisma.order.findMany({
      where: {
        externalPaymentId: { in: _.map(hasCommentTransactions, 'comment') as string[] },
        status: OrderStatus.PROCESSING,
        paymentType: PaymentType.TON,
      },
      include: {
        UserOrders: {
          include: {
            Product: true,
          },
        },
      },
    })

    if (!orders.length) {
      logger.info(`[OrderService] No orders found`)
      return
    }

    logger.info(`[OrderService] Found ${orders.length} orders`)
    const orderTransactionMap = _.keyBy(hasCommentTransactions, 'comment')

    await pMapPool(orders, async (order) => {
      const orderAmount = order.amount
      const transaction = orderTransactionMap[order.externalPaymentId as string]

      // 检查金额
      if (transaction && !orderAmount.eq(transaction.amount)) {
        logger.warn(`[OrderService] Order ${order.id} amount changed, need to recalculate amount, orderAmount: ${orderAmount}, transactionAmount: ${transaction.amount}`)
        await this.updateStatus(order.id, OrderStatus.FAILED, {
          transactionId: transaction.id,
        })
        return
      }

      logger.info(`[OrderService] Order ${order.id} payment success, amount: ${transaction?.amount}`)
      await this.updateStatus(order.id, OrderStatus.SUCCESS, {
        transactionId: transaction?.id,
      })

      // 发送交易信息
      const user = await this.userService.findByIdOrThrow(order.userId)
      await this.tgBotService.api.sendMessage(user.telegramId, `Payment success, Your buy product ${order.UserOrders?.Product.name}`)
      logger.info(`[OrderService] balanceEnd: ${order.id} - ${order.UserOrders?.Product.name}`)
    }, { concurrency: 5 })
  }

  private async checkExpiredOrders() {
    const orders = await prisma.order.findMany({
      where: {
        NOT: {
          status: {
            in: [OrderStatus.SUCCESS, OrderStatus.EXPIRED],
          },
        },
        expireAt: {
          lte: new Date(),
        },
      },
    })

    for (const order of orders) {
      await this.updateStatus(order.id, OrderStatus.EXPIRED)
    }
  }

  private async setupTgStarsCheckout() {
    this.tgPaymentService.onStarsCheckout(async (payload, ctx) => {
      const order = await prisma.order.findUnique({
        where: {
          externalPaymentId: payload,
          paymentType: PaymentType.STARS,
          expireAt: { gte: new Date() },
        },
        include: {
          UserOrders: {
            include: {
              Product: true,
            },
          },
        },
      })

      logger.debug(`[OrderService] Stars checkout, order: ${JSON.stringify(order)}`)

      if (!order) {
        logger.warn(`[OrderService] Stars checkout failed, order not found, payload: ${payload}`)
        // 回答支付失败
        await ctx.answerPreCheckoutQuery(false, {
          error_message: 'Order not found, please create a new order',
        })
        return
      }

      if (this.orderStatusRelationTree.isEndStatus(order.status)) {
        logger.warn(`[OrderService] Stars checkout failed, order is already resolved, payload: ${payload}`)
        await ctx.answerPreCheckoutQuery(false, {
          error_message: 'Order is already resolved, please create a new order',
        })
        return
      }

      await this.updateStatus(order.id, OrderStatus.SUCCESS)
      await ctx.answerPreCheckoutQuery(true)

      this.emitter.emit('order-success', {
        ...order,
        product: order.UserOrders?.Product,
      })
    })
  }

  onOrderSuccess(callback: (order: Order & { product: Product }) => unknown) {
    this.emitter.on('order-success', callback)
    return () => {
      this.emitter.off('order-success', callback)
    }
  }

  /**
   * 创建订单
   * @param data 订单数据
   * @param $tx 事务客户端
   * @returns 创建的订单
   */
  async create(data: Prisma.OrderCreateInput, $tx: Prisma.TransactionClient = prisma) {
    return $tx.order.create({ data: OrderCreateInputSchema.parse(data) })
  }

  /**
   * 根据 ID 获取订单
   * @param id 订单 ID
   * @returns 订单
   */
  async findByIdOrThrow(id: string) {
    return prisma.order.findUniqueOrThrow({ where: { id } })
  }

  /**
   * 预检查创建订单
   * @param user 用户
   * @param productId 商品ID
   * @returns 是否可以创建订单
   */
  async preCheckCreation(user: User, productId: string) {
    const count = await prisma.userOrder.count({
      where: {
        userId:
          user.id,
        productId,
        status: {
          in: this.orderStatusRelationTree.getNotEndedStatuses(),
        },
      },
    })
    if (count >= 10) {
      throw new ApiError(ApiErrorCode.ORDER_MAX_COUNT_REACHED, 'You have reached the maximum number of orders')
    }

    return true
  }

  /**
   * 创建商品订单（TON）
   * @param user 用户
   * @param chatId 聊天ID
   * @param productId 商品ID
   * @param quantity 数量
   * @returns 订单
   */
  async createProduceOrderWithTon(user: User, chatId: number, productId: string, quantity: number) {
    const product = await this.productService.findByIdOrThrow(productId)
    const fiatAmount = isDev() ? 0.01 : product.price.mul(quantity).toNumber()
    const payload = this.payloadGenerator()
    const { amount, rate } = await this.tonWalletService.getTonPrice(fiatAmount)
    const wallet = await this.tonWalletService.create(chatId)

    logger.info(`[OrderService] Creating TON order for user [${user.username}], product: ${product.name}, quantity: ${quantity}, fiatAmount: $${fiatAmount}, rate: ${rate}, amount: ${amount}TON`)
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          User: { connect: { id: user.id } },
          paymentType: PaymentType.TON,
          paymentLink: wallet.isConnected ? this.tonWalletService.tonWalletOpenLink : wallet.connectLink,
          amount,
          externalPaymentId: payload,
          fiatAmount,
          expireAt: new Date(Date.now() + 3600 * 1000), // 1 hour
          exchangeRate: rate,
          rateValidSeconds: 3600,
          customExpiration: 3600,
          lastCheckedAt: new Date(),
        },
      })

      await tx.userOrder.create({
        data: {
          orderId: newOrder.id,
          productId,
          userId: user.id,
          quantity,
        },
      })

      return newOrder
    })

    const sendTransaction = async () => {
      await this.updateStatus(order.id, OrderStatus.PROCESSING)
      try {
        await wallet.sendTransferWithComment({
          validUntil: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
          messages: [{ address: CONFIG.PAY_TON_ADDRESS, amount: toNano(order.amount.toNumber()).toString(), comment: payload }],
        })
      }
      catch (error) {
        logger.error(`[OrderService] Sending TON order failed, orderId: ${order.id}, error: ${error}`)
        await this.updateStatus(order.id, OrderStatus.FAILED)
        throw error
      }
    }

    logger.info(`[OrderService] Created TON order for user [${user.username}], orderId: ${order.id}`)
    return { order, wallet, sendTransaction }
  }

  /**
   * 创建商品订单（Stars）
   * @param user 用户
   * @param productId 商品ID
   * @param quantity 数量
   * @returns 订单
   */
  async createProduceOrderWithStars(user: User, productId: string, quantity: number) {
    const product = await this.productService.findByIdOrThrow(productId)
    const fiatAmount = isDev() ? 0.01 : product.price.mul(quantity).toNumber()
    const amount = this.tgPaymentService.convertStarsToUSD(fiatAmount)

    logger.info(`[OrderService] Creating Stars order for user [${user.username}], product: ${product.name}, quantity: ${quantity}, fiatAmount: $${fiatAmount}, amount: ${amount}⭐️`)
    const { link, payload } = await this.tgPaymentService.createStarInvoiceLink({
      stars: amount,
      title: product.name,
      description: product.description ?? 'Buy Telegram Stars',
    })

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          User: { connect: { id: user.id } },
          paymentType: PaymentType.STARS,
          paymentLink: link,
          amount,
          externalPaymentId: payload,
          fiatAmount,
          expireAt: new Date(Date.now() + 3600 * 1000), // 1 hour
          exchangeRate: 1,
          rateValidSeconds: 3600,
          customExpiration: 3600,
          lastCheckedAt: new Date(),
        },
      })

      await tx.userOrder.create({
        data: {
          orderId: newOrder.id,
          productId,
          userId: user.id,
          quantity,
        },
      })

      return newOrder
    })

    // 直接更新订单状态为处理中
    await this.updateStatus(order.id, OrderStatus.PROCESSING)

    logger.info(`[OrderService] Created Stars order for user [@${user.username}], orderId: ${order.id}`)
    return order
  }

  /**
   * 创建并发送商品订单（Stars）
   * @param user 用户
   * @param productId 商品ID
   * @param quantity 数量
   * @param chatId 聊天ID
   * @param title 标题
   * @param description 描述
   * @returns 订单
   */
  async createAndSendProduceOrderWithStars(user: User, productId: string, quantity: number, chatId: string, title?: string, description?: string) {
    const product = await this.productService.findByIdOrThrow(productId)
    const fiatAmount = isDev() ? 0.01 : product.price.mul(quantity).toNumber()
    const amount = this.tgPaymentService.convertUSDToStars(fiatAmount)

    logger.info(`[OrderService] Creating Stars order for user [${user.username}], product: ${product.name}, quantity: ${quantity}, fiatAmount: $${fiatAmount}, amount: ${amount}⭐️`)

    const { message, payload } = await this.tgPaymentService.sendStarsInvoiceMessage({
      stars: amount,
      title: title || product.name,
      description: description || product.description || 'Buy Telegram Stars',
      chatId,
    })

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          User: { connect: { id: user.id } },
          paymentType: PaymentType.STARS,
          paymentLink: '',
          amount,
          externalPaymentId: payload,
          fiatAmount,
          expireAt: new Date(Date.now() + 3600 * 1000), // 1 hour
          exchangeRate: 1,
          rateValidSeconds: 3600,
          customExpiration: 3600,
        },
      })

      await tx.userOrder.create({
        data: {
          orderId: newOrder.id,
          productId,
          userId: user.id,
          quantity,
        },
      })

      return newOrder
    })

    // 直接更新订单状态为处理中
    await this.updateStatus(order.id, OrderStatus.PROCESSING)

    logger.info(`[OrderService] Created Stars order for user [@${user.username}], orderId: ${order.id}`)
    return { order, message }
  }

  /**
   * 更新订单状态
   * @param orderId 订单ID
   * @param toStatus 目标状态
   * @returns 更新后的订单
   */
  async updateStatus(orderId: string, toStatus: OrderStatus, newOrderInfo?: Partial<Order>) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { User: true, UserOrders: { include: { Product: true } } },
    })

    // 检查订单是否存在
    if (!order) {
      throw new ApiError(ApiErrorCode.ORDER_NOT_FOUND, 'Order not found or expired')
    }

    // 检查订单是否已经解决
    if (order.status === OrderStatus.SUCCESS || order.status === OrderStatus.EXPIRED) {
      throw new ApiError(ApiErrorCode.ORDER_ALREADY_RESOLVED, 'Order is already resolved')
    }

    // 检查状态转移是否合法
    if (!this.orderStatusRelationTree.canTransition(order.status as OrderStatus, toStatus)) {
      throw new ApiError(ApiErrorCode.ORDER_STATUS_INVALID, `Invalid order status transition, from: ${order.status}, to: ${toStatus}`)
    }

    // 检查汇率是否变化
    if (toStatus === OrderStatus.SUCCESS && utcNow().diff(utcNow(order.lastCheckedAt || new Date()), 'seconds') > order.rateValidSeconds) {
      // TODO: 汇率变化，需要重新计算订单金额
      logger.warn(`[OrderService] Order ${orderId} rate changed, need to recalculate amount`)
      // throw new ApiError(ApiErrorCode.ORDER_RATE_CHANGED, 'Order rate changed, need to recalculate amount')
    }

    // 使用异步锁防止并发更新订单状态
    await AsyncLock.instance.execute(`order:${orderId}:lock`, () => prisma.$transaction(async ($tx) => {
      const now = new Date()
      const isSuccess = toStatus === OrderStatus.SUCCESS
      const [, , userOrder] = await Promise.all([
        $tx.orderStatusHistory.create({
          data: {
            orderId,
            from: order.status,
            to: toStatus,
            metadata: JSON.stringify(order),
          },
        }),
        $tx.order.update({
          where: { id: orderId },
          data: {
            status: toStatus,
            lastCheckedAt: now,
            ...(isSuccess ? { paidAt: now } : {}),
            ...newOrderInfo,
          },
        }),
        $tx.userOrder.update({
          where: { orderId },
          data: { status: toStatus, ...(isSuccess ? { completedAt: now } : {}) },
          include: { Product: true },
        }),
      ])

      if (!isSuccess)
        return

      // 完成订单逻辑部分
      await this.productService.completeProduct(userOrder.userId, userOrder.Product, $tx)
    }))

    return { ...order, status: toStatus }
  }
}
