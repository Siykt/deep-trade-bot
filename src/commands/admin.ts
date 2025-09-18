import type { Product } from '@prisma/client'
import { InlineKeyboard } from 'grammy'
import { formatTime, utcNow } from '../common/date.js'
import logger from '../common/logger.js'
import { prisma } from '../common/prisma.js'
import { CONFIG } from '../constants/config.js'
import { tgBotService, userService } from '../services/index.js'
import { OrderStatus } from '../services/order/order.service.js'

function buildAdminTipsMessage() {
  return `请输入管理员命令:

- /admin 查看所有管理员命令
- /admin addCoins <用户TG ID> <积分> 添加积分
- /admin addVip <用户TG ID> <Vip时间> 添加Vip时间
- /admin editProduct <产品ID> 编辑产品
- /admin generationQueue 查看图片生成队列
- /admin today 查看今日统计
- /admin week 查看每周统计
- /admin month 查看每月统计
- /admin search <关键词> 搜索用户
- /admin joinGroup 生成加入群组链接
- /admin joinChannel 生成加入频道链接
`
}

function buildTodayMessage(today: {
  date: string
  recordCount: number
  recordConsume: number
  rechargeCount: number
  rechargeAmount: number
  rechargeUsers: number
  averageRecordCount: number
  newUsers?: number
  invitedNewUsers?: number
  topInviterUsername?: string
}) {
  return `
------- ${today.date} -------

⤷ 生成记录: ${today.recordCount} 次, 消耗: ${today.recordConsume} Cost
⤷ 充值记录: ${today.rechargeCount} 次, 金额: $${today.rechargeAmount}
⤷ 充值用户: ${today.rechargeUsers} 人
⤷ 平均生成次数: ${today.averageRecordCount} 次
⤷ 新用户: ${today.newUsers ?? '-'} 人
⤷ 通过邀请创建: ${today.invitedNewUsers ?? '-'} 人
⤷ 邀请最多: ${today.topInviterUsername ?? '-'}
`
}

function buildWeekMessage(week: {
  range: string
  recordCount: number
  recordConsume: number
  rechargeCount: number
  rechargeAmount: number
  rechargeUsers: number
  averageRecordCount: number
  newUsers?: number
  invitedNewUsers?: number
  topInviterUsername?: string
}) {
  return `
------- 最近7天: ${week.range} -------

⤷ 生成记录: ${week.recordCount} 次, 消耗: ${week.recordConsume} 💗
⤷ 充值记录: ${week.rechargeCount} 次, 金额: $${week.rechargeAmount}
⤷ 充值用户: ${week.rechargeUsers} 人
⤷ 平均生成次数: ${week.averageRecordCount} 次
⤷ 新用户: ${week.newUsers ?? '-'} 人
⤷ 通过邀请创建: ${week.invitedNewUsers ?? '-'} 人
⤷ 邀请最多: ${week.topInviterUsername ?? '-'}
`
}

function buildMonthMessage(month: {
  range: string
  recordCount: number
  recordConsume: number
  rechargeCount: number
  rechargeAmount: number
  rechargeUsers: number
  averageRecordCount: number
  newUsers?: number
  invitedNewUsers?: number
  topInviterUsername?: string
}) {
  return `
------- 最近一个月: ${month.range} -------

⤷ 生成记录: ${month.recordCount} 次, 消耗: ${month.recordConsume} 💗
⤷ 充值记录: ${month.rechargeCount} 次, 金额: $${month.rechargeAmount}
⤷ 充值用户: ${month.rechargeUsers} 人
⤷ 平均生成次数: ${month.averageRecordCount} 次
⤷ 新用户: ${month.newUsers ?? '-'} 人
⤷ 通过邀请创建: ${month.invitedNewUsers ?? '-'} 人
⤷ 邀请最多: ${month.topInviterUsername ?? '-'}
`
}

function buildEditProductMessage(product: Product) {
  return `
  产品名称: ${product.name}
  产品描述: ${product.description}
  产品类型: ${product.type}
  产品价格: ${product.price}
  产品价值: ${product.value}
  产品折扣: ${product.discount}
  产品是否激活: ${product.isActive}
  产品展示顺序: ${product.displayOrder}
  产品扩展数据: ${product.metadata}
`
}

