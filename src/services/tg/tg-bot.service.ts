import type { FileApiFlavor, FileFlavor } from '@grammyjs/files'
import type { HydrateApiFlavor, HydrateFlavor } from '@grammyjs/hydrate'
import type { MenuOptions } from '@grammyjs/menu'
import type { User, UserInviteCode } from '@prisma/client'
import type { Api, Context, NextFunction, RawApi, SessionFlavor } from 'grammy'
import type { TFunction } from 'i18next'
import { autoRetry } from '@grammyjs/auto-retry'
import { type ConversationFlavor, conversations, type StringWithCommandSuggestions } from '@grammyjs/conversations'
import { hydrateFiles } from '@grammyjs/files'
import { hydrateApi, hydrateContext } from '@grammyjs/hydrate'
import { Menu } from '@grammyjs/menu'
import { run } from '@grammyjs/runner'
import { PrismaAdapter } from '@grammyjs/storage-prisma'
import { Bot, session } from 'grammy'
import i18next from 'i18next'
import { inject } from 'inversify'
import _ from 'lodash'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { Service } from '../../common/decorators/service.js'
import logger from '../../common/logger.js'
import { prisma } from '../../common/prisma.js'
import { ENV } from '../../constants/env.js'
import i18n, { languages } from '../../locales/index.js'
import { UserService } from '../user/user.service.js'

export type TGBotUser = User & {
  inviteCode: UserInviteCode
}

export interface TGBotSessionData {
  user: TGBotUser
  state?: 'searchTradePair' | 'none'
  pair?: string
  languageCode?: string
  paymentInfo?: {
    productId?: string
    orderId?: string
  }
}

export type TGBotContext = FileFlavor<HydrateFlavor<ConversationFlavor<Context>>> & SessionFlavor<TGBotSessionData> & {
  i18n: typeof i18n
  t: TFunction
}

export type TGBotApi = FileApiFlavor<HydrateApiFlavor<Api>>

export type TGBotMethods<R extends RawApi> = string & keyof R

// eslint-disable-next-line ts/no-empty-object-type, ts/no-explicit-any
export type TGBotPayload<M extends TGBotMethods<R>, R extends RawApi> = M extends unknown ? R[M] extends (signal?: AbortSignal) => unknown ? {} : R[M] extends (args: any, signal?: AbortSignal) => unknown ? Parameters<R[M]>[0] : never : never

export type TGBotApiOther<R extends RawApi, M extends TGBotMethods<R>, X extends string = never> = Omit<TGBotPayload<M, R>, X>

export type TGBotOther<M extends TGBotMethods<RawApi>, X extends string = never> = TGBotApiOther<RawApi, M, X>

export interface TGCommand {
  command: StringWithCommandSuggestions
  description: string
  callback: (ctx: TGBotContext, next: NextFunction) => unknown
  register?: boolean
  private?: boolean
  i18n?: boolean
  i18nData?: () => Record<string, string>
}

@Service()
export class TGBotService extends Bot<TGBotContext, TGBotApi> {
  private commands = new Map<string, TGCommand>()
  private passUpdates = new Set<string>()

  constructor(
    @inject(UserService)
    private readonly userService: UserService,
  ) {
    let socksAgent: SocksProxyAgent | undefined
    if (ENV.SOCKS_PROXY_HOST && ENV.SOCKS_PROXY_PORT) {
      socksAgent = new SocksProxyAgent(`socks5://${ENV.SOCKS_PROXY_HOST}:${ENV.SOCKS_PROXY_PORT}`)
    }

    super(ENV.TELEGRAM_BOT_TOKEN, {
      client: {
        baseFetchConfig: {
          agent: socksAgent,
          compress: true,
        },
      },
    })

    this.use(hydrateContext())
    this.use(conversations())
    this.registerSession()
    this.registerI18n()

    this.api.config.use(hydrateFiles(this.token))
    this.api.config.use(hydrateApi())
    this.api.config.use(autoRetry({
      maxRetryAttempts: 1,
      maxDelaySeconds: 5,
      rethrowInternalServerErrors: false,
      rethrowHttpErrors: false,
    }))
  }

  private registerSession() {
    this.use(session({
      initial: () => ({ user: {} as TGBotUser }),
      storage: new PrismaAdapter(prisma.telegramMessageSession),
    }))

    this.use(async (ctx, next) => {
      logger.debug(`[TGBotService] @${ctx.message?.chat.username}_${ctx.message?.chat.id}: ${ctx.message?.text}`)
      const telegramId = ctx.chatId?.toString()
      if (!telegramId) {
        return next()
      }

      const isPass = this.passUpdates.has(telegramId)
      logger.debug(`[TGBotService] isPass: ${isPass}`)

      // if user is not set, or is not passed, then create a new user
      // if user is set to skip updates, then do not update user
      if (_.isEmpty(ctx.session.user) || !isPass) {
        const user = await this.userService.createIfNotExists({
          telegramId,
          firstName: ctx.from?.first_name ?? '',
          lastName: ctx.from?.last_name ?? '',
          username: ctx.from?.username ?? '',
        })

        ctx.session.user = user

        // after update, set user to skip updates, to avoid frequent database access
        this.passUpdates.add(telegramId)
      }
      await next()
    })

    logger.info('[TGBotService] Register session success')
  }

