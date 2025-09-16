import type { Prisma, User } from '@prisma/client'
import jsonwebtoken from 'jsonwebtoken'
import { customAlphabet } from 'nanoid'
import { UserCreateInputSchema, UserUpdateInputSchema } from '../../../prisma/generated/zod/index.js'
import { utcNow } from '../../common/date.js'
import { Service } from '../../common/decorators/service.js'
import { ApiError, ApiErrorCode } from '../../common/errors.js'
import logger from '../../common/logger.js'
import { prisma } from '../../common/prisma.js'
import { CONFIG } from '../../constants/config.js'
import { ENV } from '../../constants/env.js'

@Service()
export class UserService {
  readonly inviteCodeGenerator = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)

  constructor() {}

  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.$transaction(async ($tx) => {
      const user = await $tx.user.create({ data: UserCreateInputSchema.parse(data) })
      const [inviteCode] = await this.createInviteCode(user.id, $tx)

      return {
        ...user,
        inviteCode,
      }
    })
    return user
  }

  /**
   * 创建用户
   * @param data 用户数据
   * @returns 用户
   */
  async createIfNotExists(data: Prisma.UserCreateInput) {
    const user = await prisma.user.findUnique({
      where: {
        telegramId: data.telegramId,
      },
      include: {
        inviteCodes: true,
      },
    })

    if (user) {
      let inviteCode = user.inviteCodes[0]
      if (!inviteCode) {
        [inviteCode] = await this.createInviteCode(user.id)
      }

      return {
        ...user,
        inviteCode,
      }
    }

    return await this.create(data)
  }

  /**
   * 使用邀请码创建用户
   * @param code 邀请码
   * @param data 用户数据
   * @returns 用户
   */
  async createAndUseInviteCode(code: string, data: Omit<Prisma.UserCreateInput, 'InvitedBy'>) {
    const inviteCode = await prisma.userInviteCode.findUnique({
      where: {
        code,
      },
      include: {
        User: true,
      },
    })

    if (!inviteCode) {
      throw new ApiError(ApiErrorCode.USER_INVALID_INVITE_CODE, 'Invalid invite code')
    }

    // 如果邀请码已过期，则抛出错误
    if (inviteCode.expiresAt && inviteCode.expiresAt < new Date()) {
      throw new ApiError(ApiErrorCode.USER_INVALID_INVITE_CODE, 'Invite code expired')
    }

    // 一对一限制
    // if (inviteCode.isUsed) {
    //   throw new ApiError(ApiErrorCode.INVALID_INVITE_CODE, 'Invite code already used')
    // }

    const newUser = await prisma.$transaction(async ($tx) => {
      // 创建用户
      const newUser = await $tx.user.create({ data: {
        ...UserCreateInputSchema.parse(data),
        InvitedBy: { connect: { id: inviteCode.User.id } },
      } })

      await Promise.all([
        // 1. 创建邀请码
        $tx.userInviteCode.create({
          data: {
            code: this.inviteCodeGenerator(),
            User: { connect: { id: newUser.id } },
          },
        }),

        // 2. 更新邀请码状态
        $tx.userInviteCode.update({
          where: { code },
          data: { isUsed: true, usedByUserId: newUser.id },
        }),

        // 3. 更新闭包表
        $tx.$executeRaw`
          INSERT OR IGNORE INTO UserAncestor (ancestorId, descendantId, depth)
          SELECT ancestorId, ${newUser.id}, depth + 1
          FROM UserAncestor
          WHERE descendantId = ${inviteCode.User.id}
          AND depth < ${CONFIG.MAX_INVITE_DEPTH}
          UNION ALL
          SELECT ${newUser.id}, ${newUser.id}, 0
        `,
      ])

      return newUser
    })

    return newUser
  }

  /**
   * 创建邀请码
   * @param userId 用户id
   * @param $tx 事务
   * @returns 邀请码
   */
  createInviteCode(userId: string, $tx: Prisma.TransactionClient = prisma) {
    return Promise.all([
    // 创建邀请码
      $tx.userInviteCode.create({
        data: {
          code: this.inviteCodeGenerator(),
          User: { connect: { id: userId } },
        },
      }),

      // 插入用户到自己的关系
      $tx.$executeRaw`
      INSERT OR IGNORE INTO UserAncestor (ancestorId, descendantId, depth)
      VALUES (${userId}, ${userId}, 0)
    `,
    ])
  }

  /**
   * 创建邀请关系
   * @param descendant 被邀请用户
   * @param code 邀请码
   * @returns 是否成功
   */
  async createInviteRelation(descendant: User, code: string) {
    const inviteCode = await prisma.userInviteCode.findUnique({
      where: {
        code,
      },
      include: {
        User: true,
      },
    })

    if (!inviteCode) {
      throw new ApiError(ApiErrorCode.USER_INVALID_INVITE_CODE, 'Invalid invite code')
    }

    const ancestor = inviteCode.User

    // 检查邀请关系是否有效
    if (ancestor.id === descendant.id) {
      throw new ApiError(ApiErrorCode.USER_INVALID_INVITE_RELATION, 'Cannot invite yourself')
    }

    // 检查被邀请用户是否已经被邀请过
    if (descendant.invitedByUserId) {
      throw new ApiError(ApiErrorCode.USER_INVALID_INVITE_RELATION, 'Descendant already invited')
    }

    // 一对一限制
    // if (inviteCode.isUsed) {
    //   throw new ApiError(ApiErrorCode.INVALID_INVITE_CODE, 'Invite code already used')
    // }

    await prisma.$transaction([
      // 1. 更新邀请码状态
      prisma.userInviteCode.update({
        where: { code },
        data: { isUsed: true, usedByUserId: descendant.id },
      }),

      // 2. 记录直接上级
      prisma.user.update({
        where: { id: descendant.id },
        data: { InvitedBy: { connect: { id: ancestor.id } } },
      }),

      // 3. 更新闭包表
      prisma.$executeRaw`
        INSERT OR IGNORE INTO UserAncestor (ancestorId, descendantId, depth)
        SELECT ancestorId, ${descendant.id}, depth + 1
        FROM UserAncestor
        WHERE descendantId = ${ancestor.id}
        AND depth < ${CONFIG.MAX_INVITE_DEPTH}
        UNION ALL
        SELECT ${descendant.id}, ${descendant.id}, 0
      `,
    ])

    return inviteCode.User
  }

  /**
   * 更新用户
   * @param userId 用户ID
   * @param data 用户数据
   * @param $tx 事务
   * @returns 用户
   */
  update(userId: string, data: Prisma.UserUpdateInput, $tx: Prisma.TransactionClient = prisma) {
    return $tx.user.update({ where: { id: userId }, data: UserUpdateInputSchema.parse(data) })
  }

  /**
   * 更新用户coins
   * @param userId 用户ID
   * @param coins 增加的coins
   * @param $tx 事务
   * @returns 用户
   */
  updateCoins(userId: string, coins: number, $tx: Prisma.TransactionClient = prisma) {
    return $tx.user.update({ where: { id: userId }, data: { coins: { increment: coins } } })
  }

  /**
   * 更新用户vipDay
   * @param user 用户
   * @param vipDay 增加的时间（天）, 0 表示取消会员
   * @param $tx 事务
   * @returns 用户
   */
  updateVipDay(user: User, vipDay: number, $tx: Prisma.TransactionClient = prisma) {
    const isVip = vipDay > 0
    const vipStartAt = isVip ? user.vipStartAt || new Date() : null
    const vipExpireAt = isVip ? utcNow(user.vipExpireAt || new Date()).add(vipDay, 'day').endOf('day').toDate() : null

    logger.info(`[UserService] updateVipDay: ${user.id} - ${vipDay} - ${isVip} - ${vipStartAt} - ${vipExpireAt}`)

    return $tx.user.update({
      where: { id: user.id },
      data: {
        isVip,
        vipStartAt,
        vipExpireAt,
      },
    })
  }

  /**
   * 生成JWT
   * @param user 用户
   * @param isMiniApp 是否是TG小程序
   * @returns JWT
   */
  generateJWT(user: User, isMiniApp = true) {
    const expiresAt = utcNow().add(30, 'days').valueOf().toString()
    const signData: Record<string, unknown> = {
      id: user.id,
      expiresAt,
      username: user.username,
      isMiniApp,
    }

    return {
      token: jsonwebtoken.sign(signData, ENV.SERVER_AUTH_PASSWORD, { expiresIn: '30d' }),
      expiresAt,
    }
  }

  /**
   * 根据Telegram ID查找用户
   * @param telegramId Telegram ID
   * @returns 用户
   */
  findByTelegramIdOrThrow(telegramId: string) {
    return prisma.user.findUniqueOrThrow({
      where: { telegramId },
      include: { inviteCodes: true },
    })
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户
   */
  findByIdOrThrow(id: string) {
    return prisma.user.findUniqueOrThrow({ where: { id }, include: { inviteCodes: true } })
  }

  findByKeyword(keyword: string) {
    return prisma.user.findFirst({
      where: {
        OR: [
          { username: { contains: keyword } },
          { telegramId: { contains: keyword } },
          { id: { contains: keyword } },
          { firstName: { contains: keyword } },
          { lastName: { contains: keyword } },
        ],
      },
    })
  }

  /**
   * 验证JWT
   * @param token JWT
   * @returns 用户
   */
  verifyJWT(token: string) {
    const decoded = jsonwebtoken.verify(token, ENV.SERVER_AUTH_PASSWORD) as User
    if (!decoded) {
      throw new ApiError(ApiErrorCode.UNAUTHORIZED, 'Invalid token')
    }

    if (decoded.telegramId) {
      return this.findByTelegramIdOrThrow(decoded.telegramId)
    }
    else {
      return this.findByIdOrThrow(decoded.id)
    }
  }

  /**
   * 获取用户的上级
   * @param user 用户
   * @param maxDepth 最大深度
   * @returns 上级
   */
  async getAncestors(user: User, maxDepth: number = CONFIG.MAX_INVITE_DEPTH) {
    const ancestors = await prisma.user.findMany({
      where: {
        DescendantRelations: {
          some: {
            descendantId: user.id,
            depth: { gt: 0, lte: maxDepth }, // 排除自己并限制深度
          },
        },
      },
    })
    return ancestors
  }

  /**
   * 获取用户的下级
   * @param user 用户
   * @param maxDepth 最大深度
   * @returns 下级
   */
  async getDescendants(user: User, maxDepth: number = CONFIG.MAX_INVITE_DEPTH) {
    const descendants = await prisma.user.findMany({
      where: {
        DescendantRelations: {
          some: {
            ancestorId: user.id,
            depth: { gt: 0, lte: maxDepth }, // 排除自己并限制深度
          },
        },
      },
    })
    return descendants
  }
}