function generateJoinGroupLink(type: 'group' | 'channel') {
  const channelChatAdminRights = [
    'change_info',
    'post_messages',
    'edit_messages',
    'delete_messages',
    'ban_users',
    'invite_users',
    'restrict_members',
    'invite_users',
    'pin_messages',
    'manage_topics',
    'promote_members',
    'manage_video_chats',
    'anonymous',
    'manage_chat',
    'post_stories',
    'edit_stories',
    'delete_stories',
  ]
  const groupChatAdminRights = [
    'change_info',
    'post_messages',
    'edit_messages',
    'delete_messages',
    'restrict_members',
    'anonymous',
    'manage_topics',
    'pin_messages',
  ]
  return `https://t.me/${tgBotService.botInfo.username}?start${type}&admin=${type === 'group' ? groupChatAdminRights.join('+') : channelChatAdminRights.join('+')}`
}

async function getTodayStatistics() {
  const today = utcNow().startOf('day')
  const startOfDay = today.toDate()
  const endOfDay = today.endOf('day').toDate()

  // 统计今日生成记录
  const recordCount = await prisma.userAnalysisResult.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  })

  // 统计今日生成记录的消耗
  const recordConsume = await prisma.userAnalysisResult.aggregate({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    _sum: {
      cost: true,
    },
  })

  // 统计今日的充值记录
  const rechargeCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: OrderStatus.SUCCESS,
    },
  })

  // 统计今日的充值金额
  const rechargeAmount = await prisma.order.aggregate({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: OrderStatus.SUCCESS,
    },
    _sum: {
      fiatAmount: true,
    },
  })

  // 统计今日的充值用户
  const rechargeUsers = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: OrderStatus.SUCCESS,
    },
    select: {
      userId: true,
    },
    distinct: ['userId'],
  })

  // 统计今日生成的用户数量，用于计算平均生成次数
  const generationUsers = await prisma.userAnalysisResult.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: { userId: true },
    distinct: ['userId'],
  })

  // 统计最近一天新用户
  const newUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  })

  // 统计最近一天通过邀请创建的新用户
  const invitedNewUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      invitedByUserId: {
        not: null,
      },
    },
  })

  // 统计最近一天邀请最多的用户名
  const topInviterGroup = await prisma.user.groupBy({
    by: ['invitedByUserId'],
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      invitedByUserId: { not: null },
    },
    _count: { _all: true },
    orderBy: [{ _count: { invitedByUserId: 'desc' } }],
    take: 1,
  })
  let topInviterUsername: string = '-'
  const firstGroupDay = topInviterGroup.at(0)
  const inviterIdDay = firstGroupDay?.invitedByUserId as string | null | undefined
  if (inviterIdDay) {
    const inviter = await prisma.user.findUnique({ where: { id: inviterIdDay } })
    topInviterUsername = inviter?.username ? `@${inviter.username}` : (inviter?.telegramId ?? '-')
  }

  return {
    date: today.format('YYYY-MM-DD'),
    recordCount,
    recordConsume: recordConsume._sum.cost || 0,
    rechargeCount,
    rechargeAmount: rechargeAmount._sum.fiatAmount?.toNumber() || 0,
    rechargeUsers: rechargeUsers.length,
    averageRecordCount: generationUsers.length === 0 ? 0 : Math.round(recordCount / generationUsers.length),
    newUsers,
    invitedNewUsers,
    topInviterUsername,
  }
}

