import type { Prisma, Product } from '@prisma/client'
import { inject } from 'inversify'
import { ProductCreateInputSchema } from '../../../prisma/generated/zod/index.js'
import { Service } from '../../common/decorators/service.js'
import logger from '../../common/logger.js'
import { prisma } from '../../common/prisma.js'
import { CONFIG } from '../../constants/config.js'
import { TGPaymentService } from '../tg/tg-payment.service.js'
import { UserService } from '../user/user.service.js'
import { TonWalletService } from '../web3/ton-wallet.service.js'

export enum ProductType {
  /** 购买金币 */
  COIN = 'COIN',
  /** 订阅会员 */
  SUBSCRIPTION = 'SUBSCRIPTION',
  /** 购买金币并赠送会员 */
  COIN_AND_SUBSCRIPTION = 'COIN_AND_SUBSCRIPTION',
}

@Service()
export class ProductService {
  constructor(
    @inject(UserService)
    private readonly userService: UserService,
    @inject(TonWalletService)
    private readonly tonWalletService: TonWalletService,
    @inject(TGPaymentService)
    private readonly tgPaymentService: TGPaymentService,
  ) {
    this.createDefaultProducts()
  }

  findByIdOrThrow(id: string) {
    return prisma.product.findUniqueOrThrow({ where: { id } })
  }

  /**
   * 创建商品
   * @param data 商品数据
   * @returns 商品
   */
  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data: ProductCreateInputSchema.parse(data) })
  }

  /**
   * 创建商品（如果商品不存在）
   * @param data 商品数据
   * @returns 商品
   */
  createIfNotExists(data: Prisma.ProductCreateInput) {
    const verifiedInput = ProductCreateInputSchema.parse(data)
    return prisma.product.upsert({
      where: { id: verifiedInput.id },
      update: verifiedInput,
      create: verifiedInput,
    })
  }

  async createDefaultProducts() {
    const productCount = await prisma.product.count()
    if (productCount > 0)
      return

    await prisma.product.createMany({
      data: CONFIG.PRODUCTS.COINS.map(product => ({
        ...product,
        type: product.name.includes('And VIP') ? ProductType.COIN_AND_SUBSCRIPTION : ProductType.COIN,
      })).concat(
        CONFIG.PRODUCTS.SUBSCRIPTIONS.map(product => ({
          ...product,
          type: ProductType.SUBSCRIPTION,
        })),
      ),
    })
  }

  /**
   * 获取商品列表
   * @param page 页码
   * @param pageSize 每页数量
   * @param type 商品类型
   * @returns 商品列表
   */
  async getProductList(page: number, pageSize: number, type?: ProductType) {
    const products = await prisma.product.findMany({
      where: { type, isActive: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        displayOrder: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        value: true,
        price: true,
      },
    })

    const { rate: tonRate } = await this.tonWalletService.getTonPrice(1)
    return products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      value: product.value,
      prices: {
        stars: this.tgPaymentService.convertUSDToStars(product.price.toNumber()),
        ton: product.price.mul(tonRate).toNumber(),
        usd: product.price,
      },
    }))
  }

  /**
   * 完成商品
   * @param userId 用户ID
   * @param product 商品
   * @param $tx 事务客户端
   */
  async completeProduct(userId: string, product: Product, $tx: Prisma.TransactionClient = prisma) {
    switch (product.type) {
      case ProductType.COIN:
        await this.userService.update(userId, {
          coins: { increment: product.value },
        }, $tx)
        break

      case ProductType.SUBSCRIPTION:
        await this.userService.updateVipDay(await $tx.user.findUniqueOrThrow({ where: { id: userId } }), 30, $tx)
        break

      case ProductType.COIN_AND_SUBSCRIPTION: {
        const user = await this.userService.update(userId, {
          coins: { increment: product.value },
        }, $tx)

        const vipDay = product.name.match(/And VIP - (\d+) Days/)?.[1]
        if (vipDay) {
          await this.userService.updateVipDay(user, Number(vipDay), $tx)
        }
        else {
          logger.error(`[ProductService] Invalid product name: ${product.name}`)
        }
      }
        break
      default:
        logger.error(`[ProductService] Invalid product type: ${product.type}`)
        break
    }
  }
}
