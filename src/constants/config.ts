import type { Prisma } from '@prisma/client'
import { isDev } from '../common/is.js'

export const CONFIG = {
  // 邀请关系最大深度
  MAX_INVITE_DEPTH: 1,

  // TG群组ID
  TG_GROUP_IDS: isDev() ? [] : [-1002672407009],

  // TG群组URL
  TG_GROUP_URL: 'https://t.me/DreamAIGC/1/1712',

  // 初始化提示词
  INIT_PROMPT: 'Spy × Family Yor Forger,pink hair,nude,anal sex',

  // TON 钱包应用 manifest URL
  TON_WALLETS_APP_MANIFEST_URL: 'https://s3.kisslp.com/manifest.json',

  // TON 支付地址
  PAY_TON_ADDRESS: 'UQA8AuJ7KUuArtwXqaQWm_pII1jmBPGA4Lho3pkk5yvYWHmS',

  // USDT 支付链 ID
  USDT_PAYMENT_CHAIN_ID: 56, // bnb

  // 奖励配置
  REWARDS: {
    // 邀请新用户奖励
    INVITE_NEW_USER: 600,
  },

  // 消耗配置
  COST: {
    // 用户初始化
    USER_INIT: 10,

    // 邀请
    INVITE: 5,

    // 分析消耗
    ANALYSIS: 1,
  },

  // 支付配置
  PAYMENT: {
    // Stars 汇率配置
    STARS: {
      // USD 到 Stars 的汇率 (1 USD = 67 Stars)
      USD_TO_STARS_RATE: 67,
      // Stars 到 USD 的汇率 (1 Star = 0.015 USD)
      STARS_TO_USD_RATE: 0.015,
      // Stars 数量限制
      MIN_AMOUNT: 1,
      MAX_AMOUNT: 100000,
    },
    // 订单过期时间, 单位秒
    ORDER_EXPIRE_TIME: 3600,
  },

  // 产品配置
  PRODUCTS: {
    // 默认金币产品
    COINS: [] as Prisma.ProductCreateManyInput[],

    // 默认会员产品
    SUBSCRIPTIONS: [
      {
        name: 'product.monthly',
        description: 'product.monthly.description',
        value: 30,
        price: 19.99,
      },
      {
        name: 'product.yearly',
        description: 'product.yearly.description',
        value: 365,
        price: 169.99,
        discount: 30,
      },
    ] as Prisma.ProductCreateManyInput[],
  },

  // 管理员配置
  ADMIN: {
    // 管理员 ID
    IDS: ['6976483239', '5359108229', '6516476058'],
  },

  // 默认交易对
  TRADE_PAIRS: {
    BTC: 'BTC/USDT',
    ETH: 'ETH/USDT',
    SOL: 'SOL/USDT',
    BNB: 'BNB/USDT',
  },
}