async function getWeekStatistics() {
  const end = utcNow().endOf('day')
  const start = utcNow().startOf('day').subtract(6, 'day')
  const startDate = start.toDate()
  const endDate = end.toDate()

  const recordCount = await prisma.userAnalysisResult.count({
    where: { createdAt: { gte: startDate, lte: endDate } },
  })
  const recordConsume = await prisma.userAnalysisResult.aggregate({
    where: { createdAt: { gte: startDate, lte: endDate } },
    _sum: { cost: true },
  })
  const rechargeCount = await prisma.order.count({
    where: { createdAt: { gte: startDate, lte: endDate }, status: OrderStatus.SUCCESS },
  })
  const rechargeAmount = await prisma.order.aggregate({
    where: { createdAt: { gte: startDate, lte: endDate }, status: OrderStatus.SUCCESS },
    _sum: { fiatAmount: true },
  })
  const rechargeUsers = await prisma.order.findMany({
    where: { createdAt: { gte: startDate, lte: endDate }, status: OrderStatus.SUCCESS },
    select: { userId: true },
    distinct: ['userId'],
  })
  const generationUsers = await prisma.userAnalysisResult.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
    select: { userId: true },
    distinct: ['userId'],
  })

  const newUsers = await prisma.user.count({ where: { createdAt: { gte: startDate, lte: endDate } } })
  const invitedNewUsers = await prisma.user.count({ where: { createdAt: { gte: startDate, lte: endDate }, invitedByUserId: { not: null } } })
  const topInviterGroup = await prisma.user.groupBy({
    by: ['invitedByUserId'],
    where: { createdAt: { gte: startDate, lte: endDate }, invitedByUserId: { not: null } },
    _count: { _all: true },
    orderBy: [{ _count: { invitedByUserId: 'desc' } }],
    take: 1,
  })
  let topInviterUsername: string = '-'
  const firstGroupWeek = topInviterGroup.at(0)
  const inviterIdWeek = firstGroupWeek?.invitedByUserId as string | null | undefined
  if (inviterIdWeek) {
    const inviter = await prisma.user.findUnique({ where: { id: inviterIdWeek } })
    topInviterUsername = inviter?.username ? `@${inviter.username}` : (inviter?.telegramId ?? '-')
  }

  return {
    range: `${start.format('YYYY-MM-DD')} ~ ${end.format('YYYY-MM-DD')}`,
    recordCount,
    recordConsume: recordConsume._sum.cost || 0,
    rechargeCount,
    rechargeAmount: rechargeAmount._sum.fiatAmount?.toNumber() || 0,
    rechargeUsers: rechargeUsers.length,
    averageRecordCount: generationUsers.length === 0 ? 0 : Math.round(recordCount / generationUsers.length),
    newUsers,
    invitedNewUsers,
    topInviterUsername,
  }
}

async function getMonthStatistics() {
  const start = utcNow().subtract(1, 'month').startOf('day')
  const end = utcNow().endOf('day')
  const startDate = start.toDate()
  const endDate = end.toDate()

  const recordCount = await prisma.userAnalysisResult.count({
    where: { createdAt: { gte: startDate, lte: endDate } },
  })
  const recordConsume = await prisma.userAnalysisResult.aggregate({
    where: { createdAt: { gte: startDate, lte: endDate } },
    _sum: { cost: true },
  })
  const rechargeCount = await prisma.order.count({
    where: { createdAt: { gte: startDate, lte: endDate }, status: OrderStatus.SUCCESS },
  })
  const rechargeAmount = await prisma.order.aggregate({
    where: { createdAt: { gte: startDate, lte: endDate }, status: OrderStatus.SUCCESS },
    _sum: { fiatAmount: true },
  })
  const rechargeUsers = await prisma.order.findMany({
    where: { createdAt: { gte: startDate, lte: endDate }, status: OrderStatus.SUCCESS },
    select: { userId: true },
    distinct: ['userId'],
  })
  const generationUsers = await prisma.userAnalysisResult.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
    select: { userId: true },
    distinct: ['userId'],
  })

  const newUsers = await prisma.user.count({ where: { createdAt: { gte: startDate, lte: endDate } } })
  const invitedNewUsers = await prisma.user.count({ where: { createdAt: { gte: startDate, lte: endDate }, invitedByUserId: { not: null } } })
  const topInviterGroup = await prisma.user.groupBy({
    by: ['invitedByUserId'],
    where: { createdAt: { gte: startDate, lte: endDate }, invitedByUserId: { not: null } },
    _count: { _all: true },
    orderBy: [{ _count: { invitedByUserId: 'desc' } }],
    take: 1,
  })
  let topInviterUsername: string = '-'
  const firstGroupMonth = topInviterGroup.at(0)
  const inviterIdMonth = firstGroupMonth?.invitedByUserId as string | null | undefined
  if (inviterIdMonth) {
    const inviter = await prisma.user.findUnique({ where: { id: inviterIdMonth } })
    topInviterUsername = inviter?.username ? `@${inviter.username}` : (inviter?.telegramId ?? '-')
  }

  return {
    range: `${start.format('YYYY-MM-DD')} ~ ${end.format('YYYY-MM-DD')}`,
    recordCount,
    recordConsume: recordConsume._sum.cost || 0,
    rechargeCount,
    rechargeAmount: rechargeAmount._sum.fiatAmount?.toNumber() || 0,
    rechargeUsers: rechargeUsers.length,
    averageRecordCount: generationUsers.length === 0 ? 0 : Math.round(recordCount / generationUsers.length),
    newUsers,
    invitedNewUsers,
    topInviterUsername,
  }
}