  private registerI18n() {
    this.use(async (ctx, next) => {
      let canVisitSession = true
      try {
        this.updateSession(ctx, {})
      }
      catch {
        canVisitSession = false
      }

      const i18n = i18next.cloneInstance({ initAsync: false, initImmediate: false })
      const language = ctx.from?.language_code ?? i18n.language
      const languageCode = (language === 'zh-hans' || language === 'zh') ? 'zh' : 'en'

      if (!canVisitSession) {
        ctx.i18n = i18n
        ctx.t = i18n.t.bind(i18n)
        return next()
      }

      this.updateSession(ctx, { languageCode: ctx.session.languageCode ?? languageCode })

      logger.debug(`[TGBotService] languageCode: ${languageCode}`)
      if (ctx.session?.languageCode && ctx.session.languageCode !== languageCode) {
        i18n.changeLanguage(ctx.session.languageCode)
        logger.debug(`[TGBotService] languageCode changed: ${ctx.session.languageCode}`)
      }

      ctx.i18n = i18n
      ctx.t = i18n.t.bind(i18n)
      await next()
    })
  }

  async run() {
    await this.init()
    await this.setupCommands()
    return run(this)
  }

  /**
   * Create a menu
   *
   * If two menus have a dependency relationship(submenu),
   * you must use `menu.register()` to register them in the bot.
   * Otherwise, the menu will not take effect and an error will be reported:
   * `Cannot send menu ${id}! Did you forget to use bot.use() for it or try to send it through bot.api?`
   * @param id - menu id
   * @param options - menu options
   * @returns the menu
   */
  createMenu(id: string, options?: MenuOptions<TGBotContext>) {
    return new Menu<TGBotContext>(id, options)
  }

  /**
   * define a command
   * @param params - command parameters
   */
  defineCommand(params: TGCommand) {
    const { command, callback } = params
    if (params.private) {
      this.on('message').filter(ctx => ctx.msg.chat.type === 'private').command(command, callback)
    }
    else {
      this.command(command, callback)
    }
    this.commands.set(command, params)
  }

  /**
   * setup commands
   */
  async setupCommands() {
    const commands = Array.from(this.commands.values())
    const normalCommands = commands.filter(({ register, description }) => register !== false && description)
    const i18nCommands = normalCommands.filter(({ i18n }) => i18n === true)

    await this.api.setMyCommands(normalCommands.map(({ command, description }) => ({ command, description })))
    languages.forEach((language) => {
      i18n.changeLanguage(language.code)
      this.api.setMyCommands(i18nCommands.map(({ command, description, i18nData }) => ({ command, description: i18n.t(description, i18nData?.() ?? {}) })), { language_code: language.code })
    })
  }

  /**
   * dispatch a command
   * @param ctx - context
   * @param next - next function
   * @param command - command
   */
  dispatchCommand(ctx: TGBotContext, next: NextFunction, command: string) {
    const commandObj = this.commands.get(command)
    if (!commandObj) {
      return next()
    }
    return commandObj.callback(ctx, next)
  }

  /**
   * update session
   * @param ctx - context
   * @param newSession - new session data
   */
  updateSession(ctx: TGBotContext, newSession: Partial<TGBotSessionData>) {
    logger.debug(`[TGBotService] updateSession: ${JSON.stringify(newSession, null, 2)}`)
    // directly assign to ctx.session, trigger Grammy's reactive mechanism(Object.defineProperty)
    ctx.session = {
      ...ctx.session,
      ...newSession,
    }
  }

  /**
   * 更新 session 中的用户数据
   * @param ctx - 上下文
   * @param newUser - 新的用户数据
   */
  updateSessionUser(ctx: TGBotContext, newUser: Partial<TGBotUser>) {
    this.updateSession(ctx, {
      user: {
        ...ctx.session.user,
        ...newUser,
      },
    })
  }

  /**
   * 更新 session 中的用户金币
   * @description 无消耗则不更新，避免频繁访问数据库
   * @param ctx - 上下文
   * @param incrementConsume - 消耗的金币
   */
  async updateSessionUserCoins(ctx: TGBotContext, incrementConsume: number) {
    // 无消耗则不更新
    if (incrementConsume === 0) {
      return
    }

    const { coins } = await this.userService.updateCoins(ctx.session.user.id, incrementConsume)
    this.updateSessionUser(ctx, { coins })
  }

  /**
   * force update session data when next message is received
   * @param telegramId - user id
   */
  forceUpdateSession(telegramId: string) {
    if (!telegramId || !this.passUpdates.has(telegramId)) {
      logger.warn(`[TGBotService] forceUpdateSession: telegramId ${telegramId} not found in passUpdates`)
      return
    }
    this.passUpdates.delete(telegramId)
  }

  /**
   * generate start link
   * @param type - the type of the start link
   * @param params - the params of the start link
   * @returns the start link
   */
  generateStartLink(type: string, ...params: string[]) {
    if (type.includes('_')) {
      throw new Error('type cannot contain underscore')
    }

    const startParamString = `${type}_${params.join('_')}`

    if (startParamString.length > 256)
      throw new Error('start param string is too long')

    return `https://t.me/${this.botInfo.username}?start=${startParamString}`
  }

  /**
   * parse start param
   * @param startParamString - the start param string
   * @returns the type and params
   */
  parserStartParam<T extends string[] = []>(startParamString: string) {
    const [type, ...params] = startParamString.split('_')

    if (!type)
      throw new Error('No type found')

    return { type, params: params as T }
  }
}