export function defineAdminCommands() {
  const menu = tgBotService.createMenu('admin')
  menu.add({
    text: '添加积分(/admin addCoins)',
    switch_inline_query_current_chat: `/admin addCoins `,
  }).row()
  menu.add({
    text: '添加Vip时间(/admin addVip)',
    switch_inline_query_current_chat: `/admin addVip `,
  }).row()
  menu.text('当前产品列表(/admin products)', async (ctx) => {
    const products = await prisma.product.findMany({ where: { isActive: true } })
    await ctx.reply(products.map(p => `${p.id} - ${p.name}`).join('\n'), { reply_markup: menu })
  }).row()
  menu.add({
    text: '编辑产品(/admin editProduct)',
    switch_inline_query_current_chat: `/admin editProduct `,
  }).row()
  menu.add({
    text: '搜索用户(/admin search)',
    switch_inline_query_current_chat: `/admin search `,
  }).row()
  menu.text('查看最近一天统计(/admin today)', async (ctx) => {
    const today = await getTodayStatistics()
    await ctx.reply(buildTodayMessage(today), { reply_markup: menu })
  }).row()
  menu.text('查看最近一周统计(/admin week)', async (ctx) => {
    const week = await getWeekStatistics()
    await ctx.reply(buildWeekMessage(week), { reply_markup: menu })
  }).row()
  menu.text('查看最近一个月统计(/admin month)', async (ctx) => {
    const month = await getMonthStatistics()
    await ctx.reply(buildMonthMessage(month), { reply_markup: menu })
  }).row()
  menu.url('加入群组(/admin joinGroup)', () => generateJoinGroupLink('group'))
    .url('加入频道(/admin joinChannel)', () => generateJoinGroupLink('channel'))

  tgBotService.use(menu)
  tgBotService.on('msg:text').filter((ctx) => {
    const message = ctx.message
    if (!message || !message.text) {
      return false
    }

    if (!message.text.includes('/admin')) {
      return false
    }

    return ctx.session.user.telegramId === CONFIG.ADMIN.ID
  }, async (ctx) => {
    const payload = ctx.message?.text?.replace(/^(@\w+\s)?\/admin(@\w+)?\s/, '')
    logger.debug(`[TGAdminService] payload - ${payload}`)
    if (!payload) {
      await ctx.reply(buildAdminTipsMessage(), { reply_markup: menu })
      return
    }

    const [type, ...params] = payload.split(' ').filter(p => p) as [string, string, string]
    logger.debug(`[TGAdminService] type - ${type}, params - ${params}`)
    switch (type) {
      case 'addCoins': {
        logger.info(`[TGAdminService] addCoins: id - ${params[0]}, coins - ${Number.parseInt(params[1])}`)
        if (!params[0] || !params[1]) {
          await ctx.reply('请输入正确的参数，格式为: /admin addCoins <id> <coins>')
          break
        }

        const user = await userService.findByTelegramIdOrThrow(params[0])
        const { coins } = await userService.updateCoins(user.id, Number.parseInt(params[1]))
        tgBotService.forceUpdateSession(user.telegramId)
        await ctx.reply(`添加成功，用户 @${user.username} 的积分为: ${coins}`, { reply_markup: menu })
        break
      }
      case 'addVip': {
        logger.info(`[TGAdminService] addVip: id - ${params[0]}, vip - ${Number.parseInt(params[1])}`)
        if (!params[0] || !params[1]) {
          await ctx.reply('请输入正确的参数，格式为: /admin addVip <id> <vip>')
          break
        }
        const user = await userService.findByTelegramIdOrThrow(params[0])
        const updatedUser = await userService.updateVipDay(user, Number.parseInt(params[1]))
        tgBotService.forceUpdateSession(updatedUser.telegramId)
        await ctx.reply(`添加成功，用户 @${updatedUser.username} 的Vip时间为: ${formatTime(updatedUser.vipExpireAt as Date)}`, { reply_markup: menu })
        break
      }
      case 'products': {
        const products = await prisma.product.findMany({ where: { isActive: true } })
        await ctx.reply(products.map(p => `${p.id} - ${p.name}`).join('\n'), { reply_markup: menu })
        break
      }
      case 'editProduct': {
        if (!params[0]) {
          await ctx.reply('请输入正确的参数，格式为: /admin editProduct <产品ID>')
          break
        }

        const product = await prisma.product.findUniqueOrThrow({ where: { id: params[0] } })
        const menu = new InlineKeyboard()
        menu.add({
          text: '编辑产品数据',
          switch_inline_query_current_chat: `/admin editProductData "${product.id}","${product.name}","${product.type}","${product.description}","${product.price}","${product.value}"`,
        }).row()
        await ctx.reply(buildEditProductMessage(product), { reply_markup: menu })
        break
      }
      case 'editProductData': {
        const [id, name, type, description, price, value] = params.join(' ').split('","').map(str => str.replace(/"/g, ''))
        if (!id) {
          await ctx.reply('请输入正确的参数，格式为: /admin editProductData <产品ID> <产品名称> <产品描述> <产品价格> <产品价值> <产品折扣>')
          break
        }

        logger.info(`[TGAdminService] editProductData: ${[id, name, type, description, price, value].join(',')}`)

        const product = await prisma.product.findUniqueOrThrow({ where: { id } })
        await prisma.$transaction(async (tx) => {
          // 移除旧产品
          await tx.product.update({ where: { id }, data: { isActive: false } })
          // 创建新产品
          await tx.product.create({ data: {
            name: name || product.name,
            type: type || product.type,
            description: description || product.description,
            price: price || product.price,
            value: Number(value) || product.value,
            discount: product.discount,
            displayOrder: product.displayOrder,
            metadata: product.metadata,
          } })
        })
        await ctx.reply(buildEditProductMessage(product), { reply_markup: menu })
        break
      }
      case 'today':
        const today = await getTodayStatistics()
        await ctx.reply(buildTodayMessage(today), { reply_markup: menu })
        break
      case 'week':
        const week = await getWeekStatistics()
        await ctx.reply(buildWeekMessage(week), { reply_markup: menu })
        break
      case 'month':
        const month = await getMonthStatistics()
        await ctx.reply(buildMonthMessage(month), { reply_markup: menu })
        break
      case 'search':{
        const user = await userService.findByKeyword(params[0])
        if (!user) {
          await ctx.reply('未找到用户')
          break
        }

        await ctx.reply(`@${user.username}\n\nTG ID: ${user.telegramId}\n\nID: ${user.id}`, { reply_markup: menu })
        break
      }
      case 'joinGroup': {
        await ctx.reply(generateJoinGroupLink('group'), { reply_markup: menu })
        break
      }
      case 'joinChannel': {
        await ctx.reply(generateJoinGroupLink('channel'), { reply_markup: menu })
        break
      }
      default:
        await ctx.reply(buildAdminTipsMessage(), { reply_markup: menu })
    }
  })
}
