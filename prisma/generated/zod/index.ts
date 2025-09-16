import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// DECIMAL
//------------------------------------------------------

export const DecimalJsLikeSchema: z.ZodType<Prisma.DecimalJsLike> = z.object({
  d: z.array(z.number()),
  e: z.number(),
  s: z.number(),
  toFixed: z.function(z.tuple([]), z.string()),
})

export const DECIMAL_STRING_REGEX = /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/;

export const isValidDecimalInput =
  (v?: null | string | number | Prisma.DecimalJsLike): v is string | number | Prisma.DecimalJsLike => {
    if (v === undefined || v === null) return false;
    return (
      (typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
      (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
      typeof v === 'number'
    )
  };

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','telegramId','username','firstName','lastName','photoUrl','coins','isVip','vipStartAt','vipExpireAt','vipLevel','isTelegramPremium','invitedByUserId','createdAt','updatedAt']);

export const UserInviteCodeScalarFieldEnumSchema = z.enum(['id','code','createdAt','expiresAt','isUsed','usedByUserId','userId']);

export const UserAncestorScalarFieldEnumSchema = z.enum(['ancestorId','descendantId','depth','userId']);

export const OrderScalarFieldEnumSchema = z.enum(['id','userId','paymentType','paymentLink','externalPaymentId','amount','fiatAmount','exchangeRate','rateValidSeconds','customExpiration','expireAt','status','paymentData','lastCheckedAt','paidAt','transactionId','createdAt','updatedAt']);

export const UserOrderScalarFieldEnumSchema = z.enum(['id','userId','orderId','quantity','status','completedAt','productId','createdAt','updatedAt']);

export const OrderStatusHistoryScalarFieldEnumSchema = z.enum(['id','from','to','changedAt','metadata','orderId']);

export const ProductScalarFieldEnumSchema = z.enum(['id','name','description','type','price','value','discount','isActive','displayOrder','metadata','createdAt','updatedAt']);

export const TelegramMessageSessionScalarFieldEnumSchema = z.enum(['id','key','value']);

export const UserAnalysisResultScalarFieldEnumSchema = z.enum(['id','symbol','type','result','userId','cost','createdAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullsOrderSchema = z.enum(['first','last']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

/**
 * 用户表
 */
export const UserSchema = z.object({
  /**
   * Telegram 用户 ID
   */
  id: z.string(),
  /**
   * Telegram 用户 ID
   */
  telegramId: z.string(),
  /**
   * Telegram 用户名
   */
  username: z.string().nullable(),
  /**
   * Telegram 名
   */
  firstName: z.string().nullable(),
  /**
   * Telegram 姓
   */
  lastName: z.string().nullable(),
  /**
   * Telegram 头像
   */
  photoUrl: z.string().nullable(),
  /**
   * 用户金币余额
   */
  coins: z.number().int(),
  /**
   * 是否是会员
   */
  isVip: z.boolean(),
  /**
   * 会员开始时间
   */
  vipStartAt: z.coerce.date().nullable(),
  /**
   * 会员过期时间
   */
  vipExpireAt: z.coerce.date().nullable(),
  /**
   * 会员等级
   */
  vipLevel: z.number().int(),
  /**
   * 是否是 Telegram 高级会员
   */
  isTelegramPremium: z.boolean(),
  /**
   * 直接上级用户ID
   */
  invitedByUserId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// USER INVITE CODE SCHEMA
/////////////////////////////////////////

/**
 * 用户邀请码表
 */
export const UserInviteCodeSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
  /**
   * 是否已使用
   */
  isUsed: z.boolean(),
  /**
   * 使用者用户ID
   */
  usedByUserId: z.string().nullable(),
  /**
   * 所属用户
   */
  userId: z.string(),
})

export type UserInviteCode = z.infer<typeof UserInviteCodeSchema>

/////////////////////////////////////////
// USER ANCESTOR SCHEMA
/////////////////////////////////////////

/**
 * 用户祖先表
 */
export const UserAncestorSchema = z.object({
  /**
   * 祖先用户ID
   */
  ancestorId: z.string(),
  /**
   * 后代用户ID
   */
  descendantId: z.string(),
  /**
   * 深度
   */
  depth: z.number().int(),
  /**
   * 所属用户ID
   */
  userId: z.string().nullable(),
})

export type UserAncestor = z.infer<typeof UserAncestorSchema>

/////////////////////////////////////////
// ORDER SCHEMA
/////////////////////////////////////////

/**
 * 订单表
 */
export const OrderSchema = z.object({
  id: z.string(),
  /**
   * 用户ID
   */
  userId: z.string(),
  /**
   * 支付类型，如 "telegram_stars"、"ton"等
   */
  paymentType: z.string(),
  /**
   * 支付链接
   */
  paymentLink: z.string().nullable(),
  /**
   * 外部支付交易ID
   */
  externalPaymentId: z.string().nullable(),
  /**
   * 主要货币金额
   */
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'Order']"}),
  /**
   * 法币等值金额
   */
  fiatAmount: z.instanceof(Prisma.Decimal, { message: "Field 'fiatAmount' must be a Decimal. Location: ['Models', 'Order']"}),
  /**
   * 汇率
   */
  exchangeRate: z.instanceof(Prisma.Decimal, { message: "Field 'exchangeRate' must be a Decimal. Location: ['Models', 'Order']"}),
  /**
   * 汇率有效时间（秒），默认10分钟
   */
  rateValidSeconds: z.number().int(),
  /**
   * 单位秒（业务层验证1~604800）
   */
  customExpiration: z.number().int(),
  /**
   * 过期时间
   */
  expireAt: z.coerce.date(),
  /**
   * 可扩展状态
   */
  status: z.string(),
  /**
   * 原始支付数据
   */
  paymentData: z.string().nullable(),
  /**
   * 最后检查时间
   */
  lastCheckedAt: z.coerce.date().nullable(),
  /**
   * 支付时间
   */
  paidAt: z.coerce.date().nullable(),
  /**
   * 支付交易ID
   */
  transactionId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Order = z.infer<typeof OrderSchema>

/////////////////////////////////////////
// USER ORDER SCHEMA
/////////////////////////////////////////

/**
 * 用户订单关联表
 */
export const UserOrderSchema = z.object({
  id: z.string(),
  /**
   * 用户ID
   */
  userId: z.string(),
  /**
   * 订单ID
   */
  orderId: z.string(),
  /**
   * 购买数量
   */
  quantity: z.number().int(),
  /**
   * 订单状态
   */
  status: z.string(),
  /**
   * 订单完成时间
   */
  completedAt: z.coerce.date().nullable(),
  /**
   * 商品ID
   */
  productId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserOrder = z.infer<typeof UserOrderSchema>

/////////////////////////////////////////
// ORDER STATUS HISTORY SCHEMA
/////////////////////////////////////////

/**
 * 订单状态变更记录表
 */
export const OrderStatusHistorySchema = z.object({
  id: z.string(),
  /**
   * 从xx状态到xx状态
   */
  from: z.string(),
  to: z.string(),
  /**
   * 变更时间
   */
  changedAt: z.coerce.date(),
  /**
   * 元数据
   */
  metadata: z.string().nullable(),
  /**
   * 订单ID
   */
  orderId: z.string(),
})

export type OrderStatusHistory = z.infer<typeof OrderStatusHistorySchema>

/////////////////////////////////////////
// PRODUCT SCHEMA
/////////////////////////////////////////

/**
 * 商品表
 */
export const ProductSchema = z.object({
  id: z.string(),
  /**
   * 商品名称
   */
  name: z.string(),
  /**
   * 商品描述
   */
  description: z.string().nullable(),
  /**
   * 商品类型
   */
  type: z.string(),
  /**
   * 价格
   */
  price: z.instanceof(Prisma.Decimal, { message: "Field 'price' must be a Decimal. Location: ['Models', 'Product']"}),
  /**
   * 商品价值，如果商品类型为金币，则表示金币数量
   */
  value: z.number().int(),
  /**
   * 折扣百分比（如20%的折扣为20）
   */
  discount: z.number().int(),
  /**
   * 是否激活
   */
  isActive: z.boolean(),
  /**
   * 展示顺序
   */
  displayOrder: z.number().int(),
  /**
   * 扩展数据
   */
  metadata: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Product = z.infer<typeof ProductSchema>

/////////////////////////////////////////
// TELEGRAM MESSAGE SESSION SCHEMA
/////////////////////////////////////////

/**
 * Telegram 消息会话表
 */
export const TelegramMessageSessionSchema = z.object({
  id: z.number().int(),
  key: z.string(),
  value: z.string(),
})

export type TelegramMessageSession = z.infer<typeof TelegramMessageSessionSchema>

/////////////////////////////////////////
// USER ANALYSIS RESULT SCHEMA
/////////////////////////////////////////

/**
 * 用户分析结果记录表
 */
export const UserAnalysisResultSchema = z.object({
  id: z.string(),
  /**
   * 符号
   */
  symbol: z.string(),
  /**
   * 类型
   */
  type: z.string(),
  /**
   * 结果
   */
  result: z.string(),
  /**
   * 用户ID
   */
  userId: z.string(),
  /**
   * 消耗
   */
  cost: z.number().int(),
  createdAt: z.coerce.date(),
})

export type UserAnalysisResult = z.infer<typeof UserAnalysisResultSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  inviteCodes: z.union([z.boolean(),z.lazy(() => UserInviteCodeFindManyArgsSchema)]).optional(),
  InvitedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  InvitedUsers: z.union([z.boolean(),z.lazy(() => UserFindManyArgsSchema)]).optional(),
  AncestorRelations: z.union([z.boolean(),z.lazy(() => UserAncestorFindManyArgsSchema)]).optional(),
  DescendantRelations: z.union([z.boolean(),z.lazy(() => UserAncestorFindManyArgsSchema)]).optional(),
  UserAncestors: z.union([z.boolean(),z.lazy(() => UserAncestorFindManyArgsSchema)]).optional(),
  UsedInviteCodes: z.union([z.boolean(),z.lazy(() => UserInviteCodeFindManyArgsSchema)]).optional(),
  Order: z.union([z.boolean(),z.lazy(() => OrderFindManyArgsSchema)]).optional(),
  UserOrder: z.union([z.boolean(),z.lazy(() => UserOrderFindManyArgsSchema)]).optional(),
  UserAnalysisResult: z.union([z.boolean(),z.lazy(() => UserAnalysisResultFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  inviteCodes: z.boolean().optional(),
  InvitedUsers: z.boolean().optional(),
  AncestorRelations: z.boolean().optional(),
  DescendantRelations: z.boolean().optional(),
  UserAncestors: z.boolean().optional(),
  UsedInviteCodes: z.boolean().optional(),
  Order: z.boolean().optional(),
  UserOrder: z.boolean().optional(),
  UserAnalysisResult: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  telegramId: z.boolean().optional(),
  username: z.boolean().optional(),
  firstName: z.boolean().optional(),
  lastName: z.boolean().optional(),
  photoUrl: z.boolean().optional(),
  coins: z.boolean().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.boolean().optional(),
  vipExpireAt: z.boolean().optional(),
  vipLevel: z.boolean().optional(),
  isTelegramPremium: z.boolean().optional(),
  invitedByUserId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  inviteCodes: z.union([z.boolean(),z.lazy(() => UserInviteCodeFindManyArgsSchema)]).optional(),
  InvitedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  InvitedUsers: z.union([z.boolean(),z.lazy(() => UserFindManyArgsSchema)]).optional(),
  AncestorRelations: z.union([z.boolean(),z.lazy(() => UserAncestorFindManyArgsSchema)]).optional(),
  DescendantRelations: z.union([z.boolean(),z.lazy(() => UserAncestorFindManyArgsSchema)]).optional(),
  UserAncestors: z.union([z.boolean(),z.lazy(() => UserAncestorFindManyArgsSchema)]).optional(),
  UsedInviteCodes: z.union([z.boolean(),z.lazy(() => UserInviteCodeFindManyArgsSchema)]).optional(),
  Order: z.union([z.boolean(),z.lazy(() => OrderFindManyArgsSchema)]).optional(),
  UserOrder: z.union([z.boolean(),z.lazy(() => UserOrderFindManyArgsSchema)]).optional(),
  UserAnalysisResult: z.union([z.boolean(),z.lazy(() => UserAnalysisResultFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// USER INVITE CODE
//------------------------------------------------------

export const UserInviteCodeIncludeSchema: z.ZodType<Prisma.UserInviteCodeInclude> = z.object({
  UsedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserInviteCodeArgsSchema: z.ZodType<Prisma.UserInviteCodeDefaultArgs> = z.object({
  select: z.lazy(() => UserInviteCodeSelectSchema).optional(),
  include: z.lazy(() => UserInviteCodeIncludeSchema).optional(),
}).strict();

export const UserInviteCodeSelectSchema: z.ZodType<Prisma.UserInviteCodeSelect> = z.object({
  id: z.boolean().optional(),
  code: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  isUsed: z.boolean().optional(),
  usedByUserId: z.boolean().optional(),
  userId: z.boolean().optional(),
  UsedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// USER ANCESTOR
//------------------------------------------------------

export const UserAncestorIncludeSchema: z.ZodType<Prisma.UserAncestorInclude> = z.object({
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  Ancestor: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  Descendant: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserAncestorArgsSchema: z.ZodType<Prisma.UserAncestorDefaultArgs> = z.object({
  select: z.lazy(() => UserAncestorSelectSchema).optional(),
  include: z.lazy(() => UserAncestorIncludeSchema).optional(),
}).strict();

export const UserAncestorSelectSchema: z.ZodType<Prisma.UserAncestorSelect> = z.object({
  ancestorId: z.boolean().optional(),
  descendantId: z.boolean().optional(),
  depth: z.boolean().optional(),
  userId: z.boolean().optional(),
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  Ancestor: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  Descendant: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// ORDER
//------------------------------------------------------

export const OrderIncludeSchema: z.ZodType<Prisma.OrderInclude> = z.object({
  OrderStatusHistory: z.union([z.boolean(),z.lazy(() => OrderStatusHistoryFindManyArgsSchema)]).optional(),
  UserOrders: z.union([z.boolean(),z.lazy(() => UserOrderArgsSchema)]).optional(),
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => OrderCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const OrderArgsSchema: z.ZodType<Prisma.OrderDefaultArgs> = z.object({
  select: z.lazy(() => OrderSelectSchema).optional(),
  include: z.lazy(() => OrderIncludeSchema).optional(),
}).strict();

export const OrderCountOutputTypeArgsSchema: z.ZodType<Prisma.OrderCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => OrderCountOutputTypeSelectSchema).nullish(),
}).strict();

export const OrderCountOutputTypeSelectSchema: z.ZodType<Prisma.OrderCountOutputTypeSelect> = z.object({
  OrderStatusHistory: z.boolean().optional(),
}).strict();

export const OrderSelectSchema: z.ZodType<Prisma.OrderSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  paymentType: z.boolean().optional(),
  paymentLink: z.boolean().optional(),
  externalPaymentId: z.boolean().optional(),
  amount: z.boolean().optional(),
  fiatAmount: z.boolean().optional(),
  exchangeRate: z.boolean().optional(),
  rateValidSeconds: z.boolean().optional(),
  customExpiration: z.boolean().optional(),
  expireAt: z.boolean().optional(),
  status: z.boolean().optional(),
  paymentData: z.boolean().optional(),
  lastCheckedAt: z.boolean().optional(),
  paidAt: z.boolean().optional(),
  transactionId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  OrderStatusHistory: z.union([z.boolean(),z.lazy(() => OrderStatusHistoryFindManyArgsSchema)]).optional(),
  UserOrders: z.union([z.boolean(),z.lazy(() => UserOrderArgsSchema)]).optional(),
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => OrderCountOutputTypeArgsSchema)]).optional(),
}).strict()

// USER ORDER
//------------------------------------------------------

export const UserOrderIncludeSchema: z.ZodType<Prisma.UserOrderInclude> = z.object({
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  Order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
  Product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
}).strict()

export const UserOrderArgsSchema: z.ZodType<Prisma.UserOrderDefaultArgs> = z.object({
  select: z.lazy(() => UserOrderSelectSchema).optional(),
  include: z.lazy(() => UserOrderIncludeSchema).optional(),
}).strict();

export const UserOrderSelectSchema: z.ZodType<Prisma.UserOrderSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  orderId: z.boolean().optional(),
  quantity: z.boolean().optional(),
  status: z.boolean().optional(),
  completedAt: z.boolean().optional(),
  productId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  Order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
  Product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
}).strict()

// ORDER STATUS HISTORY
//------------------------------------------------------

export const OrderStatusHistoryIncludeSchema: z.ZodType<Prisma.OrderStatusHistoryInclude> = z.object({
  Order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
}).strict()

export const OrderStatusHistoryArgsSchema: z.ZodType<Prisma.OrderStatusHistoryDefaultArgs> = z.object({
  select: z.lazy(() => OrderStatusHistorySelectSchema).optional(),
  include: z.lazy(() => OrderStatusHistoryIncludeSchema).optional(),
}).strict();

export const OrderStatusHistorySelectSchema: z.ZodType<Prisma.OrderStatusHistorySelect> = z.object({
  id: z.boolean().optional(),
  from: z.boolean().optional(),
  to: z.boolean().optional(),
  changedAt: z.boolean().optional(),
  metadata: z.boolean().optional(),
  orderId: z.boolean().optional(),
  Order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
}).strict()

// PRODUCT
//------------------------------------------------------

export const ProductIncludeSchema: z.ZodType<Prisma.ProductInclude> = z.object({
  UserOrders: z.union([z.boolean(),z.lazy(() => UserOrderFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ProductArgsSchema: z.ZodType<Prisma.ProductDefaultArgs> = z.object({
  select: z.lazy(() => ProductSelectSchema).optional(),
  include: z.lazy(() => ProductIncludeSchema).optional(),
}).strict();

export const ProductCountOutputTypeArgsSchema: z.ZodType<Prisma.ProductCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ProductCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ProductCountOutputTypeSelectSchema: z.ZodType<Prisma.ProductCountOutputTypeSelect> = z.object({
  UserOrders: z.boolean().optional(),
}).strict();

export const ProductSelectSchema: z.ZodType<Prisma.ProductSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  description: z.boolean().optional(),
  type: z.boolean().optional(),
  price: z.boolean().optional(),
  value: z.boolean().optional(),
  discount: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.boolean().optional(),
  metadata: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  UserOrders: z.union([z.boolean(),z.lazy(() => UserOrderFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductCountOutputTypeArgsSchema)]).optional(),
}).strict()

// TELEGRAM MESSAGE SESSION
//------------------------------------------------------

export const TelegramMessageSessionSelectSchema: z.ZodType<Prisma.TelegramMessageSessionSelect> = z.object({
  id: z.boolean().optional(),
  key: z.boolean().optional(),
  value: z.boolean().optional(),
}).strict()

// USER ANALYSIS RESULT
//------------------------------------------------------

export const UserAnalysisResultIncludeSchema: z.ZodType<Prisma.UserAnalysisResultInclude> = z.object({
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserAnalysisResultArgsSchema: z.ZodType<Prisma.UserAnalysisResultDefaultArgs> = z.object({
  select: z.lazy(() => UserAnalysisResultSelectSchema).optional(),
  include: z.lazy(() => UserAnalysisResultIncludeSchema).optional(),
}).strict();

export const UserAnalysisResultSelectSchema: z.ZodType<Prisma.UserAnalysisResultSelect> = z.object({
  id: z.boolean().optional(),
  symbol: z.boolean().optional(),
  type: z.boolean().optional(),
  result: z.boolean().optional(),
  userId: z.boolean().optional(),
  cost: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  telegramId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  username: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  firstName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  photoUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  coins: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  isVip: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  vipStartAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  vipExpireAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  vipLevel: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  isTelegramPremium: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  invitedByUserId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeListRelationFilterSchema).optional(),
  InvitedBy: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  InvitedUsers: z.lazy(() => UserListRelationFilterSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorListRelationFilterSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorListRelationFilterSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorListRelationFilterSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeListRelationFilterSchema).optional(),
  Order: z.lazy(() => OrderListRelationFilterSchema).optional(),
  UserOrder: z.lazy(() => UserOrderListRelationFilterSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultListRelationFilterSchema).optional()
}).strict();

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  telegramId: z.lazy(() => SortOrderSchema).optional(),
  username: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  firstName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  photoUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  coins: z.lazy(() => SortOrderSchema).optional(),
  isVip: z.lazy(() => SortOrderSchema).optional(),
  vipStartAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  vipExpireAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  vipLevel: z.lazy(() => SortOrderSchema).optional(),
  isTelegramPremium: z.lazy(() => SortOrderSchema).optional(),
  invitedByUserId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeOrderByRelationAggregateInputSchema).optional(),
  InvitedBy: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserOrderByRelationAggregateInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorOrderByRelationAggregateInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorOrderByRelationAggregateInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorOrderByRelationAggregateInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeOrderByRelationAggregateInputSchema).optional(),
  Order: z.lazy(() => OrderOrderByRelationAggregateInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderOrderByRelationAggregateInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultOrderByRelationAggregateInputSchema).optional()
}).strict();

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.string(),
    telegramId: z.string()
  }),
  z.object({
    id: z.string(),
  }),
  z.object({
    telegramId: z.string(),
  }),
])
.and(z.object({
  id: z.string().optional(),
  telegramId: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  username: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  firstName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  photoUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  coins: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  isVip: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  vipStartAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  vipExpireAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  vipLevel: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  isTelegramPremium: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  invitedByUserId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeListRelationFilterSchema).optional(),
  InvitedBy: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  InvitedUsers: z.lazy(() => UserListRelationFilterSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorListRelationFilterSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorListRelationFilterSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorListRelationFilterSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeListRelationFilterSchema).optional(),
  Order: z.lazy(() => OrderListRelationFilterSchema).optional(),
  UserOrder: z.lazy(() => UserOrderListRelationFilterSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultListRelationFilterSchema).optional()
}).strict());

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  telegramId: z.lazy(() => SortOrderSchema).optional(),
  username: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  firstName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  photoUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  coins: z.lazy(() => SortOrderSchema).optional(),
  isVip: z.lazy(() => SortOrderSchema).optional(),
  vipStartAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  vipExpireAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  vipLevel: z.lazy(() => SortOrderSchema).optional(),
  isTelegramPremium: z.lazy(() => SortOrderSchema).optional(),
  invitedByUserId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  telegramId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  username: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  firstName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  photoUrl: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  coins: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  isVip: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  vipStartAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  vipExpireAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  vipLevel: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  isTelegramPremium: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  invitedByUserId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserInviteCodeWhereInputSchema: z.ZodType<Prisma.UserInviteCodeWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserInviteCodeWhereInputSchema),z.lazy(() => UserInviteCodeWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserInviteCodeWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserInviteCodeWhereInputSchema),z.lazy(() => UserInviteCodeWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  code: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  isUsed: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  usedByUserId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  UsedBy: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  User: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const UserInviteCodeOrderByWithRelationInputSchema: z.ZodType<Prisma.UserInviteCodeOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isUsed: z.lazy(() => SortOrderSchema).optional(),
  usedByUserId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  UsedBy: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  User: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const UserInviteCodeWhereUniqueInputSchema: z.ZodType<Prisma.UserInviteCodeWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    code: z.string()
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    code: z.string(),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  code: z.string().optional(),
  AND: z.union([ z.lazy(() => UserInviteCodeWhereInputSchema),z.lazy(() => UserInviteCodeWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserInviteCodeWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserInviteCodeWhereInputSchema),z.lazy(() => UserInviteCodeWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  isUsed: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  usedByUserId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  UsedBy: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  User: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const UserInviteCodeOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserInviteCodeOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isUsed: z.lazy(() => SortOrderSchema).optional(),
  usedByUserId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserInviteCodeCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserInviteCodeAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserInviteCodeMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserInviteCodeMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserInviteCodeSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserInviteCodeScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserInviteCodeScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserInviteCodeScalarWhereWithAggregatesInputSchema),z.lazy(() => UserInviteCodeScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserInviteCodeScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserInviteCodeScalarWhereWithAggregatesInputSchema),z.lazy(() => UserInviteCodeScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  code: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  isUsed: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  usedByUserId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const UserAncestorWhereInputSchema: z.ZodType<Prisma.UserAncestorWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserAncestorWhereInputSchema),z.lazy(() => UserAncestorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserAncestorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserAncestorWhereInputSchema),z.lazy(() => UserAncestorWhereInputSchema).array() ]).optional(),
  ancestorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  descendantId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  depth: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  User: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  Ancestor: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  Descendant: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const UserAncestorOrderByWithRelationInputSchema: z.ZodType<Prisma.UserAncestorOrderByWithRelationInput> = z.object({
  ancestorId: z.lazy(() => SortOrderSchema).optional(),
  descendantId: z.lazy(() => SortOrderSchema).optional(),
  depth: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  User: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  Ancestor: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  Descendant: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const UserAncestorWhereUniqueInputSchema: z.ZodType<Prisma.UserAncestorWhereUniqueInput> = z.object({
  ancestorId_descendantId: z.lazy(() => UserAncestorAncestorIdDescendantIdCompoundUniqueInputSchema)
})
.and(z.object({
  ancestorId_descendantId: z.lazy(() => UserAncestorAncestorIdDescendantIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => UserAncestorWhereInputSchema),z.lazy(() => UserAncestorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserAncestorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserAncestorWhereInputSchema),z.lazy(() => UserAncestorWhereInputSchema).array() ]).optional(),
  ancestorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  descendantId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  depth: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  User: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  Ancestor: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  Descendant: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const UserAncestorOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserAncestorOrderByWithAggregationInput> = z.object({
  ancestorId: z.lazy(() => SortOrderSchema).optional(),
  descendantId: z.lazy(() => SortOrderSchema).optional(),
  depth: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => UserAncestorCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserAncestorAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserAncestorMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserAncestorMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserAncestorSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserAncestorScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserAncestorScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserAncestorScalarWhereWithAggregatesInputSchema),z.lazy(() => UserAncestorScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserAncestorScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserAncestorScalarWhereWithAggregatesInputSchema),z.lazy(() => UserAncestorScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  ancestorId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  descendantId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  depth: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const OrderWhereInputSchema: z.ZodType<Prisma.OrderWhereInput> = z.object({
  AND: z.union([ z.lazy(() => OrderWhereInputSchema),z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderWhereInputSchema),z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  paymentType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  paymentLink: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  externalPaymentId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  fiatAmount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  exchangeRate: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  rateValidSeconds: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  customExpiration: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  expireAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  paymentData: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastCheckedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  paidAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  transactionId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryListRelationFilterSchema).optional(),
  UserOrders: z.union([ z.lazy(() => UserOrderNullableRelationFilterSchema),z.lazy(() => UserOrderWhereInputSchema) ]).optional().nullable(),
  User: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const OrderOrderByWithRelationInputSchema: z.ZodType<Prisma.OrderOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  paymentType: z.lazy(() => SortOrderSchema).optional(),
  paymentLink: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  externalPaymentId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  fiatAmount: z.lazy(() => SortOrderSchema).optional(),
  exchangeRate: z.lazy(() => SortOrderSchema).optional(),
  rateValidSeconds: z.lazy(() => SortOrderSchema).optional(),
  customExpiration: z.lazy(() => SortOrderSchema).optional(),
  expireAt: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  paymentData: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastCheckedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  paidAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  transactionId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryOrderByRelationAggregateInputSchema).optional(),
  UserOrders: z.lazy(() => UserOrderOrderByWithRelationInputSchema).optional(),
  User: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const OrderWhereUniqueInputSchema: z.ZodType<Prisma.OrderWhereUniqueInput> = z.union([
  z.object({
    id: z.string(),
    externalPaymentId: z.string()
  }),
  z.object({
    id: z.string(),
  }),
  z.object({
    externalPaymentId: z.string(),
  }),
])
.and(z.object({
  id: z.string().optional(),
  externalPaymentId: z.string().optional(),
  AND: z.union([ z.lazy(() => OrderWhereInputSchema),z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderWhereInputSchema),z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  paymentType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  paymentLink: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  fiatAmount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  exchangeRate: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  rateValidSeconds: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  customExpiration: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  expireAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  paymentData: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastCheckedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  paidAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  transactionId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryListRelationFilterSchema).optional(),
  UserOrders: z.union([ z.lazy(() => UserOrderNullableRelationFilterSchema),z.lazy(() => UserOrderWhereInputSchema) ]).optional().nullable(),
  User: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const OrderOrderByWithAggregationInputSchema: z.ZodType<Prisma.OrderOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  paymentType: z.lazy(() => SortOrderSchema).optional(),
  paymentLink: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  externalPaymentId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  fiatAmount: z.lazy(() => SortOrderSchema).optional(),
  exchangeRate: z.lazy(() => SortOrderSchema).optional(),
  rateValidSeconds: z.lazy(() => SortOrderSchema).optional(),
  customExpiration: z.lazy(() => SortOrderSchema).optional(),
  expireAt: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  paymentData: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastCheckedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  paidAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  transactionId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => OrderCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => OrderAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => OrderMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => OrderMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => OrderSumOrderByAggregateInputSchema).optional()
}).strict();

export const OrderScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.OrderScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => OrderScalarWhereWithAggregatesInputSchema),z.lazy(() => OrderScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderScalarWhereWithAggregatesInputSchema),z.lazy(() => OrderScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  paymentType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  paymentLink: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  externalPaymentId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  amount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  fiatAmount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  exchangeRate: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  rateValidSeconds: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  customExpiration: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  expireAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  paymentData: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  lastCheckedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  paidAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  transactionId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserOrderWhereInputSchema: z.ZodType<Prisma.UserOrderWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserOrderWhereInputSchema),z.lazy(() => UserOrderWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserOrderWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserOrderWhereInputSchema),z.lazy(() => UserOrderWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  completedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  productId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  User: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  Order: z.union([ z.lazy(() => OrderRelationFilterSchema),z.lazy(() => OrderWhereInputSchema) ]).optional(),
  Product: z.union([ z.lazy(() => ProductRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional(),
}).strict();

export const UserOrderOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  completedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  User: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  Order: z.lazy(() => OrderOrderByWithRelationInputSchema).optional(),
  Product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional()
}).strict();

export const UserOrderWhereUniqueInputSchema: z.ZodType<Prisma.UserOrderWhereUniqueInput> = z.union([
  z.object({
    id: z.string(),
    orderId: z.string()
  }),
  z.object({
    id: z.string(),
  }),
  z.object({
    orderId: z.string(),
  }),
])
.and(z.object({
  id: z.string().optional(),
  orderId: z.string().optional(),
  AND: z.union([ z.lazy(() => UserOrderWhereInputSchema),z.lazy(() => UserOrderWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserOrderWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserOrderWhereInputSchema),z.lazy(() => UserOrderWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  completedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  productId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  User: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  Order: z.union([ z.lazy(() => OrderRelationFilterSchema),z.lazy(() => OrderWhereInputSchema) ]).optional(),
  Product: z.union([ z.lazy(() => ProductRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional(),
}).strict());

export const UserOrderOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  completedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserOrderCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserOrderAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserOrderMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserOrderMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserOrderSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserOrderScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserOrderScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserOrderScalarWhereWithAggregatesInputSchema),z.lazy(() => UserOrderScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserOrderScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserOrderScalarWhereWithAggregatesInputSchema),z.lazy(() => UserOrderScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  completedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  productId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const OrderStatusHistoryWhereInputSchema: z.ZodType<Prisma.OrderStatusHistoryWhereInput> = z.object({
  AND: z.union([ z.lazy(() => OrderStatusHistoryWhereInputSchema),z.lazy(() => OrderStatusHistoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderStatusHistoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderStatusHistoryWhereInputSchema),z.lazy(() => OrderStatusHistoryWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  from: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  to: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  changedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  metadata: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  orderId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  Order: z.union([ z.lazy(() => OrderRelationFilterSchema),z.lazy(() => OrderWhereInputSchema) ]).optional(),
}).strict();

export const OrderStatusHistoryOrderByWithRelationInputSchema: z.ZodType<Prisma.OrderStatusHistoryOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  from: z.lazy(() => SortOrderSchema).optional(),
  to: z.lazy(() => SortOrderSchema).optional(),
  changedAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  Order: z.lazy(() => OrderOrderByWithRelationInputSchema).optional()
}).strict();

export const OrderStatusHistoryWhereUniqueInputSchema: z.ZodType<Prisma.OrderStatusHistoryWhereUniqueInput> = z.object({
  id: z.string()
})
.and(z.object({
  id: z.string().optional(),
  AND: z.union([ z.lazy(() => OrderStatusHistoryWhereInputSchema),z.lazy(() => OrderStatusHistoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderStatusHistoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderStatusHistoryWhereInputSchema),z.lazy(() => OrderStatusHistoryWhereInputSchema).array() ]).optional(),
  from: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  to: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  changedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  metadata: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  orderId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  Order: z.union([ z.lazy(() => OrderRelationFilterSchema),z.lazy(() => OrderWhereInputSchema) ]).optional(),
}).strict());

export const OrderStatusHistoryOrderByWithAggregationInputSchema: z.ZodType<Prisma.OrderStatusHistoryOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  from: z.lazy(() => SortOrderSchema).optional(),
  to: z.lazy(() => SortOrderSchema).optional(),
  changedAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => OrderStatusHistoryCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => OrderStatusHistoryMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => OrderStatusHistoryMinOrderByAggregateInputSchema).optional()
}).strict();

export const OrderStatusHistoryScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.OrderStatusHistoryScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereWithAggregatesInputSchema),z.lazy(() => OrderStatusHistoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderStatusHistoryScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereWithAggregatesInputSchema),z.lazy(() => OrderStatusHistoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  from: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  to: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  changedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  metadata: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  orderId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const ProductWhereInputSchema: z.ZodType<Prisma.ProductWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ProductWhereInputSchema),z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductWhereInputSchema),z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  value: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  discount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  displayOrder: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  metadata: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  UserOrders: z.lazy(() => UserOrderListRelationFilterSchema).optional()
}).strict();

export const ProductOrderByWithRelationInputSchema: z.ZodType<Prisma.ProductOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  discount: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  displayOrder: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  UserOrders: z.lazy(() => UserOrderOrderByRelationAggregateInputSchema).optional()
}).strict();

export const ProductWhereUniqueInputSchema: z.ZodType<Prisma.ProductWhereUniqueInput> = z.object({
  id: z.string()
})
.and(z.object({
  id: z.string().optional(),
  AND: z.union([ z.lazy(() => ProductWhereInputSchema),z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductWhereInputSchema),z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  value: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  discount: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  displayOrder: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  metadata: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  UserOrders: z.lazy(() => UserOrderListRelationFilterSchema).optional()
}).strict());

export const ProductOrderByWithAggregationInputSchema: z.ZodType<Prisma.ProductOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  discount: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  displayOrder: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ProductCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ProductAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ProductMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ProductMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ProductSumOrderByAggregateInputSchema).optional()
}).strict();

export const ProductScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ProductScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ProductScalarWhereWithAggregatesInputSchema),z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductScalarWhereWithAggregatesInputSchema),z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  price: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  value: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  discount: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  displayOrder: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  metadata: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const TelegramMessageSessionWhereInputSchema: z.ZodType<Prisma.TelegramMessageSessionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TelegramMessageSessionWhereInputSchema),z.lazy(() => TelegramMessageSessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TelegramMessageSessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TelegramMessageSessionWhereInputSchema),z.lazy(() => TelegramMessageSessionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  key: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  value: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const TelegramMessageSessionOrderByWithRelationInputSchema: z.ZodType<Prisma.TelegramMessageSessionOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  key: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TelegramMessageSessionWhereUniqueInputSchema: z.ZodType<Prisma.TelegramMessageSessionWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    key: z.string()
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    key: z.string(),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  key: z.string().optional(),
  AND: z.union([ z.lazy(() => TelegramMessageSessionWhereInputSchema),z.lazy(() => TelegramMessageSessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TelegramMessageSessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TelegramMessageSessionWhereInputSchema),z.lazy(() => TelegramMessageSessionWhereInputSchema).array() ]).optional(),
  value: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict());

export const TelegramMessageSessionOrderByWithAggregationInputSchema: z.ZodType<Prisma.TelegramMessageSessionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  key: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TelegramMessageSessionCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => TelegramMessageSessionAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TelegramMessageSessionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TelegramMessageSessionMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => TelegramMessageSessionSumOrderByAggregateInputSchema).optional()
}).strict();

export const TelegramMessageSessionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TelegramMessageSessionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TelegramMessageSessionScalarWhereWithAggregatesInputSchema),z.lazy(() => TelegramMessageSessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TelegramMessageSessionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TelegramMessageSessionScalarWhereWithAggregatesInputSchema),z.lazy(() => TelegramMessageSessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  key: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  value: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const UserAnalysisResultWhereInputSchema: z.ZodType<Prisma.UserAnalysisResultWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserAnalysisResultWhereInputSchema),z.lazy(() => UserAnalysisResultWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserAnalysisResultWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserAnalysisResultWhereInputSchema),z.lazy(() => UserAnalysisResultWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  symbol: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  result: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  cost: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  User: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const UserAnalysisResultOrderByWithRelationInputSchema: z.ZodType<Prisma.UserAnalysisResultOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  symbol: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  result: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  cost: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  User: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const UserAnalysisResultWhereUniqueInputSchema: z.ZodType<Prisma.UserAnalysisResultWhereUniqueInput> = z.object({
  id: z.string()
})
.and(z.object({
  id: z.string().optional(),
  AND: z.union([ z.lazy(() => UserAnalysisResultWhereInputSchema),z.lazy(() => UserAnalysisResultWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserAnalysisResultWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserAnalysisResultWhereInputSchema),z.lazy(() => UserAnalysisResultWhereInputSchema).array() ]).optional(),
  symbol: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  result: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  cost: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  User: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const UserAnalysisResultOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserAnalysisResultOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  symbol: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  result: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  cost: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserAnalysisResultCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserAnalysisResultAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserAnalysisResultMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserAnalysisResultMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserAnalysisResultSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserAnalysisResultScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserAnalysisResultScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserAnalysisResultScalarWhereWithAggregatesInputSchema),z.lazy(() => UserAnalysisResultScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserAnalysisResultScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserAnalysisResultScalarWhereWithAggregatesInputSchema),z.lazy(() => UserAnalysisResultScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  symbol: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  result: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  cost: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedBy: z.lazy(() => UserCreateNestedOneWithoutInvitedUsersInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  invitedByUserId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedBy: z.lazy(() => UserUpdateOneWithoutInvitedUsersNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  invitedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  invitedByUserId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  invitedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserInviteCodeCreateInputSchema: z.ZodType<Prisma.UserInviteCodeCreateInput> = z.object({
  code: z.string(),
  createdAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  isUsed: z.boolean().optional(),
  UsedBy: z.lazy(() => UserCreateNestedOneWithoutUsedInviteCodesInputSchema).optional(),
  User: z.lazy(() => UserCreateNestedOneWithoutInviteCodesInputSchema)
}).strict();

export const UserInviteCodeUncheckedCreateInputSchema: z.ZodType<Prisma.UserInviteCodeUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  code: z.string(),
  createdAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  isUsed: z.boolean().optional(),
  usedByUserId: z.string().optional().nullable(),
  userId: z.string()
}).strict();

export const UserInviteCodeUpdateInputSchema: z.ZodType<Prisma.UserInviteCodeUpdateInput> = z.object({
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isUsed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  UsedBy: z.lazy(() => UserUpdateOneWithoutUsedInviteCodesNestedInputSchema).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutInviteCodesNestedInputSchema).optional()
}).strict();

export const UserInviteCodeUncheckedUpdateInputSchema: z.ZodType<Prisma.UserInviteCodeUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isUsed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  usedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserInviteCodeCreateManyInputSchema: z.ZodType<Prisma.UserInviteCodeCreateManyInput> = z.object({
  id: z.number().int().optional(),
  code: z.string(),
  createdAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  isUsed: z.boolean().optional(),
  usedByUserId: z.string().optional().nullable(),
  userId: z.string()
}).strict();

export const UserInviteCodeUpdateManyMutationInputSchema: z.ZodType<Prisma.UserInviteCodeUpdateManyMutationInput> = z.object({
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isUsed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserInviteCodeUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserInviteCodeUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isUsed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  usedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserAncestorCreateInputSchema: z.ZodType<Prisma.UserAncestorCreateInput> = z.object({
  depth: z.number().int(),
  User: z.lazy(() => UserCreateNestedOneWithoutUserAncestorsInputSchema).optional(),
  Ancestor: z.lazy(() => UserCreateNestedOneWithoutAncestorRelationsInputSchema),
  Descendant: z.lazy(() => UserCreateNestedOneWithoutDescendantRelationsInputSchema)
}).strict();

export const UserAncestorUncheckedCreateInputSchema: z.ZodType<Prisma.UserAncestorUncheckedCreateInput> = z.object({
  ancestorId: z.string(),
  descendantId: z.string(),
  depth: z.number().int(),
  userId: z.string().optional().nullable()
}).strict();

export const UserAncestorUpdateInputSchema: z.ZodType<Prisma.UserAncestorUpdateInput> = z.object({
  depth: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  User: z.lazy(() => UserUpdateOneWithoutUserAncestorsNestedInputSchema).optional(),
  Ancestor: z.lazy(() => UserUpdateOneRequiredWithoutAncestorRelationsNestedInputSchema).optional(),
  Descendant: z.lazy(() => UserUpdateOneRequiredWithoutDescendantRelationsNestedInputSchema).optional()
}).strict();

export const UserAncestorUncheckedUpdateInputSchema: z.ZodType<Prisma.UserAncestorUncheckedUpdateInput> = z.object({
  ancestorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  descendantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  depth: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserAncestorCreateManyInputSchema: z.ZodType<Prisma.UserAncestorCreateManyInput> = z.object({
  ancestorId: z.string(),
  descendantId: z.string(),
  depth: z.number().int(),
  userId: z.string().optional().nullable()
}).strict();

export const UserAncestorUpdateManyMutationInputSchema: z.ZodType<Prisma.UserAncestorUpdateManyMutationInput> = z.object({
  depth: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserAncestorUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserAncestorUncheckedUpdateManyInput> = z.object({
  ancestorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  descendantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  depth: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const OrderCreateInputSchema: z.ZodType<Prisma.OrderCreateInput> = z.object({
  id: z.string().optional(),
  paymentType: z.string(),
  paymentLink: z.string().optional().nullable(),
  externalPaymentId: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  fiatAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  exchangeRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  rateValidSeconds: z.number().int().optional(),
  customExpiration: z.number().int().optional(),
  expireAt: z.coerce.date(),
  status: z.string().optional(),
  paymentData: z.string().optional().nullable(),
  lastCheckedAt: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutOrderInputSchema).optional(),
  UserOrders: z.lazy(() => UserOrderCreateNestedOneWithoutOrderInputSchema).optional(),
  User: z.lazy(() => UserCreateNestedOneWithoutOrderInputSchema)
}).strict();

export const OrderUncheckedCreateInputSchema: z.ZodType<Prisma.OrderUncheckedCreateInput> = z.object({
  id: z.string().optional(),
  userId: z.string(),
  paymentType: z.string(),
  paymentLink: z.string().optional().nullable(),
  externalPaymentId: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  fiatAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  exchangeRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  rateValidSeconds: z.number().int().optional(),
  customExpiration: z.number().int().optional(),
  expireAt: z.coerce.date(),
  status: z.string().optional(),
  paymentData: z.string().optional().nullable(),
  lastCheckedAt: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  UserOrders: z.lazy(() => UserOrderUncheckedCreateNestedOneWithoutOrderInputSchema).optional()
}).strict();

export const OrderUpdateInputSchema: z.ZodType<Prisma.OrderUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  externalPaymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  fiatAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  exchangeRate: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  rateValidSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  customExpiration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  expireAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentData: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastCheckedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryUpdateManyWithoutOrderNestedInputSchema).optional(),
  UserOrders: z.lazy(() => UserOrderUpdateOneWithoutOrderNestedInputSchema).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutOrderNestedInputSchema).optional()
}).strict();

export const OrderUncheckedUpdateInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  externalPaymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  fiatAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  exchangeRate: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  rateValidSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  customExpiration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  expireAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentData: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastCheckedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
  UserOrders: z.lazy(() => UserOrderUncheckedUpdateOneWithoutOrderNestedInputSchema).optional()
}).strict();

export const OrderCreateManyInputSchema: z.ZodType<Prisma.OrderCreateManyInput> = z.object({
  id: z.string().optional(),
  userId: z.string(),
  paymentType: z.string(),
  paymentLink: z.string().optional().nullable(),
  externalPaymentId: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  fiatAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  exchangeRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  rateValidSeconds: z.number().int().optional(),
  customExpiration: z.number().int().optional(),
  expireAt: z.coerce.date(),
  status: z.string().optional(),
  paymentData: z.string().optional().nullable(),
  lastCheckedAt: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const OrderUpdateManyMutationInputSchema: z.ZodType<Prisma.OrderUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  externalPaymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  fiatAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  exchangeRate: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  rateValidSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  customExpiration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  expireAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentData: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastCheckedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const OrderUncheckedUpdateManyInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  externalPaymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  fiatAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  exchangeRate: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  rateValidSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  customExpiration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  expireAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentData: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastCheckedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserOrderCreateInputSchema: z.ZodType<Prisma.UserOrderCreateInput> = z.object({
  id: z.string().optional(),
  quantity: z.number().int().optional(),
  status: z.string().optional(),
  completedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  User: z.lazy(() => UserCreateNestedOneWithoutUserOrderInputSchema),
  Order: z.lazy(() => OrderCreateNestedOneWithoutUserOrdersInputSchema),
  Product: z.lazy(() => ProductCreateNestedOneWithoutUserOrdersInputSchema)
}).strict();

export const UserOrderUncheckedCreateInputSchema: z.ZodType<Prisma.UserOrderUncheckedCreateInput> = z.object({
  id: z.string().optional(),
  userId: z.string(),
  orderId: z.string(),
  quantity: z.number().int().optional(),
  status: z.string().optional(),
  completedAt: z.coerce.date().optional().nullable(),
  productId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserOrderUpdateInputSchema: z.ZodType<Prisma.UserOrderUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  completedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutUserOrderNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUpdateOneRequiredWithoutUserOrdersNestedInputSchema).optional(),
  Product: z.lazy(() => ProductUpdateOneRequiredWithoutUserOrdersNestedInputSchema).optional()
}).strict();

export const UserOrderUncheckedUpdateInputSchema: z.ZodType<Prisma.UserOrderUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  completedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserOrderCreateManyInputSchema: z.ZodType<Prisma.UserOrderCreateManyInput> = z.object({
  id: z.string().optional(),
  userId: z.string(),
  orderId: z.string(),
  quantity: z.number().int().optional(),
  status: z.string().optional(),
  completedAt: z.coerce.date().optional().nullable(),
  productId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserOrderUpdateManyMutationInputSchema: z.ZodType<Prisma.UserOrderUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  completedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserOrderUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserOrderUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  completedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const OrderStatusHistoryCreateInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateInput> = z.object({
  id: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  changedAt: z.coerce.date().optional(),
  metadata: z.string().optional().nullable(),
  Order: z.lazy(() => OrderCreateNestedOneWithoutOrderStatusHistoryInputSchema)
}).strict();

export const OrderStatusHistoryUncheckedCreateInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedCreateInput> = z.object({
  id: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  changedAt: z.coerce.date().optional(),
  metadata: z.string().optional().nullable(),
  orderId: z.string()
}).strict();

export const OrderStatusHistoryUpdateInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  from: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  to: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  Order: z.lazy(() => OrderUpdateOneRequiredWithoutOrderStatusHistoryNestedInputSchema).optional()
}).strict();

export const OrderStatusHistoryUncheckedUpdateInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  from: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  to: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const OrderStatusHistoryCreateManyInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateManyInput> = z.object({
  id: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  changedAt: z.coerce.date().optional(),
  metadata: z.string().optional().nullable(),
  orderId: z.string()
}).strict();

export const OrderStatusHistoryUpdateManyMutationInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  from: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  to: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const OrderStatusHistoryUncheckedUpdateManyInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  from: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  to: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProductCreateInputSchema: z.ZodType<Prisma.ProductCreateInput> = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  type: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  value: z.number().int().optional(),
  discount: z.number().int().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  metadata: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  UserOrders: z.lazy(() => UserOrderCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductUncheckedCreateInputSchema: z.ZodType<Prisma.ProductUncheckedCreateInput> = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  type: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  value: z.number().int().optional(),
  discount: z.number().int().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  metadata: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  UserOrders: z.lazy(() => UserOrderUncheckedCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductUpdateInputSchema: z.ZodType<Prisma.ProductUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  discount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayOrder: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOrders: z.lazy(() => UserOrderUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const ProductUncheckedUpdateInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  discount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayOrder: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOrders: z.lazy(() => UserOrderUncheckedUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const ProductCreateManyInputSchema: z.ZodType<Prisma.ProductCreateManyInput> = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  type: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  value: z.number().int().optional(),
  discount: z.number().int().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  metadata: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const ProductUpdateManyMutationInputSchema: z.ZodType<Prisma.ProductUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  discount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayOrder: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProductUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  discount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayOrder: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TelegramMessageSessionCreateInputSchema: z.ZodType<Prisma.TelegramMessageSessionCreateInput> = z.object({
  key: z.string(),
  value: z.string()
}).strict();

export const TelegramMessageSessionUncheckedCreateInputSchema: z.ZodType<Prisma.TelegramMessageSessionUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  key: z.string(),
  value: z.string()
}).strict();

export const TelegramMessageSessionUpdateInputSchema: z.ZodType<Prisma.TelegramMessageSessionUpdateInput> = z.object({
  key: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TelegramMessageSessionUncheckedUpdateInputSchema: z.ZodType<Prisma.TelegramMessageSessionUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  key: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TelegramMessageSessionCreateManyInputSchema: z.ZodType<Prisma.TelegramMessageSessionCreateManyInput> = z.object({
  id: z.number().int().optional(),
  key: z.string(),
  value: z.string()
}).strict();

export const TelegramMessageSessionUpdateManyMutationInputSchema: z.ZodType<Prisma.TelegramMessageSessionUpdateManyMutationInput> = z.object({
  key: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TelegramMessageSessionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TelegramMessageSessionUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  key: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserAnalysisResultCreateInputSchema: z.ZodType<Prisma.UserAnalysisResultCreateInput> = z.object({
  id: z.string().optional(),
  symbol: z.string(),
  type: z.string(),
  result: z.string(),
  cost: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  User: z.lazy(() => UserCreateNestedOneWithoutUserAnalysisResultInputSchema)
}).strict();

export const UserAnalysisResultUncheckedCreateInputSchema: z.ZodType<Prisma.UserAnalysisResultUncheckedCreateInput> = z.object({
  id: z.string().optional(),
  symbol: z.string(),
  type: z.string(),
  result: z.string(),
  userId: z.string(),
  cost: z.number().int().optional(),
  createdAt: z.coerce.date().optional()
}).strict();

export const UserAnalysisResultUpdateInputSchema: z.ZodType<Prisma.UserAnalysisResultUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  symbol: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cost: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutUserAnalysisResultNestedInputSchema).optional()
}).strict();

export const UserAnalysisResultUncheckedUpdateInputSchema: z.ZodType<Prisma.UserAnalysisResultUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  symbol: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cost: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserAnalysisResultCreateManyInputSchema: z.ZodType<Prisma.UserAnalysisResultCreateManyInput> = z.object({
  id: z.string().optional(),
  symbol: z.string(),
  type: z.string(),
  result: z.string(),
  userId: z.string(),
  cost: z.number().int().optional(),
  createdAt: z.coerce.date().optional()
}).strict();

export const UserAnalysisResultUpdateManyMutationInputSchema: z.ZodType<Prisma.UserAnalysisResultUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  symbol: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cost: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserAnalysisResultUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserAnalysisResultUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  symbol: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cost: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const UserInviteCodeListRelationFilterSchema: z.ZodType<Prisma.UserInviteCodeListRelationFilter> = z.object({
  every: z.lazy(() => UserInviteCodeWhereInputSchema).optional(),
  some: z.lazy(() => UserInviteCodeWhereInputSchema).optional(),
  none: z.lazy(() => UserInviteCodeWhereInputSchema).optional()
}).strict();

export const UserNullableRelationFilterSchema: z.ZodType<Prisma.UserNullableRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => UserWhereInputSchema).optional().nullable()
}).strict();

export const UserListRelationFilterSchema: z.ZodType<Prisma.UserListRelationFilter> = z.object({
  every: z.lazy(() => UserWhereInputSchema).optional(),
  some: z.lazy(() => UserWhereInputSchema).optional(),
  none: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserAncestorListRelationFilterSchema: z.ZodType<Prisma.UserAncestorListRelationFilter> = z.object({
  every: z.lazy(() => UserAncestorWhereInputSchema).optional(),
  some: z.lazy(() => UserAncestorWhereInputSchema).optional(),
  none: z.lazy(() => UserAncestorWhereInputSchema).optional()
}).strict();

export const OrderListRelationFilterSchema: z.ZodType<Prisma.OrderListRelationFilter> = z.object({
  every: z.lazy(() => OrderWhereInputSchema).optional(),
  some: z.lazy(() => OrderWhereInputSchema).optional(),
  none: z.lazy(() => OrderWhereInputSchema).optional()
}).strict();

export const UserOrderListRelationFilterSchema: z.ZodType<Prisma.UserOrderListRelationFilter> = z.object({
  every: z.lazy(() => UserOrderWhereInputSchema).optional(),
  some: z.lazy(() => UserOrderWhereInputSchema).optional(),
  none: z.lazy(() => UserOrderWhereInputSchema).optional()
}).strict();

export const UserAnalysisResultListRelationFilterSchema: z.ZodType<Prisma.UserAnalysisResultListRelationFilter> = z.object({
  every: z.lazy(() => UserAnalysisResultWhereInputSchema).optional(),
  some: z.lazy(() => UserAnalysisResultWhereInputSchema).optional(),
  none: z.lazy(() => UserAnalysisResultWhereInputSchema).optional()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const UserInviteCodeOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserInviteCodeOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAncestorOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserAncestorOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrderOrderByRelationAggregateInputSchema: z.ZodType<Prisma.OrderOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserOrderOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserOrderOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAnalysisResultOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserAnalysisResultOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  telegramId: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  photoUrl: z.lazy(() => SortOrderSchema).optional(),
  coins: z.lazy(() => SortOrderSchema).optional(),
  isVip: z.lazy(() => SortOrderSchema).optional(),
  vipStartAt: z.lazy(() => SortOrderSchema).optional(),
  vipExpireAt: z.lazy(() => SortOrderSchema).optional(),
  vipLevel: z.lazy(() => SortOrderSchema).optional(),
  isTelegramPremium: z.lazy(() => SortOrderSchema).optional(),
  invitedByUserId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserAvgOrderByAggregateInput> = z.object({
  coins: z.lazy(() => SortOrderSchema).optional(),
  vipLevel: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  telegramId: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  photoUrl: z.lazy(() => SortOrderSchema).optional(),
  coins: z.lazy(() => SortOrderSchema).optional(),
  isVip: z.lazy(() => SortOrderSchema).optional(),
  vipStartAt: z.lazy(() => SortOrderSchema).optional(),
  vipExpireAt: z.lazy(() => SortOrderSchema).optional(),
  vipLevel: z.lazy(() => SortOrderSchema).optional(),
  isTelegramPremium: z.lazy(() => SortOrderSchema).optional(),
  invitedByUserId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  telegramId: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  photoUrl: z.lazy(() => SortOrderSchema).optional(),
  coins: z.lazy(() => SortOrderSchema).optional(),
  isVip: z.lazy(() => SortOrderSchema).optional(),
  vipStartAt: z.lazy(() => SortOrderSchema).optional(),
  vipExpireAt: z.lazy(() => SortOrderSchema).optional(),
  vipLevel: z.lazy(() => SortOrderSchema).optional(),
  isTelegramPremium: z.lazy(() => SortOrderSchema).optional(),
  invitedByUserId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserSumOrderByAggregateInput> = z.object({
  coins: z.lazy(() => SortOrderSchema).optional(),
  vipLevel: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const UserRelationFilterSchema: z.ZodType<Prisma.UserRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserInviteCodeCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserInviteCodeCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  isUsed: z.lazy(() => SortOrderSchema).optional(),
  usedByUserId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserInviteCodeAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserInviteCodeAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserInviteCodeMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserInviteCodeMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  isUsed: z.lazy(() => SortOrderSchema).optional(),
  usedByUserId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserInviteCodeMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserInviteCodeMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  isUsed: z.lazy(() => SortOrderSchema).optional(),
  usedByUserId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserInviteCodeSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserInviteCodeSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAncestorAncestorIdDescendantIdCompoundUniqueInputSchema: z.ZodType<Prisma.UserAncestorAncestorIdDescendantIdCompoundUniqueInput> = z.object({
  ancestorId: z.string(),
  descendantId: z.string()
}).strict();

export const UserAncestorCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserAncestorCountOrderByAggregateInput> = z.object({
  ancestorId: z.lazy(() => SortOrderSchema).optional(),
  descendantId: z.lazy(() => SortOrderSchema).optional(),
  depth: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAncestorAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserAncestorAvgOrderByAggregateInput> = z.object({
  depth: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAncestorMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserAncestorMaxOrderByAggregateInput> = z.object({
  ancestorId: z.lazy(() => SortOrderSchema).optional(),
  descendantId: z.lazy(() => SortOrderSchema).optional(),
  depth: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAncestorMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserAncestorMinOrderByAggregateInput> = z.object({
  ancestorId: z.lazy(() => SortOrderSchema).optional(),
  descendantId: z.lazy(() => SortOrderSchema).optional(),
  depth: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAncestorSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserAncestorSumOrderByAggregateInput> = z.object({
  depth: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DecimalFilterSchema: z.ZodType<Prisma.DecimalFilter> = z.object({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalFilterSchema) ]).optional(),
}).strict();

export const OrderStatusHistoryListRelationFilterSchema: z.ZodType<Prisma.OrderStatusHistoryListRelationFilter> = z.object({
  every: z.lazy(() => OrderStatusHistoryWhereInputSchema).optional(),
  some: z.lazy(() => OrderStatusHistoryWhereInputSchema).optional(),
  none: z.lazy(() => OrderStatusHistoryWhereInputSchema).optional()
}).strict();

export const UserOrderNullableRelationFilterSchema: z.ZodType<Prisma.UserOrderNullableRelationFilter> = z.object({
  is: z.lazy(() => UserOrderWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => UserOrderWhereInputSchema).optional().nullable()
}).strict();

export const OrderStatusHistoryOrderByRelationAggregateInputSchema: z.ZodType<Prisma.OrderStatusHistoryOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrderCountOrderByAggregateInputSchema: z.ZodType<Prisma.OrderCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  paymentType: z.lazy(() => SortOrderSchema).optional(),
  paymentLink: z.lazy(() => SortOrderSchema).optional(),
  externalPaymentId: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  fiatAmount: z.lazy(() => SortOrderSchema).optional(),
  exchangeRate: z.lazy(() => SortOrderSchema).optional(),
  rateValidSeconds: z.lazy(() => SortOrderSchema).optional(),
  customExpiration: z.lazy(() => SortOrderSchema).optional(),
  expireAt: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  paymentData: z.lazy(() => SortOrderSchema).optional(),
  lastCheckedAt: z.lazy(() => SortOrderSchema).optional(),
  paidAt: z.lazy(() => SortOrderSchema).optional(),
  transactionId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrderAvgOrderByAggregateInputSchema: z.ZodType<Prisma.OrderAvgOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional(),
  fiatAmount: z.lazy(() => SortOrderSchema).optional(),
  exchangeRate: z.lazy(() => SortOrderSchema).optional(),
  rateValidSeconds: z.lazy(() => SortOrderSchema).optional(),
  customExpiration: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrderMaxOrderByAggregateInputSchema: z.ZodType<Prisma.OrderMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  paymentType: z.lazy(() => SortOrderSchema).optional(),
  paymentLink: z.lazy(() => SortOrderSchema).optional(),
  externalPaymentId: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  fiatAmount: z.lazy(() => SortOrderSchema).optional(),
  exchangeRate: z.lazy(() => SortOrderSchema).optional(),
  rateValidSeconds: z.lazy(() => SortOrderSchema).optional(),
  customExpiration: z.lazy(() => SortOrderSchema).optional(),
  expireAt: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  paymentData: z.lazy(() => SortOrderSchema).optional(),
  lastCheckedAt: z.lazy(() => SortOrderSchema).optional(),
  paidAt: z.lazy(() => SortOrderSchema).optional(),
  transactionId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrderMinOrderByAggregateInputSchema: z.ZodType<Prisma.OrderMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  paymentType: z.lazy(() => SortOrderSchema).optional(),
  paymentLink: z.lazy(() => SortOrderSchema).optional(),
  externalPaymentId: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  fiatAmount: z.lazy(() => SortOrderSchema).optional(),
  exchangeRate: z.lazy(() => SortOrderSchema).optional(),
  rateValidSeconds: z.lazy(() => SortOrderSchema).optional(),
  customExpiration: z.lazy(() => SortOrderSchema).optional(),
  expireAt: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  paymentData: z.lazy(() => SortOrderSchema).optional(),
  lastCheckedAt: z.lazy(() => SortOrderSchema).optional(),
  paidAt: z.lazy(() => SortOrderSchema).optional(),
  transactionId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrderSumOrderByAggregateInputSchema: z.ZodType<Prisma.OrderSumOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional(),
  fiatAmount: z.lazy(() => SortOrderSchema).optional(),
  exchangeRate: z.lazy(() => SortOrderSchema).optional(),
  rateValidSeconds: z.lazy(() => SortOrderSchema).optional(),
  customExpiration: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DecimalWithAggregatesFilterSchema: z.ZodType<Prisma.DecimalWithAggregatesFilter> = z.object({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalFilterSchema).optional()
}).strict();

export const OrderRelationFilterSchema: z.ZodType<Prisma.OrderRelationFilter> = z.object({
  is: z.lazy(() => OrderWhereInputSchema).optional(),
  isNot: z.lazy(() => OrderWhereInputSchema).optional()
}).strict();

export const ProductRelationFilterSchema: z.ZodType<Prisma.ProductRelationFilter> = z.object({
  is: z.lazy(() => ProductWhereInputSchema).optional(),
  isNot: z.lazy(() => ProductWhereInputSchema).optional()
}).strict();

export const UserOrderCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserOrderCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  completedAt: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserOrderAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserOrderAvgOrderByAggregateInput> = z.object({
  quantity: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserOrderMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserOrderMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  completedAt: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserOrderMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserOrderMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  completedAt: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserOrderSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserOrderSumOrderByAggregateInput> = z.object({
  quantity: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrderStatusHistoryCountOrderByAggregateInputSchema: z.ZodType<Prisma.OrderStatusHistoryCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  from: z.lazy(() => SortOrderSchema).optional(),
  to: z.lazy(() => SortOrderSchema).optional(),
  changedAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrderStatusHistoryMaxOrderByAggregateInputSchema: z.ZodType<Prisma.OrderStatusHistoryMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  from: z.lazy(() => SortOrderSchema).optional(),
  to: z.lazy(() => SortOrderSchema).optional(),
  changedAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrderStatusHistoryMinOrderByAggregateInputSchema: z.ZodType<Prisma.OrderStatusHistoryMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  from: z.lazy(() => SortOrderSchema).optional(),
  to: z.lazy(() => SortOrderSchema).optional(),
  changedAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProductCountOrderByAggregateInputSchema: z.ZodType<Prisma.ProductCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  discount: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  displayOrder: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProductAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ProductAvgOrderByAggregateInput> = z.object({
  price: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  discount: z.lazy(() => SortOrderSchema).optional(),
  displayOrder: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProductMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProductMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  discount: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  displayOrder: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProductMinOrderByAggregateInputSchema: z.ZodType<Prisma.ProductMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  discount: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  displayOrder: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProductSumOrderByAggregateInputSchema: z.ZodType<Prisma.ProductSumOrderByAggregateInput> = z.object({
  price: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  discount: z.lazy(() => SortOrderSchema).optional(),
  displayOrder: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TelegramMessageSessionCountOrderByAggregateInputSchema: z.ZodType<Prisma.TelegramMessageSessionCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  key: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TelegramMessageSessionAvgOrderByAggregateInputSchema: z.ZodType<Prisma.TelegramMessageSessionAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TelegramMessageSessionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TelegramMessageSessionMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  key: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TelegramMessageSessionMinOrderByAggregateInputSchema: z.ZodType<Prisma.TelegramMessageSessionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  key: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TelegramMessageSessionSumOrderByAggregateInputSchema: z.ZodType<Prisma.TelegramMessageSessionSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAnalysisResultCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserAnalysisResultCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  symbol: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  result: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  cost: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAnalysisResultAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserAnalysisResultAvgOrderByAggregateInput> = z.object({
  cost: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAnalysisResultMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserAnalysisResultMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  symbol: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  result: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  cost: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAnalysisResultMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserAnalysisResultMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  symbol: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  result: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  cost: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAnalysisResultSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserAnalysisResultSumOrderByAggregateInput> = z.object({
  cost: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserInviteCodeCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserInviteCodeCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserInviteCodeCreateWithoutUserInputSchema),z.lazy(() => UserInviteCodeCreateWithoutUserInputSchema).array(),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInviteCodeCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserInviteCodeCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInviteCodeCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutInvitedUsersInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutInvitedUsersInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutInvitedUsersInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitedUsersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutInvitedUsersInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedManyWithoutInvitedByInputSchema: z.ZodType<Prisma.UserCreateNestedManyWithoutInvitedByInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutInvitedByInputSchema),z.lazy(() => UserCreateWithoutInvitedByInputSchema).array(),z.lazy(() => UserUncheckedCreateWithoutInvitedByInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutInvitedByInputSchema),z.lazy(() => UserCreateOrConnectWithoutInvitedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyInvitedByInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserAncestorCreateNestedManyWithoutAncestorInputSchema: z.ZodType<Prisma.UserAncestorCreateNestedManyWithoutAncestorInput> = z.object({
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutAncestorInputSchema),z.lazy(() => UserAncestorCreateWithoutAncestorInputSchema).array(),z.lazy(() => UserAncestorUncheckedCreateWithoutAncestorInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutAncestorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAncestorCreateOrConnectWithoutAncestorInputSchema),z.lazy(() => UserAncestorCreateOrConnectWithoutAncestorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAncestorCreateManyAncestorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserAncestorCreateNestedManyWithoutDescendantInputSchema: z.ZodType<Prisma.UserAncestorCreateNestedManyWithoutDescendantInput> = z.object({
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutDescendantInputSchema),z.lazy(() => UserAncestorCreateWithoutDescendantInputSchema).array(),z.lazy(() => UserAncestorUncheckedCreateWithoutDescendantInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutDescendantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAncestorCreateOrConnectWithoutDescendantInputSchema),z.lazy(() => UserAncestorCreateOrConnectWithoutDescendantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAncestorCreateManyDescendantInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserAncestorCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserAncestorCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutUserInputSchema),z.lazy(() => UserAncestorCreateWithoutUserInputSchema).array(),z.lazy(() => UserAncestorUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAncestorCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserAncestorCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAncestorCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserInviteCodeCreateNestedManyWithoutUsedByInputSchema: z.ZodType<Prisma.UserInviteCodeCreateNestedManyWithoutUsedByInput> = z.object({
  create: z.union([ z.lazy(() => UserInviteCodeCreateWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeCreateWithoutUsedByInputSchema).array(),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUsedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInviteCodeCreateOrConnectWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeCreateOrConnectWithoutUsedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInviteCodeCreateManyUsedByInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const OrderCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.OrderCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema),z.lazy(() => OrderCreateWithoutUserInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema),z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema),z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserOrderCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserOrderCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserOrderCreateWithoutUserInputSchema),z.lazy(() => UserOrderCreateWithoutUserInputSchema).array(),z.lazy(() => UserOrderUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserOrderCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserOrderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserOrderCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserAnalysisResultCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserAnalysisResultCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserAnalysisResultCreateWithoutUserInputSchema),z.lazy(() => UserAnalysisResultCreateWithoutUserInputSchema).array(),z.lazy(() => UserAnalysisResultUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAnalysisResultCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserAnalysisResultCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAnalysisResultCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserAnalysisResultWhereUniqueInputSchema),z.lazy(() => UserAnalysisResultWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserInviteCodeUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserInviteCodeUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserInviteCodeCreateWithoutUserInputSchema),z.lazy(() => UserInviteCodeCreateWithoutUserInputSchema).array(),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInviteCodeCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserInviteCodeCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInviteCodeCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserUncheckedCreateNestedManyWithoutInvitedByInputSchema: z.ZodType<Prisma.UserUncheckedCreateNestedManyWithoutInvitedByInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutInvitedByInputSchema),z.lazy(() => UserCreateWithoutInvitedByInputSchema).array(),z.lazy(() => UserUncheckedCreateWithoutInvitedByInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutInvitedByInputSchema),z.lazy(() => UserCreateOrConnectWithoutInvitedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyInvitedByInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserAncestorUncheckedCreateNestedManyWithoutAncestorInputSchema: z.ZodType<Prisma.UserAncestorUncheckedCreateNestedManyWithoutAncestorInput> = z.object({
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutAncestorInputSchema),z.lazy(() => UserAncestorCreateWithoutAncestorInputSchema).array(),z.lazy(() => UserAncestorUncheckedCreateWithoutAncestorInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutAncestorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAncestorCreateOrConnectWithoutAncestorInputSchema),z.lazy(() => UserAncestorCreateOrConnectWithoutAncestorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAncestorCreateManyAncestorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserAncestorUncheckedCreateNestedManyWithoutDescendantInputSchema: z.ZodType<Prisma.UserAncestorUncheckedCreateNestedManyWithoutDescendantInput> = z.object({
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutDescendantInputSchema),z.lazy(() => UserAncestorCreateWithoutDescendantInputSchema).array(),z.lazy(() => UserAncestorUncheckedCreateWithoutDescendantInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutDescendantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAncestorCreateOrConnectWithoutDescendantInputSchema),z.lazy(() => UserAncestorCreateOrConnectWithoutDescendantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAncestorCreateManyDescendantInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserAncestorUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserAncestorUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutUserInputSchema),z.lazy(() => UserAncestorCreateWithoutUserInputSchema).array(),z.lazy(() => UserAncestorUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAncestorCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserAncestorCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAncestorCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserInviteCodeUncheckedCreateNestedManyWithoutUsedByInputSchema: z.ZodType<Prisma.UserInviteCodeUncheckedCreateNestedManyWithoutUsedByInput> = z.object({
  create: z.union([ z.lazy(() => UserInviteCodeCreateWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeCreateWithoutUsedByInputSchema).array(),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUsedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInviteCodeCreateOrConnectWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeCreateOrConnectWithoutUsedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInviteCodeCreateManyUsedByInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const OrderUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.OrderUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema),z.lazy(() => OrderCreateWithoutUserInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema),z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema),z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserOrderUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserOrderUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserOrderCreateWithoutUserInputSchema),z.lazy(() => UserOrderCreateWithoutUserInputSchema).array(),z.lazy(() => UserOrderUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserOrderCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserOrderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserOrderCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserAnalysisResultUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserAnalysisResultUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserAnalysisResultCreateWithoutUserInputSchema),z.lazy(() => UserAnalysisResultCreateWithoutUserInputSchema).array(),z.lazy(() => UserAnalysisResultUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAnalysisResultCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserAnalysisResultCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAnalysisResultCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserAnalysisResultWhereUniqueInputSchema),z.lazy(() => UserAnalysisResultWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional().nullable()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const UserInviteCodeUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserInviteCodeUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserInviteCodeCreateWithoutUserInputSchema),z.lazy(() => UserInviteCodeCreateWithoutUserInputSchema).array(),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInviteCodeCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserInviteCodeCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserInviteCodeUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserInviteCodeUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInviteCodeCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserInviteCodeUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserInviteCodeUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserInviteCodeUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserInviteCodeUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserInviteCodeScalarWhereInputSchema),z.lazy(() => UserInviteCodeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserUpdateOneWithoutInvitedUsersNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutInvitedUsersNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutInvitedUsersInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitedUsersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutInvitedUsersInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutInvitedUsersInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutInvitedUsersInputSchema),z.lazy(() => UserUpdateWithoutInvitedUsersInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInvitedUsersInputSchema) ]).optional(),
}).strict();

export const UserUpdateManyWithoutInvitedByNestedInputSchema: z.ZodType<Prisma.UserUpdateManyWithoutInvitedByNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutInvitedByInputSchema),z.lazy(() => UserCreateWithoutInvitedByInputSchema).array(),z.lazy(() => UserUncheckedCreateWithoutInvitedByInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutInvitedByInputSchema),z.lazy(() => UserCreateOrConnectWithoutInvitedByInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserUpsertWithWhereUniqueWithoutInvitedByInputSchema),z.lazy(() => UserUpsertWithWhereUniqueWithoutInvitedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyInvitedByInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserUpdateWithWhereUniqueWithoutInvitedByInputSchema),z.lazy(() => UserUpdateWithWhereUniqueWithoutInvitedByInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserUpdateManyWithWhereWithoutInvitedByInputSchema),z.lazy(() => UserUpdateManyWithWhereWithoutInvitedByInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserScalarWhereInputSchema),z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserAncestorUpdateManyWithoutAncestorNestedInputSchema: z.ZodType<Prisma.UserAncestorUpdateManyWithoutAncestorNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutAncestorInputSchema),z.lazy(() => UserAncestorCreateWithoutAncestorInputSchema).array(),z.lazy(() => UserAncestorUncheckedCreateWithoutAncestorInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutAncestorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAncestorCreateOrConnectWithoutAncestorInputSchema),z.lazy(() => UserAncestorCreateOrConnectWithoutAncestorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserAncestorUpsertWithWhereUniqueWithoutAncestorInputSchema),z.lazy(() => UserAncestorUpsertWithWhereUniqueWithoutAncestorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAncestorCreateManyAncestorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserAncestorUpdateWithWhereUniqueWithoutAncestorInputSchema),z.lazy(() => UserAncestorUpdateWithWhereUniqueWithoutAncestorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserAncestorUpdateManyWithWhereWithoutAncestorInputSchema),z.lazy(() => UserAncestorUpdateManyWithWhereWithoutAncestorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserAncestorScalarWhereInputSchema),z.lazy(() => UserAncestorScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserAncestorUpdateManyWithoutDescendantNestedInputSchema: z.ZodType<Prisma.UserAncestorUpdateManyWithoutDescendantNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutDescendantInputSchema),z.lazy(() => UserAncestorCreateWithoutDescendantInputSchema).array(),z.lazy(() => UserAncestorUncheckedCreateWithoutDescendantInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutDescendantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAncestorCreateOrConnectWithoutDescendantInputSchema),z.lazy(() => UserAncestorCreateOrConnectWithoutDescendantInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserAncestorUpsertWithWhereUniqueWithoutDescendantInputSchema),z.lazy(() => UserAncestorUpsertWithWhereUniqueWithoutDescendantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAncestorCreateManyDescendantInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserAncestorUpdateWithWhereUniqueWithoutDescendantInputSchema),z.lazy(() => UserAncestorUpdateWithWhereUniqueWithoutDescendantInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserAncestorUpdateManyWithWhereWithoutDescendantInputSchema),z.lazy(() => UserAncestorUpdateManyWithWhereWithoutDescendantInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserAncestorScalarWhereInputSchema),z.lazy(() => UserAncestorScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserAncestorUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserAncestorUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutUserInputSchema),z.lazy(() => UserAncestorCreateWithoutUserInputSchema).array(),z.lazy(() => UserAncestorUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAncestorCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserAncestorCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserAncestorUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserAncestorUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAncestorCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserAncestorUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserAncestorUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserAncestorUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserAncestorUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserAncestorScalarWhereInputSchema),z.lazy(() => UserAncestorScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserInviteCodeUpdateManyWithoutUsedByNestedInputSchema: z.ZodType<Prisma.UserInviteCodeUpdateManyWithoutUsedByNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserInviteCodeCreateWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeCreateWithoutUsedByInputSchema).array(),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUsedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInviteCodeCreateOrConnectWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeCreateOrConnectWithoutUsedByInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserInviteCodeUpsertWithWhereUniqueWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUpsertWithWhereUniqueWithoutUsedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInviteCodeCreateManyUsedByInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserInviteCodeUpdateWithWhereUniqueWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUpdateWithWhereUniqueWithoutUsedByInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserInviteCodeUpdateManyWithWhereWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUpdateManyWithWhereWithoutUsedByInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserInviteCodeScalarWhereInputSchema),z.lazy(() => UserInviteCodeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const OrderUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.OrderUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema),z.lazy(() => OrderCreateWithoutUserInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema),z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema),z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => OrderUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => OrderUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => OrderUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderScalarWhereInputSchema),z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserOrderUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserOrderUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserOrderCreateWithoutUserInputSchema),z.lazy(() => UserOrderCreateWithoutUserInputSchema).array(),z.lazy(() => UserOrderUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserOrderCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserOrderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserOrderUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserOrderUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserOrderCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserOrderUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserOrderUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserOrderUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserOrderUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserOrderScalarWhereInputSchema),z.lazy(() => UserOrderScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserAnalysisResultUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserAnalysisResultUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserAnalysisResultCreateWithoutUserInputSchema),z.lazy(() => UserAnalysisResultCreateWithoutUserInputSchema).array(),z.lazy(() => UserAnalysisResultUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAnalysisResultCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserAnalysisResultCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserAnalysisResultUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAnalysisResultCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserAnalysisResultWhereUniqueInputSchema),z.lazy(() => UserAnalysisResultWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserAnalysisResultWhereUniqueInputSchema),z.lazy(() => UserAnalysisResultWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserAnalysisResultWhereUniqueInputSchema),z.lazy(() => UserAnalysisResultWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserAnalysisResultWhereUniqueInputSchema),z.lazy(() => UserAnalysisResultWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserAnalysisResultUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserAnalysisResultUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserAnalysisResultScalarWhereInputSchema),z.lazy(() => UserAnalysisResultScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserInviteCodeUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserInviteCodeUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserInviteCodeCreateWithoutUserInputSchema),z.lazy(() => UserInviteCodeCreateWithoutUserInputSchema).array(),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInviteCodeCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserInviteCodeCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserInviteCodeUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserInviteCodeUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInviteCodeCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserInviteCodeUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserInviteCodeUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserInviteCodeUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserInviteCodeUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserInviteCodeScalarWhereInputSchema),z.lazy(() => UserInviteCodeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserUncheckedUpdateManyWithoutInvitedByNestedInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyWithoutInvitedByNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutInvitedByInputSchema),z.lazy(() => UserCreateWithoutInvitedByInputSchema).array(),z.lazy(() => UserUncheckedCreateWithoutInvitedByInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutInvitedByInputSchema),z.lazy(() => UserCreateOrConnectWithoutInvitedByInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserUpsertWithWhereUniqueWithoutInvitedByInputSchema),z.lazy(() => UserUpsertWithWhereUniqueWithoutInvitedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyInvitedByInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserUpdateWithWhereUniqueWithoutInvitedByInputSchema),z.lazy(() => UserUpdateWithWhereUniqueWithoutInvitedByInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserUpdateManyWithWhereWithoutInvitedByInputSchema),z.lazy(() => UserUpdateManyWithWhereWithoutInvitedByInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserScalarWhereInputSchema),z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserAncestorUncheckedUpdateManyWithoutAncestorNestedInputSchema: z.ZodType<Prisma.UserAncestorUncheckedUpdateManyWithoutAncestorNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutAncestorInputSchema),z.lazy(() => UserAncestorCreateWithoutAncestorInputSchema).array(),z.lazy(() => UserAncestorUncheckedCreateWithoutAncestorInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutAncestorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAncestorCreateOrConnectWithoutAncestorInputSchema),z.lazy(() => UserAncestorCreateOrConnectWithoutAncestorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserAncestorUpsertWithWhereUniqueWithoutAncestorInputSchema),z.lazy(() => UserAncestorUpsertWithWhereUniqueWithoutAncestorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAncestorCreateManyAncestorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserAncestorUpdateWithWhereUniqueWithoutAncestorInputSchema),z.lazy(() => UserAncestorUpdateWithWhereUniqueWithoutAncestorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserAncestorUpdateManyWithWhereWithoutAncestorInputSchema),z.lazy(() => UserAncestorUpdateManyWithWhereWithoutAncestorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserAncestorScalarWhereInputSchema),z.lazy(() => UserAncestorScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserAncestorUncheckedUpdateManyWithoutDescendantNestedInputSchema: z.ZodType<Prisma.UserAncestorUncheckedUpdateManyWithoutDescendantNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutDescendantInputSchema),z.lazy(() => UserAncestorCreateWithoutDescendantInputSchema).array(),z.lazy(() => UserAncestorUncheckedCreateWithoutDescendantInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutDescendantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAncestorCreateOrConnectWithoutDescendantInputSchema),z.lazy(() => UserAncestorCreateOrConnectWithoutDescendantInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserAncestorUpsertWithWhereUniqueWithoutDescendantInputSchema),z.lazy(() => UserAncestorUpsertWithWhereUniqueWithoutDescendantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAncestorCreateManyDescendantInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserAncestorUpdateWithWhereUniqueWithoutDescendantInputSchema),z.lazy(() => UserAncestorUpdateWithWhereUniqueWithoutDescendantInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserAncestorUpdateManyWithWhereWithoutDescendantInputSchema),z.lazy(() => UserAncestorUpdateManyWithWhereWithoutDescendantInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserAncestorScalarWhereInputSchema),z.lazy(() => UserAncestorScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserAncestorUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserAncestorUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutUserInputSchema),z.lazy(() => UserAncestorCreateWithoutUserInputSchema).array(),z.lazy(() => UserAncestorUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAncestorCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserAncestorCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserAncestorUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserAncestorUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAncestorCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserAncestorWhereUniqueInputSchema),z.lazy(() => UserAncestorWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserAncestorUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserAncestorUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserAncestorUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserAncestorUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserAncestorScalarWhereInputSchema),z.lazy(() => UserAncestorScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserInviteCodeUncheckedUpdateManyWithoutUsedByNestedInputSchema: z.ZodType<Prisma.UserInviteCodeUncheckedUpdateManyWithoutUsedByNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserInviteCodeCreateWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeCreateWithoutUsedByInputSchema).array(),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUsedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserInviteCodeCreateOrConnectWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeCreateOrConnectWithoutUsedByInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserInviteCodeUpsertWithWhereUniqueWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUpsertWithWhereUniqueWithoutUsedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserInviteCodeCreateManyUsedByInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserInviteCodeWhereUniqueInputSchema),z.lazy(() => UserInviteCodeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserInviteCodeUpdateWithWhereUniqueWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUpdateWithWhereUniqueWithoutUsedByInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserInviteCodeUpdateManyWithWhereWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUpdateManyWithWhereWithoutUsedByInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserInviteCodeScalarWhereInputSchema),z.lazy(() => UserInviteCodeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const OrderUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema),z.lazy(() => OrderCreateWithoutUserInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema),z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema),z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => OrderUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => OrderUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => OrderUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderScalarWhereInputSchema),z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserOrderUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserOrderUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserOrderCreateWithoutUserInputSchema),z.lazy(() => UserOrderCreateWithoutUserInputSchema).array(),z.lazy(() => UserOrderUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserOrderCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserOrderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserOrderUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserOrderUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserOrderCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserOrderUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserOrderUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserOrderUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserOrderUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserOrderScalarWhereInputSchema),z.lazy(() => UserOrderScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserAnalysisResultUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserAnalysisResultUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserAnalysisResultCreateWithoutUserInputSchema),z.lazy(() => UserAnalysisResultCreateWithoutUserInputSchema).array(),z.lazy(() => UserAnalysisResultUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserAnalysisResultCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserAnalysisResultCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserAnalysisResultUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserAnalysisResultCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserAnalysisResultWhereUniqueInputSchema),z.lazy(() => UserAnalysisResultWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserAnalysisResultWhereUniqueInputSchema),z.lazy(() => UserAnalysisResultWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserAnalysisResultWhereUniqueInputSchema),z.lazy(() => UserAnalysisResultWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserAnalysisResultWhereUniqueInputSchema),z.lazy(() => UserAnalysisResultWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserAnalysisResultUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserAnalysisResultUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserAnalysisResultScalarWhereInputSchema),z.lazy(() => UserAnalysisResultScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutUsedInviteCodesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUsedInviteCodesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUsedInviteCodesInputSchema),z.lazy(() => UserUncheckedCreateWithoutUsedInviteCodesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUsedInviteCodesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutInviteCodesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutInviteCodesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutInviteCodesInputSchema),z.lazy(() => UserUncheckedCreateWithoutInviteCodesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutInviteCodesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneWithoutUsedInviteCodesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutUsedInviteCodesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUsedInviteCodesInputSchema),z.lazy(() => UserUncheckedCreateWithoutUsedInviteCodesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUsedInviteCodesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUsedInviteCodesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUsedInviteCodesInputSchema),z.lazy(() => UserUpdateWithoutUsedInviteCodesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUsedInviteCodesInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutInviteCodesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutInviteCodesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutInviteCodesInputSchema),z.lazy(() => UserUncheckedCreateWithoutInviteCodesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutInviteCodesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutInviteCodesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutInviteCodesInputSchema),z.lazy(() => UserUpdateWithoutInviteCodesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInviteCodesInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutUserAncestorsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserAncestorsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserAncestorsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserAncestorsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserAncestorsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutAncestorRelationsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutAncestorRelationsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAncestorRelationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAncestorRelationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAncestorRelationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutDescendantRelationsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDescendantRelationsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDescendantRelationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDescendantRelationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDescendantRelationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneWithoutUserAncestorsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutUserAncestorsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserAncestorsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserAncestorsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserAncestorsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUserAncestorsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUserAncestorsInputSchema),z.lazy(() => UserUpdateWithoutUserAncestorsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserAncestorsInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutAncestorRelationsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutAncestorRelationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAncestorRelationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAncestorRelationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAncestorRelationsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutAncestorRelationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutAncestorRelationsInputSchema),z.lazy(() => UserUpdateWithoutAncestorRelationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAncestorRelationsInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutDescendantRelationsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutDescendantRelationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDescendantRelationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDescendantRelationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDescendantRelationsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutDescendantRelationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutDescendantRelationsInputSchema),z.lazy(() => UserUpdateWithoutDescendantRelationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDescendantRelationsInputSchema) ]).optional(),
}).strict();

export const OrderStatusHistoryCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateNestedManyWithoutOrderInput> = z.object({
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema).array(),z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderStatusHistoryCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserOrderCreateNestedOneWithoutOrderInputSchema: z.ZodType<Prisma.UserOrderCreateNestedOneWithoutOrderInput> = z.object({
  create: z.union([ z.lazy(() => UserOrderCreateWithoutOrderInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutOrderInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserOrderCreateOrConnectWithoutOrderInputSchema).optional(),
  connect: z.lazy(() => UserOrderWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutOrderInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutOrderInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutOrderInputSchema),z.lazy(() => UserUncheckedCreateWithoutOrderInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutOrderInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderInput> = z.object({
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema).array(),z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderStatusHistoryCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserOrderUncheckedCreateNestedOneWithoutOrderInputSchema: z.ZodType<Prisma.UserOrderUncheckedCreateNestedOneWithoutOrderInput> = z.object({
  create: z.union([ z.lazy(() => UserOrderCreateWithoutOrderInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutOrderInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserOrderCreateOrConnectWithoutOrderInputSchema).optional(),
  connect: z.lazy(() => UserOrderWhereUniqueInputSchema).optional()
}).strict();

export const DecimalFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DecimalFieldUpdateOperationsInput> = z.object({
  set: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  increment: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  decrement: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  multiply: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  divide: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional()
}).strict();

export const OrderStatusHistoryUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateManyWithoutOrderNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema).array(),z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderStatusHistoryCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderStatusHistoryUpdateManyWithWhereWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereInputSchema),z.lazy(() => OrderStatusHistoryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserOrderUpdateOneWithoutOrderNestedInputSchema: z.ZodType<Prisma.UserOrderUpdateOneWithoutOrderNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserOrderCreateWithoutOrderInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutOrderInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserOrderCreateOrConnectWithoutOrderInputSchema).optional(),
  upsert: z.lazy(() => UserOrderUpsertWithoutOrderInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserOrderWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserOrderWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserOrderWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserOrderUpdateToOneWithWhereWithoutOrderInputSchema),z.lazy(() => UserOrderUpdateWithoutOrderInputSchema),z.lazy(() => UserOrderUncheckedUpdateWithoutOrderInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutOrderNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutOrderNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutOrderInputSchema),z.lazy(() => UserUncheckedCreateWithoutOrderInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutOrderInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutOrderInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutOrderInputSchema),z.lazy(() => UserUpdateWithoutOrderInputSchema),z.lazy(() => UserUncheckedUpdateWithoutOrderInputSchema) ]).optional(),
}).strict();

export const OrderStatusHistoryUncheckedUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedUpdateManyWithoutOrderNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema).array(),z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderStatusHistoryCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderStatusHistoryUpdateManyWithWhereWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereInputSchema),z.lazy(() => OrderStatusHistoryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserOrderUncheckedUpdateOneWithoutOrderNestedInputSchema: z.ZodType<Prisma.UserOrderUncheckedUpdateOneWithoutOrderNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserOrderCreateWithoutOrderInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutOrderInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserOrderCreateOrConnectWithoutOrderInputSchema).optional(),
  upsert: z.lazy(() => UserOrderUpsertWithoutOrderInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserOrderWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserOrderWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserOrderWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserOrderUpdateToOneWithWhereWithoutOrderInputSchema),z.lazy(() => UserOrderUpdateWithoutOrderInputSchema),z.lazy(() => UserOrderUncheckedUpdateWithoutOrderInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutUserOrderInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserOrderInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserOrderInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserOrderInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserOrderInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const OrderCreateNestedOneWithoutUserOrdersInputSchema: z.ZodType<Prisma.OrderCreateNestedOneWithoutUserOrdersInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutUserOrdersInputSchema),z.lazy(() => OrderUncheckedCreateWithoutUserOrdersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutUserOrdersInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional()
}).strict();

export const ProductCreateNestedOneWithoutUserOrdersInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutUserOrdersInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutUserOrdersInputSchema),z.lazy(() => ProductUncheckedCreateWithoutUserOrdersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutUserOrdersInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutUserOrderNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutUserOrderNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserOrderInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserOrderInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserOrderInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUserOrderInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUserOrderInputSchema),z.lazy(() => UserUpdateWithoutUserOrderInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserOrderInputSchema) ]).optional(),
}).strict();

export const OrderUpdateOneRequiredWithoutUserOrdersNestedInputSchema: z.ZodType<Prisma.OrderUpdateOneRequiredWithoutUserOrdersNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutUserOrdersInputSchema),z.lazy(() => OrderUncheckedCreateWithoutUserOrdersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutUserOrdersInputSchema).optional(),
  upsert: z.lazy(() => OrderUpsertWithoutUserOrdersInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrderUpdateToOneWithWhereWithoutUserOrdersInputSchema),z.lazy(() => OrderUpdateWithoutUserOrdersInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutUserOrdersInputSchema) ]).optional(),
}).strict();

export const ProductUpdateOneRequiredWithoutUserOrdersNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneRequiredWithoutUserOrdersNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutUserOrdersInputSchema),z.lazy(() => ProductUncheckedCreateWithoutUserOrdersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutUserOrdersInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutUserOrdersInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutUserOrdersInputSchema),z.lazy(() => ProductUpdateWithoutUserOrdersInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutUserOrdersInputSchema) ]).optional(),
}).strict();

export const OrderCreateNestedOneWithoutOrderStatusHistoryInputSchema: z.ZodType<Prisma.OrderCreateNestedOneWithoutOrderStatusHistoryInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutOrderStatusHistoryInputSchema),z.lazy(() => OrderUncheckedCreateWithoutOrderStatusHistoryInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutOrderStatusHistoryInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional()
}).strict();

export const OrderUpdateOneRequiredWithoutOrderStatusHistoryNestedInputSchema: z.ZodType<Prisma.OrderUpdateOneRequiredWithoutOrderStatusHistoryNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutOrderStatusHistoryInputSchema),z.lazy(() => OrderUncheckedCreateWithoutOrderStatusHistoryInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutOrderStatusHistoryInputSchema).optional(),
  upsert: z.lazy(() => OrderUpsertWithoutOrderStatusHistoryInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrderUpdateToOneWithWhereWithoutOrderStatusHistoryInputSchema),z.lazy(() => OrderUpdateWithoutOrderStatusHistoryInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutOrderStatusHistoryInputSchema) ]).optional(),
}).strict();

export const UserOrderCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.UserOrderCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => UserOrderCreateWithoutProductInputSchema),z.lazy(() => UserOrderCreateWithoutProductInputSchema).array(),z.lazy(() => UserOrderUncheckedCreateWithoutProductInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserOrderCreateOrConnectWithoutProductInputSchema),z.lazy(() => UserOrderCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserOrderCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserOrderUncheckedCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.UserOrderUncheckedCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => UserOrderCreateWithoutProductInputSchema),z.lazy(() => UserOrderCreateWithoutProductInputSchema).array(),z.lazy(() => UserOrderUncheckedCreateWithoutProductInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserOrderCreateOrConnectWithoutProductInputSchema),z.lazy(() => UserOrderCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserOrderCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserOrderUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.UserOrderUpdateManyWithoutProductNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserOrderCreateWithoutProductInputSchema),z.lazy(() => UserOrderCreateWithoutProductInputSchema).array(),z.lazy(() => UserOrderUncheckedCreateWithoutProductInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserOrderCreateOrConnectWithoutProductInputSchema),z.lazy(() => UserOrderCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserOrderUpsertWithWhereUniqueWithoutProductInputSchema),z.lazy(() => UserOrderUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserOrderCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserOrderUpdateWithWhereUniqueWithoutProductInputSchema),z.lazy(() => UserOrderUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserOrderUpdateManyWithWhereWithoutProductInputSchema),z.lazy(() => UserOrderUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserOrderScalarWhereInputSchema),z.lazy(() => UserOrderScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserOrderUncheckedUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.UserOrderUncheckedUpdateManyWithoutProductNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserOrderCreateWithoutProductInputSchema),z.lazy(() => UserOrderCreateWithoutProductInputSchema).array(),z.lazy(() => UserOrderUncheckedCreateWithoutProductInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserOrderCreateOrConnectWithoutProductInputSchema),z.lazy(() => UserOrderCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserOrderUpsertWithWhereUniqueWithoutProductInputSchema),z.lazy(() => UserOrderUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserOrderCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserOrderWhereUniqueInputSchema),z.lazy(() => UserOrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserOrderUpdateWithWhereUniqueWithoutProductInputSchema),z.lazy(() => UserOrderUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserOrderUpdateManyWithWhereWithoutProductInputSchema),z.lazy(() => UserOrderUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserOrderScalarWhereInputSchema),z.lazy(() => UserOrderScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutUserAnalysisResultInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserAnalysisResultInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserAnalysisResultInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserAnalysisResultInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserAnalysisResultInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutUserAnalysisResultNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutUserAnalysisResultNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserAnalysisResultInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserAnalysisResultInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserAnalysisResultInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUserAnalysisResultInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUserAnalysisResultInputSchema),z.lazy(() => UserUpdateWithoutUserAnalysisResultInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserAnalysisResultInputSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedDecimalFilterSchema: z.ZodType<Prisma.NestedDecimalFilter> = z.object({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalFilterSchema) ]).optional(),
}).strict();

export const NestedDecimalWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDecimalWithAggregatesFilter> = z.object({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalFilterSchema).optional()
}).strict();

export const UserInviteCodeCreateWithoutUserInputSchema: z.ZodType<Prisma.UserInviteCodeCreateWithoutUserInput> = z.object({
  code: z.string(),
  createdAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  isUsed: z.boolean().optional(),
  UsedBy: z.lazy(() => UserCreateNestedOneWithoutUsedInviteCodesInputSchema).optional()
}).strict();

export const UserInviteCodeUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserInviteCodeUncheckedCreateWithoutUserInput> = z.object({
  id: z.number().int().optional(),
  code: z.string(),
  createdAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  isUsed: z.boolean().optional(),
  usedByUserId: z.string().optional().nullable()
}).strict();

export const UserInviteCodeCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserInviteCodeCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserInviteCodeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserInviteCodeCreateWithoutUserInputSchema),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserInviteCodeCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserInviteCodeCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserInviteCodeCreateManyUserInputSchema),z.lazy(() => UserInviteCodeCreateManyUserInputSchema).array() ]),
}).strict();

export const UserCreateWithoutInvitedUsersInputSchema: z.ZodType<Prisma.UserCreateWithoutInvitedUsersInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedBy: z.lazy(() => UserCreateNestedOneWithoutInvitedUsersInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutInvitedUsersInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutInvitedUsersInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  invitedByUserId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutInvitedUsersInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutInvitedUsersInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutInvitedUsersInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitedUsersInputSchema) ]),
}).strict();

export const UserCreateWithoutInvitedByInputSchema: z.ZodType<Prisma.UserCreateWithoutInvitedByInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutInvitedByInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutInvitedByInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutInvitedByInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutInvitedByInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutInvitedByInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitedByInputSchema) ]),
}).strict();

export const UserCreateManyInvitedByInputEnvelopeSchema: z.ZodType<Prisma.UserCreateManyInvitedByInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserCreateManyInvitedByInputSchema),z.lazy(() => UserCreateManyInvitedByInputSchema).array() ]),
}).strict();

export const UserAncestorCreateWithoutAncestorInputSchema: z.ZodType<Prisma.UserAncestorCreateWithoutAncestorInput> = z.object({
  depth: z.number().int(),
  User: z.lazy(() => UserCreateNestedOneWithoutUserAncestorsInputSchema).optional(),
  Descendant: z.lazy(() => UserCreateNestedOneWithoutDescendantRelationsInputSchema)
}).strict();

export const UserAncestorUncheckedCreateWithoutAncestorInputSchema: z.ZodType<Prisma.UserAncestorUncheckedCreateWithoutAncestorInput> = z.object({
  descendantId: z.string(),
  depth: z.number().int(),
  userId: z.string().optional().nullable()
}).strict();

export const UserAncestorCreateOrConnectWithoutAncestorInputSchema: z.ZodType<Prisma.UserAncestorCreateOrConnectWithoutAncestorInput> = z.object({
  where: z.lazy(() => UserAncestorWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutAncestorInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutAncestorInputSchema) ]),
}).strict();

export const UserAncestorCreateManyAncestorInputEnvelopeSchema: z.ZodType<Prisma.UserAncestorCreateManyAncestorInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserAncestorCreateManyAncestorInputSchema),z.lazy(() => UserAncestorCreateManyAncestorInputSchema).array() ]),
}).strict();

export const UserAncestorCreateWithoutDescendantInputSchema: z.ZodType<Prisma.UserAncestorCreateWithoutDescendantInput> = z.object({
  depth: z.number().int(),
  User: z.lazy(() => UserCreateNestedOneWithoutUserAncestorsInputSchema).optional(),
  Ancestor: z.lazy(() => UserCreateNestedOneWithoutAncestorRelationsInputSchema)
}).strict();

export const UserAncestorUncheckedCreateWithoutDescendantInputSchema: z.ZodType<Prisma.UserAncestorUncheckedCreateWithoutDescendantInput> = z.object({
  ancestorId: z.string(),
  depth: z.number().int(),
  userId: z.string().optional().nullable()
}).strict();

export const UserAncestorCreateOrConnectWithoutDescendantInputSchema: z.ZodType<Prisma.UserAncestorCreateOrConnectWithoutDescendantInput> = z.object({
  where: z.lazy(() => UserAncestorWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutDescendantInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutDescendantInputSchema) ]),
}).strict();

export const UserAncestorCreateManyDescendantInputEnvelopeSchema: z.ZodType<Prisma.UserAncestorCreateManyDescendantInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserAncestorCreateManyDescendantInputSchema),z.lazy(() => UserAncestorCreateManyDescendantInputSchema).array() ]),
}).strict();

export const UserAncestorCreateWithoutUserInputSchema: z.ZodType<Prisma.UserAncestorCreateWithoutUserInput> = z.object({
  depth: z.number().int(),
  Ancestor: z.lazy(() => UserCreateNestedOneWithoutAncestorRelationsInputSchema),
  Descendant: z.lazy(() => UserCreateNestedOneWithoutDescendantRelationsInputSchema)
}).strict();

export const UserAncestorUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserAncestorUncheckedCreateWithoutUserInput> = z.object({
  ancestorId: z.string(),
  descendantId: z.string(),
  depth: z.number().int()
}).strict();

export const UserAncestorCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserAncestorCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserAncestorWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutUserInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserAncestorCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserAncestorCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserAncestorCreateManyUserInputSchema),z.lazy(() => UserAncestorCreateManyUserInputSchema).array() ]),
}).strict();

export const UserInviteCodeCreateWithoutUsedByInputSchema: z.ZodType<Prisma.UserInviteCodeCreateWithoutUsedByInput> = z.object({
  code: z.string(),
  createdAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  isUsed: z.boolean().optional(),
  User: z.lazy(() => UserCreateNestedOneWithoutInviteCodesInputSchema)
}).strict();

export const UserInviteCodeUncheckedCreateWithoutUsedByInputSchema: z.ZodType<Prisma.UserInviteCodeUncheckedCreateWithoutUsedByInput> = z.object({
  id: z.number().int().optional(),
  code: z.string(),
  createdAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  isUsed: z.boolean().optional(),
  userId: z.string()
}).strict();

export const UserInviteCodeCreateOrConnectWithoutUsedByInputSchema: z.ZodType<Prisma.UserInviteCodeCreateOrConnectWithoutUsedByInput> = z.object({
  where: z.lazy(() => UserInviteCodeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserInviteCodeCreateWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUsedByInputSchema) ]),
}).strict();

export const UserInviteCodeCreateManyUsedByInputEnvelopeSchema: z.ZodType<Prisma.UserInviteCodeCreateManyUsedByInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserInviteCodeCreateManyUsedByInputSchema),z.lazy(() => UserInviteCodeCreateManyUsedByInputSchema).array() ]),
}).strict();

export const OrderCreateWithoutUserInputSchema: z.ZodType<Prisma.OrderCreateWithoutUserInput> = z.object({
  id: z.string().optional(),
  paymentType: z.string(),
  paymentLink: z.string().optional().nullable(),
  externalPaymentId: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  fiatAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  exchangeRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  rateValidSeconds: z.number().int().optional(),
  customExpiration: z.number().int().optional(),
  expireAt: z.coerce.date(),
  status: z.string().optional(),
  paymentData: z.string().optional().nullable(),
  lastCheckedAt: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutOrderInputSchema).optional(),
  UserOrders: z.lazy(() => UserOrderCreateNestedOneWithoutOrderInputSchema).optional()
}).strict();

export const OrderUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().optional(),
  paymentType: z.string(),
  paymentLink: z.string().optional().nullable(),
  externalPaymentId: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  fiatAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  exchangeRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  rateValidSeconds: z.number().int().optional(),
  customExpiration: z.number().int().optional(),
  expireAt: z.coerce.date(),
  status: z.string().optional(),
  paymentData: z.string().optional().nullable(),
  lastCheckedAt: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  UserOrders: z.lazy(() => UserOrderUncheckedCreateNestedOneWithoutOrderInputSchema).optional()
}).strict();

export const OrderCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema),z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const OrderCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.OrderCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => OrderCreateManyUserInputSchema),z.lazy(() => OrderCreateManyUserInputSchema).array() ]),
}).strict();

export const UserOrderCreateWithoutUserInputSchema: z.ZodType<Prisma.UserOrderCreateWithoutUserInput> = z.object({
  id: z.string().optional(),
  quantity: z.number().int().optional(),
  status: z.string().optional(),
  completedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  Order: z.lazy(() => OrderCreateNestedOneWithoutUserOrdersInputSchema),
  Product: z.lazy(() => ProductCreateNestedOneWithoutUserOrdersInputSchema)
}).strict();

export const UserOrderUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserOrderUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().optional(),
  orderId: z.string(),
  quantity: z.number().int().optional(),
  status: z.string().optional(),
  completedAt: z.coerce.date().optional().nullable(),
  productId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserOrderCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserOrderCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserOrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserOrderCreateWithoutUserInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserOrderCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserOrderCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserOrderCreateManyUserInputSchema),z.lazy(() => UserOrderCreateManyUserInputSchema).array() ]),
}).strict();

export const UserAnalysisResultCreateWithoutUserInputSchema: z.ZodType<Prisma.UserAnalysisResultCreateWithoutUserInput> = z.object({
  id: z.string().optional(),
  symbol: z.string(),
  type: z.string(),
  result: z.string(),
  cost: z.number().int().optional(),
  createdAt: z.coerce.date().optional()
}).strict();

export const UserAnalysisResultUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserAnalysisResultUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().optional(),
  symbol: z.string(),
  type: z.string(),
  result: z.string(),
  cost: z.number().int().optional(),
  createdAt: z.coerce.date().optional()
}).strict();

export const UserAnalysisResultCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserAnalysisResultCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserAnalysisResultWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserAnalysisResultCreateWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserAnalysisResultCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserAnalysisResultCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserAnalysisResultCreateManyUserInputSchema),z.lazy(() => UserAnalysisResultCreateManyUserInputSchema).array() ]),
}).strict();

export const UserInviteCodeUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserInviteCodeUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserInviteCodeWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserInviteCodeUpdateWithoutUserInputSchema),z.lazy(() => UserInviteCodeUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserInviteCodeCreateWithoutUserInputSchema),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserInviteCodeUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserInviteCodeUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserInviteCodeWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserInviteCodeUpdateWithoutUserInputSchema),z.lazy(() => UserInviteCodeUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserInviteCodeUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserInviteCodeUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserInviteCodeScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserInviteCodeUpdateManyMutationInputSchema),z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserInviteCodeScalarWhereInputSchema: z.ZodType<Prisma.UserInviteCodeScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserInviteCodeScalarWhereInputSchema),z.lazy(() => UserInviteCodeScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserInviteCodeScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserInviteCodeScalarWhereInputSchema),z.lazy(() => UserInviteCodeScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  code: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  isUsed: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  usedByUserId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const UserUpsertWithoutInvitedUsersInputSchema: z.ZodType<Prisma.UserUpsertWithoutInvitedUsersInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutInvitedUsersInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInvitedUsersInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutInvitedUsersInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitedUsersInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutInvitedUsersInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutInvitedUsersInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutInvitedUsersInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInvitedUsersInputSchema) ]),
}).strict();

export const UserUpdateWithoutInvitedUsersInputSchema: z.ZodType<Prisma.UserUpdateWithoutInvitedUsersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedBy: z.lazy(() => UserUpdateOneWithoutInvitedUsersNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutInvitedUsersInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutInvitedUsersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  invitedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUpsertWithWhereUniqueWithoutInvitedByInputSchema: z.ZodType<Prisma.UserUpsertWithWhereUniqueWithoutInvitedByInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserUpdateWithoutInvitedByInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInvitedByInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutInvitedByInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitedByInputSchema) ]),
}).strict();

export const UserUpdateWithWhereUniqueWithoutInvitedByInputSchema: z.ZodType<Prisma.UserUpdateWithWhereUniqueWithoutInvitedByInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserUpdateWithoutInvitedByInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInvitedByInputSchema) ]),
}).strict();

export const UserUpdateManyWithWhereWithoutInvitedByInputSchema: z.ZodType<Prisma.UserUpdateManyWithWhereWithoutInvitedByInput> = z.object({
  where: z.lazy(() => UserScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserUpdateManyMutationInputSchema),z.lazy(() => UserUncheckedUpdateManyWithoutInvitedByInputSchema) ]),
}).strict();

export const UserScalarWhereInputSchema: z.ZodType<Prisma.UserScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereInputSchema),z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereInputSchema),z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  telegramId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  username: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  firstName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  photoUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  coins: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  isVip: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  vipStartAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  vipExpireAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  vipLevel: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  isTelegramPremium: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  invitedByUserId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserAncestorUpsertWithWhereUniqueWithoutAncestorInputSchema: z.ZodType<Prisma.UserAncestorUpsertWithWhereUniqueWithoutAncestorInput> = z.object({
  where: z.lazy(() => UserAncestorWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserAncestorUpdateWithoutAncestorInputSchema),z.lazy(() => UserAncestorUncheckedUpdateWithoutAncestorInputSchema) ]),
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutAncestorInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutAncestorInputSchema) ]),
}).strict();

export const UserAncestorUpdateWithWhereUniqueWithoutAncestorInputSchema: z.ZodType<Prisma.UserAncestorUpdateWithWhereUniqueWithoutAncestorInput> = z.object({
  where: z.lazy(() => UserAncestorWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserAncestorUpdateWithoutAncestorInputSchema),z.lazy(() => UserAncestorUncheckedUpdateWithoutAncestorInputSchema) ]),
}).strict();

export const UserAncestorUpdateManyWithWhereWithoutAncestorInputSchema: z.ZodType<Prisma.UserAncestorUpdateManyWithWhereWithoutAncestorInput> = z.object({
  where: z.lazy(() => UserAncestorScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserAncestorUpdateManyMutationInputSchema),z.lazy(() => UserAncestorUncheckedUpdateManyWithoutAncestorInputSchema) ]),
}).strict();

export const UserAncestorScalarWhereInputSchema: z.ZodType<Prisma.UserAncestorScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserAncestorScalarWhereInputSchema),z.lazy(() => UserAncestorScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserAncestorScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserAncestorScalarWhereInputSchema),z.lazy(() => UserAncestorScalarWhereInputSchema).array() ]).optional(),
  ancestorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  descendantId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  depth: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const UserAncestorUpsertWithWhereUniqueWithoutDescendantInputSchema: z.ZodType<Prisma.UserAncestorUpsertWithWhereUniqueWithoutDescendantInput> = z.object({
  where: z.lazy(() => UserAncestorWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserAncestorUpdateWithoutDescendantInputSchema),z.lazy(() => UserAncestorUncheckedUpdateWithoutDescendantInputSchema) ]),
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutDescendantInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutDescendantInputSchema) ]),
}).strict();

export const UserAncestorUpdateWithWhereUniqueWithoutDescendantInputSchema: z.ZodType<Prisma.UserAncestorUpdateWithWhereUniqueWithoutDescendantInput> = z.object({
  where: z.lazy(() => UserAncestorWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserAncestorUpdateWithoutDescendantInputSchema),z.lazy(() => UserAncestorUncheckedUpdateWithoutDescendantInputSchema) ]),
}).strict();

export const UserAncestorUpdateManyWithWhereWithoutDescendantInputSchema: z.ZodType<Prisma.UserAncestorUpdateManyWithWhereWithoutDescendantInput> = z.object({
  where: z.lazy(() => UserAncestorScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserAncestorUpdateManyMutationInputSchema),z.lazy(() => UserAncestorUncheckedUpdateManyWithoutDescendantInputSchema) ]),
}).strict();

export const UserAncestorUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserAncestorUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserAncestorWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserAncestorUpdateWithoutUserInputSchema),z.lazy(() => UserAncestorUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserAncestorCreateWithoutUserInputSchema),z.lazy(() => UserAncestorUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserAncestorUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserAncestorUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserAncestorWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserAncestorUpdateWithoutUserInputSchema),z.lazy(() => UserAncestorUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserAncestorUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserAncestorUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserAncestorScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserAncestorUpdateManyMutationInputSchema),z.lazy(() => UserAncestorUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserInviteCodeUpsertWithWhereUniqueWithoutUsedByInputSchema: z.ZodType<Prisma.UserInviteCodeUpsertWithWhereUniqueWithoutUsedByInput> = z.object({
  where: z.lazy(() => UserInviteCodeWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserInviteCodeUpdateWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUncheckedUpdateWithoutUsedByInputSchema) ]),
  create: z.union([ z.lazy(() => UserInviteCodeCreateWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUncheckedCreateWithoutUsedByInputSchema) ]),
}).strict();

export const UserInviteCodeUpdateWithWhereUniqueWithoutUsedByInputSchema: z.ZodType<Prisma.UserInviteCodeUpdateWithWhereUniqueWithoutUsedByInput> = z.object({
  where: z.lazy(() => UserInviteCodeWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserInviteCodeUpdateWithoutUsedByInputSchema),z.lazy(() => UserInviteCodeUncheckedUpdateWithoutUsedByInputSchema) ]),
}).strict();

export const UserInviteCodeUpdateManyWithWhereWithoutUsedByInputSchema: z.ZodType<Prisma.UserInviteCodeUpdateManyWithWhereWithoutUsedByInput> = z.object({
  where: z.lazy(() => UserInviteCodeScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserInviteCodeUpdateManyMutationInputSchema),z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUsedByInputSchema) ]),
}).strict();

export const OrderUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.OrderUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderUpdateWithoutUserInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema),z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const OrderUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.OrderUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderUpdateWithoutUserInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const OrderUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.OrderUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => OrderScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderUpdateManyMutationInputSchema),z.lazy(() => OrderUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const OrderScalarWhereInputSchema: z.ZodType<Prisma.OrderScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => OrderScalarWhereInputSchema),z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderScalarWhereInputSchema),z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  paymentType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  paymentLink: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  externalPaymentId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  fiatAmount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  exchangeRate: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  rateValidSeconds: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  customExpiration: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  expireAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  paymentData: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastCheckedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  paidAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  transactionId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserOrderUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserOrderUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserOrderWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserOrderUpdateWithoutUserInputSchema),z.lazy(() => UserOrderUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserOrderCreateWithoutUserInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserOrderUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserOrderUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserOrderWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserOrderUpdateWithoutUserInputSchema),z.lazy(() => UserOrderUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserOrderUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserOrderUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserOrderScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserOrderUpdateManyMutationInputSchema),z.lazy(() => UserOrderUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserOrderScalarWhereInputSchema: z.ZodType<Prisma.UserOrderScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserOrderScalarWhereInputSchema),z.lazy(() => UserOrderScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserOrderScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserOrderScalarWhereInputSchema),z.lazy(() => UserOrderScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  completedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  productId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserAnalysisResultUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserAnalysisResultUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserAnalysisResultWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserAnalysisResultUpdateWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserAnalysisResultCreateWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserAnalysisResultUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserAnalysisResultUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserAnalysisResultWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserAnalysisResultUpdateWithoutUserInputSchema),z.lazy(() => UserAnalysisResultUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserAnalysisResultUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserAnalysisResultUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserAnalysisResultScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserAnalysisResultUpdateManyMutationInputSchema),z.lazy(() => UserAnalysisResultUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserAnalysisResultScalarWhereInputSchema: z.ZodType<Prisma.UserAnalysisResultScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserAnalysisResultScalarWhereInputSchema),z.lazy(() => UserAnalysisResultScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserAnalysisResultScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserAnalysisResultScalarWhereInputSchema),z.lazy(() => UserAnalysisResultScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  symbol: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  result: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  cost: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserCreateWithoutUsedInviteCodesInputSchema: z.ZodType<Prisma.UserCreateWithoutUsedInviteCodesInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedBy: z.lazy(() => UserCreateNestedOneWithoutInvitedUsersInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorCreateNestedManyWithoutUserInputSchema).optional(),
  Order: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutUsedInviteCodesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutUsedInviteCodesInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  invitedByUserId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutUsedInviteCodesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUsedInviteCodesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUsedInviteCodesInputSchema),z.lazy(() => UserUncheckedCreateWithoutUsedInviteCodesInputSchema) ]),
}).strict();

export const UserCreateWithoutInviteCodesInputSchema: z.ZodType<Prisma.UserCreateWithoutInviteCodesInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  InvitedBy: z.lazy(() => UserCreateNestedOneWithoutInvitedUsersInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutInviteCodesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutInviteCodesInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  invitedByUserId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  InvitedUsers: z.lazy(() => UserUncheckedCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutInviteCodesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutInviteCodesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutInviteCodesInputSchema),z.lazy(() => UserUncheckedCreateWithoutInviteCodesInputSchema) ]),
}).strict();

export const UserUpsertWithoutUsedInviteCodesInputSchema: z.ZodType<Prisma.UserUpsertWithoutUsedInviteCodesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUsedInviteCodesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUsedInviteCodesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUsedInviteCodesInputSchema),z.lazy(() => UserUncheckedCreateWithoutUsedInviteCodesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutUsedInviteCodesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUsedInviteCodesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUsedInviteCodesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUsedInviteCodesInputSchema) ]),
}).strict();

export const UserUpdateWithoutUsedInviteCodesInputSchema: z.ZodType<Prisma.UserUpdateWithoutUsedInviteCodesInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedBy: z.lazy(() => UserUpdateOneWithoutInvitedUsersNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUpdateManyWithoutUserNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutUsedInviteCodesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutUsedInviteCodesInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  invitedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUpsertWithoutInviteCodesInputSchema: z.ZodType<Prisma.UserUpsertWithoutInviteCodesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutInviteCodesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInviteCodesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutInviteCodesInputSchema),z.lazy(() => UserUncheckedCreateWithoutInviteCodesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutInviteCodesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutInviteCodesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutInviteCodesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInviteCodesInputSchema) ]),
}).strict();

export const UserUpdateWithoutInviteCodesInputSchema: z.ZodType<Prisma.UserUpdateWithoutInviteCodesInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  InvitedBy: z.lazy(() => UserUpdateOneWithoutInvitedUsersNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutInviteCodesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutInviteCodesInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  invitedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutUserAncestorsInputSchema: z.ZodType<Prisma.UserCreateWithoutUserAncestorsInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedBy: z.lazy(() => UserCreateNestedOneWithoutInvitedUsersInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutDescendantInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutUserAncestorsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutUserAncestorsInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  invitedByUserId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutDescendantInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutUserAncestorsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserAncestorsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUserAncestorsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserAncestorsInputSchema) ]),
}).strict();

export const UserCreateWithoutAncestorRelationsInputSchema: z.ZodType<Prisma.UserCreateWithoutAncestorRelationsInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedBy: z.lazy(() => UserCreateNestedOneWithoutInvitedUsersInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserCreateNestedManyWithoutInvitedByInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutAncestorRelationsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutAncestorRelationsInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  invitedByUserId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedCreateNestedManyWithoutInvitedByInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutAncestorRelationsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutAncestorRelationsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutAncestorRelationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAncestorRelationsInputSchema) ]),
}).strict();

export const UserCreateWithoutDescendantRelationsInputSchema: z.ZodType<Prisma.UserCreateWithoutDescendantRelationsInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedBy: z.lazy(() => UserCreateNestedOneWithoutInvitedUsersInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutAncestorInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutDescendantRelationsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutDescendantRelationsInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  invitedByUserId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutAncestorInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutDescendantRelationsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDescendantRelationsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDescendantRelationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDescendantRelationsInputSchema) ]),
}).strict();

export const UserUpsertWithoutUserAncestorsInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserAncestorsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUserAncestorsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserAncestorsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUserAncestorsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserAncestorsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutUserAncestorsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserAncestorsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUserAncestorsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserAncestorsInputSchema) ]),
}).strict();

export const UserUpdateWithoutUserAncestorsInputSchema: z.ZodType<Prisma.UserUpdateWithoutUserAncestorsInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedBy: z.lazy(() => UserUpdateOneWithoutInvitedUsersNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutUserAncestorsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutUserAncestorsInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  invitedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUpsertWithoutAncestorRelationsInputSchema: z.ZodType<Prisma.UserUpsertWithoutAncestorRelationsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutAncestorRelationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAncestorRelationsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutAncestorRelationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAncestorRelationsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutAncestorRelationsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutAncestorRelationsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutAncestorRelationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAncestorRelationsInputSchema) ]),
}).strict();

export const UserUpdateWithoutAncestorRelationsInputSchema: z.ZodType<Prisma.UserUpdateWithoutAncestorRelationsInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedBy: z.lazy(() => UserUpdateOneWithoutInvitedUsersNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutAncestorRelationsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutAncestorRelationsInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  invitedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUpsertWithoutDescendantRelationsInputSchema: z.ZodType<Prisma.UserUpsertWithoutDescendantRelationsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutDescendantRelationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDescendantRelationsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutDescendantRelationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDescendantRelationsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutDescendantRelationsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDescendantRelationsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutDescendantRelationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDescendantRelationsInputSchema) ]),
}).strict();

export const UserUpdateWithoutDescendantRelationsInputSchema: z.ZodType<Prisma.UserUpdateWithoutDescendantRelationsInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedBy: z.lazy(() => UserUpdateOneWithoutInvitedUsersNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUpdateManyWithoutAncestorNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutDescendantRelationsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutDescendantRelationsInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  invitedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutAncestorNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const OrderStatusHistoryCreateWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateWithoutOrderInput> = z.object({
  id: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  changedAt: z.coerce.date().optional(),
  metadata: z.string().optional().nullable()
}).strict();

export const OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedCreateWithoutOrderInput> = z.object({
  id: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  changedAt: z.coerce.date().optional(),
  metadata: z.string().optional().nullable()
}).strict();

export const OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateOrConnectWithoutOrderInput> = z.object({
  where: z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema) ]),
}).strict();

export const OrderStatusHistoryCreateManyOrderInputEnvelopeSchema: z.ZodType<Prisma.OrderStatusHistoryCreateManyOrderInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => OrderStatusHistoryCreateManyOrderInputSchema),z.lazy(() => OrderStatusHistoryCreateManyOrderInputSchema).array() ]),
}).strict();

export const UserOrderCreateWithoutOrderInputSchema: z.ZodType<Prisma.UserOrderCreateWithoutOrderInput> = z.object({
  id: z.string().optional(),
  quantity: z.number().int().optional(),
  status: z.string().optional(),
  completedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  User: z.lazy(() => UserCreateNestedOneWithoutUserOrderInputSchema),
  Product: z.lazy(() => ProductCreateNestedOneWithoutUserOrdersInputSchema)
}).strict();

export const UserOrderUncheckedCreateWithoutOrderInputSchema: z.ZodType<Prisma.UserOrderUncheckedCreateWithoutOrderInput> = z.object({
  id: z.string().optional(),
  userId: z.string(),
  quantity: z.number().int().optional(),
  status: z.string().optional(),
  completedAt: z.coerce.date().optional().nullable(),
  productId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserOrderCreateOrConnectWithoutOrderInputSchema: z.ZodType<Prisma.UserOrderCreateOrConnectWithoutOrderInput> = z.object({
  where: z.lazy(() => UserOrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserOrderCreateWithoutOrderInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutOrderInputSchema) ]),
}).strict();

export const UserCreateWithoutOrderInputSchema: z.ZodType<Prisma.UserCreateWithoutOrderInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedBy: z.lazy(() => UserCreateNestedOneWithoutInvitedUsersInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUsedByInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutOrderInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutOrderInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  invitedByUserId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUsedByInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutOrderInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutOrderInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutOrderInputSchema),z.lazy(() => UserUncheckedCreateWithoutOrderInputSchema) ]),
}).strict();

export const OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderInput> = z.object({
  where: z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderStatusHistoryUpdateWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUncheckedUpdateWithoutOrderInputSchema) ]),
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema) ]),
}).strict();

export const OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderInput> = z.object({
  where: z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderStatusHistoryUpdateWithoutOrderInputSchema),z.lazy(() => OrderStatusHistoryUncheckedUpdateWithoutOrderInputSchema) ]),
}).strict();

export const OrderStatusHistoryUpdateManyWithWhereWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateManyWithWhereWithoutOrderInput> = z.object({
  where: z.lazy(() => OrderStatusHistoryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderStatusHistoryUpdateManyMutationInputSchema),z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutOrderInputSchema) ]),
}).strict();

export const OrderStatusHistoryScalarWhereInputSchema: z.ZodType<Prisma.OrderStatusHistoryScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereInputSchema),z.lazy(() => OrderStatusHistoryScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderStatusHistoryScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereInputSchema),z.lazy(() => OrderStatusHistoryScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  from: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  to: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  changedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  metadata: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  orderId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const UserOrderUpsertWithoutOrderInputSchema: z.ZodType<Prisma.UserOrderUpsertWithoutOrderInput> = z.object({
  update: z.union([ z.lazy(() => UserOrderUpdateWithoutOrderInputSchema),z.lazy(() => UserOrderUncheckedUpdateWithoutOrderInputSchema) ]),
  create: z.union([ z.lazy(() => UserOrderCreateWithoutOrderInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutOrderInputSchema) ]),
  where: z.lazy(() => UserOrderWhereInputSchema).optional()
}).strict();

export const UserOrderUpdateToOneWithWhereWithoutOrderInputSchema: z.ZodType<Prisma.UserOrderUpdateToOneWithWhereWithoutOrderInput> = z.object({
  where: z.lazy(() => UserOrderWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserOrderUpdateWithoutOrderInputSchema),z.lazy(() => UserOrderUncheckedUpdateWithoutOrderInputSchema) ]),
}).strict();

export const UserOrderUpdateWithoutOrderInputSchema: z.ZodType<Prisma.UserOrderUpdateWithoutOrderInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  completedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutUserOrderNestedInputSchema).optional(),
  Product: z.lazy(() => ProductUpdateOneRequiredWithoutUserOrdersNestedInputSchema).optional()
}).strict();

export const UserOrderUncheckedUpdateWithoutOrderInputSchema: z.ZodType<Prisma.UserOrderUncheckedUpdateWithoutOrderInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  completedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserUpsertWithoutOrderInputSchema: z.ZodType<Prisma.UserUpsertWithoutOrderInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutOrderInputSchema),z.lazy(() => UserUncheckedUpdateWithoutOrderInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutOrderInputSchema),z.lazy(() => UserUncheckedCreateWithoutOrderInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutOrderInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutOrderInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutOrderInputSchema),z.lazy(() => UserUncheckedUpdateWithoutOrderInputSchema) ]),
}).strict();

export const UserUpdateWithoutOrderInputSchema: z.ZodType<Prisma.UserUpdateWithoutOrderInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedBy: z.lazy(() => UserUpdateOneWithoutInvitedUsersNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUsedByNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutOrderInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutOrderInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  invitedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUsedByNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutUserOrderInputSchema: z.ZodType<Prisma.UserCreateWithoutUserOrderInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedBy: z.lazy(() => UserCreateNestedOneWithoutInvitedUsersInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutUserOrderInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutUserOrderInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  invitedByUserId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutUserOrderInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserOrderInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUserOrderInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserOrderInputSchema) ]),
}).strict();

export const OrderCreateWithoutUserOrdersInputSchema: z.ZodType<Prisma.OrderCreateWithoutUserOrdersInput> = z.object({
  id: z.string().optional(),
  paymentType: z.string(),
  paymentLink: z.string().optional().nullable(),
  externalPaymentId: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  fiatAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  exchangeRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  rateValidSeconds: z.number().int().optional(),
  customExpiration: z.number().int().optional(),
  expireAt: z.coerce.date(),
  status: z.string().optional(),
  paymentData: z.string().optional().nullable(),
  lastCheckedAt: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutOrderInputSchema).optional(),
  User: z.lazy(() => UserCreateNestedOneWithoutOrderInputSchema)
}).strict();

export const OrderUncheckedCreateWithoutUserOrdersInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutUserOrdersInput> = z.object({
  id: z.string().optional(),
  userId: z.string(),
  paymentType: z.string(),
  paymentLink: z.string().optional().nullable(),
  externalPaymentId: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  fiatAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  exchangeRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  rateValidSeconds: z.number().int().optional(),
  customExpiration: z.number().int().optional(),
  expireAt: z.coerce.date(),
  status: z.string().optional(),
  paymentData: z.string().optional().nullable(),
  lastCheckedAt: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderInputSchema).optional()
}).strict();

export const OrderCreateOrConnectWithoutUserOrdersInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutUserOrdersInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutUserOrdersInputSchema),z.lazy(() => OrderUncheckedCreateWithoutUserOrdersInputSchema) ]),
}).strict();

export const ProductCreateWithoutUserOrdersInputSchema: z.ZodType<Prisma.ProductCreateWithoutUserOrdersInput> = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  type: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  value: z.number().int().optional(),
  discount: z.number().int().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  metadata: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const ProductUncheckedCreateWithoutUserOrdersInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutUserOrdersInput> = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  type: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  value: z.number().int().optional(),
  discount: z.number().int().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  metadata: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const ProductCreateOrConnectWithoutUserOrdersInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutUserOrdersInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutUserOrdersInputSchema),z.lazy(() => ProductUncheckedCreateWithoutUserOrdersInputSchema) ]),
}).strict();

export const UserUpsertWithoutUserOrderInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserOrderInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUserOrderInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserOrderInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUserOrderInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserOrderInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutUserOrderInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserOrderInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUserOrderInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserOrderInputSchema) ]),
}).strict();

export const UserUpdateWithoutUserOrderInputSchema: z.ZodType<Prisma.UserUpdateWithoutUserOrderInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedBy: z.lazy(() => UserUpdateOneWithoutInvitedUsersNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutUserOrderInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutUserOrderInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  invitedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const OrderUpsertWithoutUserOrdersInputSchema: z.ZodType<Prisma.OrderUpsertWithoutUserOrdersInput> = z.object({
  update: z.union([ z.lazy(() => OrderUpdateWithoutUserOrdersInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutUserOrdersInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutUserOrdersInputSchema),z.lazy(() => OrderUncheckedCreateWithoutUserOrdersInputSchema) ]),
  where: z.lazy(() => OrderWhereInputSchema).optional()
}).strict();

export const OrderUpdateToOneWithWhereWithoutUserOrdersInputSchema: z.ZodType<Prisma.OrderUpdateToOneWithWhereWithoutUserOrdersInput> = z.object({
  where: z.lazy(() => OrderWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrderUpdateWithoutUserOrdersInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutUserOrdersInputSchema) ]),
}).strict();

export const OrderUpdateWithoutUserOrdersInputSchema: z.ZodType<Prisma.OrderUpdateWithoutUserOrdersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  externalPaymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  fiatAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  exchangeRate: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  rateValidSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  customExpiration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  expireAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentData: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastCheckedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryUpdateManyWithoutOrderNestedInputSchema).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutOrderNestedInputSchema).optional()
}).strict();

export const OrderUncheckedUpdateWithoutUserOrdersInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutUserOrdersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  externalPaymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  fiatAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  exchangeRate: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  rateValidSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  customExpiration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  expireAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentData: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastCheckedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutOrderNestedInputSchema).optional()
}).strict();

export const ProductUpsertWithoutUserOrdersInputSchema: z.ZodType<Prisma.ProductUpsertWithoutUserOrdersInput> = z.object({
  update: z.union([ z.lazy(() => ProductUpdateWithoutUserOrdersInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutUserOrdersInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutUserOrdersInputSchema),z.lazy(() => ProductUncheckedCreateWithoutUserOrdersInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional()
}).strict();

export const ProductUpdateToOneWithWhereWithoutUserOrdersInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutUserOrdersInput> = z.object({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutUserOrdersInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutUserOrdersInputSchema) ]),
}).strict();

export const ProductUpdateWithoutUserOrdersInputSchema: z.ZodType<Prisma.ProductUpdateWithoutUserOrdersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  discount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayOrder: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProductUncheckedUpdateWithoutUserOrdersInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutUserOrdersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  discount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  displayOrder: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const OrderCreateWithoutOrderStatusHistoryInputSchema: z.ZodType<Prisma.OrderCreateWithoutOrderStatusHistoryInput> = z.object({
  id: z.string().optional(),
  paymentType: z.string(),
  paymentLink: z.string().optional().nullable(),
  externalPaymentId: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  fiatAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  exchangeRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  rateValidSeconds: z.number().int().optional(),
  customExpiration: z.number().int().optional(),
  expireAt: z.coerce.date(),
  status: z.string().optional(),
  paymentData: z.string().optional().nullable(),
  lastCheckedAt: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  UserOrders: z.lazy(() => UserOrderCreateNestedOneWithoutOrderInputSchema).optional(),
  User: z.lazy(() => UserCreateNestedOneWithoutOrderInputSchema)
}).strict();

export const OrderUncheckedCreateWithoutOrderStatusHistoryInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutOrderStatusHistoryInput> = z.object({
  id: z.string().optional(),
  userId: z.string(),
  paymentType: z.string(),
  paymentLink: z.string().optional().nullable(),
  externalPaymentId: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  fiatAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  exchangeRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  rateValidSeconds: z.number().int().optional(),
  customExpiration: z.number().int().optional(),
  expireAt: z.coerce.date(),
  status: z.string().optional(),
  paymentData: z.string().optional().nullable(),
  lastCheckedAt: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  UserOrders: z.lazy(() => UserOrderUncheckedCreateNestedOneWithoutOrderInputSchema).optional()
}).strict();

export const OrderCreateOrConnectWithoutOrderStatusHistoryInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutOrderStatusHistoryInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutOrderStatusHistoryInputSchema),z.lazy(() => OrderUncheckedCreateWithoutOrderStatusHistoryInputSchema) ]),
}).strict();

export const OrderUpsertWithoutOrderStatusHistoryInputSchema: z.ZodType<Prisma.OrderUpsertWithoutOrderStatusHistoryInput> = z.object({
  update: z.union([ z.lazy(() => OrderUpdateWithoutOrderStatusHistoryInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutOrderStatusHistoryInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutOrderStatusHistoryInputSchema),z.lazy(() => OrderUncheckedCreateWithoutOrderStatusHistoryInputSchema) ]),
  where: z.lazy(() => OrderWhereInputSchema).optional()
}).strict();

export const OrderUpdateToOneWithWhereWithoutOrderStatusHistoryInputSchema: z.ZodType<Prisma.OrderUpdateToOneWithWhereWithoutOrderStatusHistoryInput> = z.object({
  where: z.lazy(() => OrderWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrderUpdateWithoutOrderStatusHistoryInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutOrderStatusHistoryInputSchema) ]),
}).strict();

export const OrderUpdateWithoutOrderStatusHistoryInputSchema: z.ZodType<Prisma.OrderUpdateWithoutOrderStatusHistoryInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  externalPaymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  fiatAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  exchangeRate: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  rateValidSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  customExpiration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  expireAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentData: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastCheckedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOrders: z.lazy(() => UserOrderUpdateOneWithoutOrderNestedInputSchema).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutOrderNestedInputSchema).optional()
}).strict();

export const OrderUncheckedUpdateWithoutOrderStatusHistoryInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutOrderStatusHistoryInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  externalPaymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  fiatAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  exchangeRate: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  rateValidSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  customExpiration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  expireAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentData: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastCheckedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOrders: z.lazy(() => UserOrderUncheckedUpdateOneWithoutOrderNestedInputSchema).optional()
}).strict();

export const UserOrderCreateWithoutProductInputSchema: z.ZodType<Prisma.UserOrderCreateWithoutProductInput> = z.object({
  id: z.string().optional(),
  quantity: z.number().int().optional(),
  status: z.string().optional(),
  completedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  User: z.lazy(() => UserCreateNestedOneWithoutUserOrderInputSchema),
  Order: z.lazy(() => OrderCreateNestedOneWithoutUserOrdersInputSchema)
}).strict();

export const UserOrderUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.UserOrderUncheckedCreateWithoutProductInput> = z.object({
  id: z.string().optional(),
  userId: z.string(),
  orderId: z.string(),
  quantity: z.number().int().optional(),
  status: z.string().optional(),
  completedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserOrderCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.UserOrderCreateOrConnectWithoutProductInput> = z.object({
  where: z.lazy(() => UserOrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserOrderCreateWithoutProductInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export const UserOrderCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.UserOrderCreateManyProductInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserOrderCreateManyProductInputSchema),z.lazy(() => UserOrderCreateManyProductInputSchema).array() ]),
}).strict();

export const UserOrderUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.UserOrderUpsertWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => UserOrderWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserOrderUpdateWithoutProductInputSchema),z.lazy(() => UserOrderUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => UserOrderCreateWithoutProductInputSchema),z.lazy(() => UserOrderUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export const UserOrderUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.UserOrderUpdateWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => UserOrderWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserOrderUpdateWithoutProductInputSchema),z.lazy(() => UserOrderUncheckedUpdateWithoutProductInputSchema) ]),
}).strict();

export const UserOrderUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.UserOrderUpdateManyWithWhereWithoutProductInput> = z.object({
  where: z.lazy(() => UserOrderScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserOrderUpdateManyMutationInputSchema),z.lazy(() => UserOrderUncheckedUpdateManyWithoutProductInputSchema) ]),
}).strict();

export const UserCreateWithoutUserAnalysisResultInputSchema: z.ZodType<Prisma.UserCreateWithoutUserAnalysisResultInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedBy: z.lazy(() => UserCreateNestedOneWithoutInvitedUsersInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutUserAnalysisResultInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutUserAnalysisResultInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  invitedByUserId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedCreateNestedManyWithoutInvitedByInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutAncestorInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutDescendantInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedCreateNestedManyWithoutUsedByInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutUserAnalysisResultInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserAnalysisResultInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUserAnalysisResultInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserAnalysisResultInputSchema) ]),
}).strict();

export const UserUpsertWithoutUserAnalysisResultInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserAnalysisResultInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUserAnalysisResultInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserAnalysisResultInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUserAnalysisResultInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserAnalysisResultInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutUserAnalysisResultInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserAnalysisResultInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUserAnalysisResultInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserAnalysisResultInputSchema) ]),
}).strict();

export const UserUpdateWithoutUserAnalysisResultInputSchema: z.ZodType<Prisma.UserUpdateWithoutUserAnalysisResultInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedBy: z.lazy(() => UserUpdateOneWithoutInvitedUsersNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutUserAnalysisResultInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutUserAnalysisResultInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  invitedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserInviteCodeCreateManyUserInputSchema: z.ZodType<Prisma.UserInviteCodeCreateManyUserInput> = z.object({
  id: z.number().int().optional(),
  code: z.string(),
  createdAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  isUsed: z.boolean().optional(),
  usedByUserId: z.string().optional().nullable()
}).strict();

export const UserCreateManyInvitedByInputSchema: z.ZodType<Prisma.UserCreateManyInvitedByInput> = z.object({
  id: z.string().optional(),
  telegramId: z.string(),
  username: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  coins: z.number().int().optional(),
  isVip: z.boolean().optional(),
  vipStartAt: z.coerce.date().optional().nullable(),
  vipExpireAt: z.coerce.date().optional().nullable(),
  vipLevel: z.number().int().optional(),
  isTelegramPremium: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserAncestorCreateManyAncestorInputSchema: z.ZodType<Prisma.UserAncestorCreateManyAncestorInput> = z.object({
  descendantId: z.string(),
  depth: z.number().int(),
  userId: z.string().optional().nullable()
}).strict();

export const UserAncestorCreateManyDescendantInputSchema: z.ZodType<Prisma.UserAncestorCreateManyDescendantInput> = z.object({
  ancestorId: z.string(),
  depth: z.number().int(),
  userId: z.string().optional().nullable()
}).strict();

export const UserAncestorCreateManyUserInputSchema: z.ZodType<Prisma.UserAncestorCreateManyUserInput> = z.object({
  ancestorId: z.string(),
  descendantId: z.string(),
  depth: z.number().int()
}).strict();

export const UserInviteCodeCreateManyUsedByInputSchema: z.ZodType<Prisma.UserInviteCodeCreateManyUsedByInput> = z.object({
  id: z.number().int().optional(),
  code: z.string(),
  createdAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  isUsed: z.boolean().optional(),
  userId: z.string()
}).strict();

export const OrderCreateManyUserInputSchema: z.ZodType<Prisma.OrderCreateManyUserInput> = z.object({
  id: z.string().optional(),
  paymentType: z.string(),
  paymentLink: z.string().optional().nullable(),
  externalPaymentId: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  fiatAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  exchangeRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  rateValidSeconds: z.number().int().optional(),
  customExpiration: z.number().int().optional(),
  expireAt: z.coerce.date(),
  status: z.string().optional(),
  paymentData: z.string().optional().nullable(),
  lastCheckedAt: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserOrderCreateManyUserInputSchema: z.ZodType<Prisma.UserOrderCreateManyUserInput> = z.object({
  id: z.string().optional(),
  orderId: z.string(),
  quantity: z.number().int().optional(),
  status: z.string().optional(),
  completedAt: z.coerce.date().optional().nullable(),
  productId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserAnalysisResultCreateManyUserInputSchema: z.ZodType<Prisma.UserAnalysisResultCreateManyUserInput> = z.object({
  id: z.string().optional(),
  symbol: z.string(),
  type: z.string(),
  result: z.string(),
  cost: z.number().int().optional(),
  createdAt: z.coerce.date().optional()
}).strict();

export const UserInviteCodeUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserInviteCodeUpdateWithoutUserInput> = z.object({
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isUsed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  UsedBy: z.lazy(() => UserUpdateOneWithoutUsedInviteCodesNestedInputSchema).optional()
}).strict();

export const UserInviteCodeUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserInviteCodeUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isUsed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  usedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserInviteCodeUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserInviteCodeUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isUsed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  usedByUserId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserUpdateWithoutInvitedByInputSchema: z.ZodType<Prisma.UserUpdateWithoutInvitedByInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutInvitedByInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutInvitedByInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  InvitedUsers: z.lazy(() => UserUncheckedUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  AncestorRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutAncestorNestedInputSchema).optional(),
  DescendantRelations: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutDescendantNestedInputSchema).optional(),
  UserAncestors: z.lazy(() => UserAncestorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UsedInviteCodes: z.lazy(() => UserInviteCodeUncheckedUpdateManyWithoutUsedByNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserOrder: z.lazy(() => UserOrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserAnalysisResult: z.lazy(() => UserAnalysisResultUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateManyWithoutInvitedByInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyWithoutInvitedByInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  telegramId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coins: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isVip: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  vipStartAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipExpireAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vipLevel: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isTelegramPremium: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserAncestorUpdateWithoutAncestorInputSchema: z.ZodType<Prisma.UserAncestorUpdateWithoutAncestorInput> = z.object({
  depth: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  User: z.lazy(() => UserUpdateOneWithoutUserAncestorsNestedInputSchema).optional(),
  Descendant: z.lazy(() => UserUpdateOneRequiredWithoutDescendantRelationsNestedInputSchema).optional()
}).strict();

export const UserAncestorUncheckedUpdateWithoutAncestorInputSchema: z.ZodType<Prisma.UserAncestorUncheckedUpdateWithoutAncestorInput> = z.object({
  descendantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  depth: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserAncestorUncheckedUpdateManyWithoutAncestorInputSchema: z.ZodType<Prisma.UserAncestorUncheckedUpdateManyWithoutAncestorInput> = z.object({
  descendantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  depth: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserAncestorUpdateWithoutDescendantInputSchema: z.ZodType<Prisma.UserAncestorUpdateWithoutDescendantInput> = z.object({
  depth: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  User: z.lazy(() => UserUpdateOneWithoutUserAncestorsNestedInputSchema).optional(),
  Ancestor: z.lazy(() => UserUpdateOneRequiredWithoutAncestorRelationsNestedInputSchema).optional()
}).strict();

export const UserAncestorUncheckedUpdateWithoutDescendantInputSchema: z.ZodType<Prisma.UserAncestorUncheckedUpdateWithoutDescendantInput> = z.object({
  ancestorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  depth: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserAncestorUncheckedUpdateManyWithoutDescendantInputSchema: z.ZodType<Prisma.UserAncestorUncheckedUpdateManyWithoutDescendantInput> = z.object({
  ancestorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  depth: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserAncestorUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserAncestorUpdateWithoutUserInput> = z.object({
  depth: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  Ancestor: z.lazy(() => UserUpdateOneRequiredWithoutAncestorRelationsNestedInputSchema).optional(),
  Descendant: z.lazy(() => UserUpdateOneRequiredWithoutDescendantRelationsNestedInputSchema).optional()
}).strict();

export const UserAncestorUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserAncestorUncheckedUpdateWithoutUserInput> = z.object({
  ancestorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  descendantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  depth: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserAncestorUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserAncestorUncheckedUpdateManyWithoutUserInput> = z.object({
  ancestorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  descendantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  depth: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserInviteCodeUpdateWithoutUsedByInputSchema: z.ZodType<Prisma.UserInviteCodeUpdateWithoutUsedByInput> = z.object({
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isUsed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutInviteCodesNestedInputSchema).optional()
}).strict();

export const UserInviteCodeUncheckedUpdateWithoutUsedByInputSchema: z.ZodType<Prisma.UserInviteCodeUncheckedUpdateWithoutUsedByInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isUsed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserInviteCodeUncheckedUpdateManyWithoutUsedByInputSchema: z.ZodType<Prisma.UserInviteCodeUncheckedUpdateManyWithoutUsedByInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isUsed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const OrderUpdateWithoutUserInputSchema: z.ZodType<Prisma.OrderUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  externalPaymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  fiatAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  exchangeRate: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  rateValidSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  customExpiration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  expireAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentData: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastCheckedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryUpdateManyWithoutOrderNestedInputSchema).optional(),
  UserOrders: z.lazy(() => UserOrderUpdateOneWithoutOrderNestedInputSchema).optional()
}).strict();

export const OrderUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  externalPaymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  fiatAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  exchangeRate: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  rateValidSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  customExpiration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  expireAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentData: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastCheckedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  OrderStatusHistory: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
  UserOrders: z.lazy(() => UserOrderUncheckedUpdateOneWithoutOrderNestedInputSchema).optional()
}).strict();

export const OrderUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  externalPaymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  fiatAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  exchangeRate: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  rateValidSeconds: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  customExpiration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  expireAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  paymentData: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastCheckedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserOrderUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserOrderUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  completedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  Order: z.lazy(() => OrderUpdateOneRequiredWithoutUserOrdersNestedInputSchema).optional(),
  Product: z.lazy(() => ProductUpdateOneRequiredWithoutUserOrdersNestedInputSchema).optional()
}).strict();

export const UserOrderUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserOrderUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  completedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserOrderUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserOrderUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  completedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserAnalysisResultUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserAnalysisResultUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  symbol: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cost: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserAnalysisResultUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserAnalysisResultUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  symbol: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cost: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserAnalysisResultUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserAnalysisResultUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  symbol: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cost: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const OrderStatusHistoryCreateManyOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateManyOrderInput> = z.object({
  id: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  changedAt: z.coerce.date().optional(),
  metadata: z.string().optional().nullable()
}).strict();

export const OrderStatusHistoryUpdateWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateWithoutOrderInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  from: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  to: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const OrderStatusHistoryUncheckedUpdateWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedUpdateWithoutOrderInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  from: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  to: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const OrderStatusHistoryUncheckedUpdateManyWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedUpdateManyWithoutOrderInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  from: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  to: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserOrderCreateManyProductInputSchema: z.ZodType<Prisma.UserOrderCreateManyProductInput> = z.object({
  id: z.string().optional(),
  userId: z.string(),
  orderId: z.string(),
  quantity: z.number().int().optional(),
  status: z.string().optional(),
  completedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserOrderUpdateWithoutProductInputSchema: z.ZodType<Prisma.UserOrderUpdateWithoutProductInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  completedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutUserOrderNestedInputSchema).optional(),
  Order: z.lazy(() => OrderUpdateOneRequiredWithoutUserOrdersNestedInputSchema).optional()
}).strict();

export const UserOrderUncheckedUpdateWithoutProductInputSchema: z.ZodType<Prisma.UserOrderUncheckedUpdateWithoutProductInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  completedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserOrderUncheckedUpdateManyWithoutProductInputSchema: z.ZodType<Prisma.UserOrderUncheckedUpdateManyWithoutProductInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  completedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(),UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(),
  having: UserScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserInviteCodeFindFirstArgsSchema: z.ZodType<Prisma.UserInviteCodeFindFirstArgs> = z.object({
  select: UserInviteCodeSelectSchema.optional(),
  include: UserInviteCodeIncludeSchema.optional(),
  where: UserInviteCodeWhereInputSchema.optional(),
  orderBy: z.union([ UserInviteCodeOrderByWithRelationInputSchema.array(),UserInviteCodeOrderByWithRelationInputSchema ]).optional(),
  cursor: UserInviteCodeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserInviteCodeScalarFieldEnumSchema,UserInviteCodeScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserInviteCodeFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserInviteCodeFindFirstOrThrowArgs> = z.object({
  select: UserInviteCodeSelectSchema.optional(),
  include: UserInviteCodeIncludeSchema.optional(),
  where: UserInviteCodeWhereInputSchema.optional(),
  orderBy: z.union([ UserInviteCodeOrderByWithRelationInputSchema.array(),UserInviteCodeOrderByWithRelationInputSchema ]).optional(),
  cursor: UserInviteCodeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserInviteCodeScalarFieldEnumSchema,UserInviteCodeScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserInviteCodeFindManyArgsSchema: z.ZodType<Prisma.UserInviteCodeFindManyArgs> = z.object({
  select: UserInviteCodeSelectSchema.optional(),
  include: UserInviteCodeIncludeSchema.optional(),
  where: UserInviteCodeWhereInputSchema.optional(),
  orderBy: z.union([ UserInviteCodeOrderByWithRelationInputSchema.array(),UserInviteCodeOrderByWithRelationInputSchema ]).optional(),
  cursor: UserInviteCodeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserInviteCodeScalarFieldEnumSchema,UserInviteCodeScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserInviteCodeAggregateArgsSchema: z.ZodType<Prisma.UserInviteCodeAggregateArgs> = z.object({
  where: UserInviteCodeWhereInputSchema.optional(),
  orderBy: z.union([ UserInviteCodeOrderByWithRelationInputSchema.array(),UserInviteCodeOrderByWithRelationInputSchema ]).optional(),
  cursor: UserInviteCodeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserInviteCodeGroupByArgsSchema: z.ZodType<Prisma.UserInviteCodeGroupByArgs> = z.object({
  where: UserInviteCodeWhereInputSchema.optional(),
  orderBy: z.union([ UserInviteCodeOrderByWithAggregationInputSchema.array(),UserInviteCodeOrderByWithAggregationInputSchema ]).optional(),
  by: UserInviteCodeScalarFieldEnumSchema.array(),
  having: UserInviteCodeScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserInviteCodeFindUniqueArgsSchema: z.ZodType<Prisma.UserInviteCodeFindUniqueArgs> = z.object({
  select: UserInviteCodeSelectSchema.optional(),
  include: UserInviteCodeIncludeSchema.optional(),
  where: UserInviteCodeWhereUniqueInputSchema,
}).strict() ;

export const UserInviteCodeFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserInviteCodeFindUniqueOrThrowArgs> = z.object({
  select: UserInviteCodeSelectSchema.optional(),
  include: UserInviteCodeIncludeSchema.optional(),
  where: UserInviteCodeWhereUniqueInputSchema,
}).strict() ;

export const UserAncestorFindFirstArgsSchema: z.ZodType<Prisma.UserAncestorFindFirstArgs> = z.object({
  select: UserAncestorSelectSchema.optional(),
  include: UserAncestorIncludeSchema.optional(),
  where: UserAncestorWhereInputSchema.optional(),
  orderBy: z.union([ UserAncestorOrderByWithRelationInputSchema.array(),UserAncestorOrderByWithRelationInputSchema ]).optional(),
  cursor: UserAncestorWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserAncestorScalarFieldEnumSchema,UserAncestorScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserAncestorFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserAncestorFindFirstOrThrowArgs> = z.object({
  select: UserAncestorSelectSchema.optional(),
  include: UserAncestorIncludeSchema.optional(),
  where: UserAncestorWhereInputSchema.optional(),
  orderBy: z.union([ UserAncestorOrderByWithRelationInputSchema.array(),UserAncestorOrderByWithRelationInputSchema ]).optional(),
  cursor: UserAncestorWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserAncestorScalarFieldEnumSchema,UserAncestorScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserAncestorFindManyArgsSchema: z.ZodType<Prisma.UserAncestorFindManyArgs> = z.object({
  select: UserAncestorSelectSchema.optional(),
  include: UserAncestorIncludeSchema.optional(),
  where: UserAncestorWhereInputSchema.optional(),
  orderBy: z.union([ UserAncestorOrderByWithRelationInputSchema.array(),UserAncestorOrderByWithRelationInputSchema ]).optional(),
  cursor: UserAncestorWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserAncestorScalarFieldEnumSchema,UserAncestorScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserAncestorAggregateArgsSchema: z.ZodType<Prisma.UserAncestorAggregateArgs> = z.object({
  where: UserAncestorWhereInputSchema.optional(),
  orderBy: z.union([ UserAncestorOrderByWithRelationInputSchema.array(),UserAncestorOrderByWithRelationInputSchema ]).optional(),
  cursor: UserAncestorWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserAncestorGroupByArgsSchema: z.ZodType<Prisma.UserAncestorGroupByArgs> = z.object({
  where: UserAncestorWhereInputSchema.optional(),
  orderBy: z.union([ UserAncestorOrderByWithAggregationInputSchema.array(),UserAncestorOrderByWithAggregationInputSchema ]).optional(),
  by: UserAncestorScalarFieldEnumSchema.array(),
  having: UserAncestorScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserAncestorFindUniqueArgsSchema: z.ZodType<Prisma.UserAncestorFindUniqueArgs> = z.object({
  select: UserAncestorSelectSchema.optional(),
  include: UserAncestorIncludeSchema.optional(),
  where: UserAncestorWhereUniqueInputSchema,
}).strict() ;

export const UserAncestorFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserAncestorFindUniqueOrThrowArgs> = z.object({
  select: UserAncestorSelectSchema.optional(),
  include: UserAncestorIncludeSchema.optional(),
  where: UserAncestorWhereUniqueInputSchema,
}).strict() ;

export const OrderFindFirstArgsSchema: z.ZodType<Prisma.OrderFindFirstArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereInputSchema.optional(),
  orderBy: z.union([ OrderOrderByWithRelationInputSchema.array(),OrderOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderScalarFieldEnumSchema,OrderScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const OrderFindFirstOrThrowArgsSchema: z.ZodType<Prisma.OrderFindFirstOrThrowArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereInputSchema.optional(),
  orderBy: z.union([ OrderOrderByWithRelationInputSchema.array(),OrderOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderScalarFieldEnumSchema,OrderScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const OrderFindManyArgsSchema: z.ZodType<Prisma.OrderFindManyArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereInputSchema.optional(),
  orderBy: z.union([ OrderOrderByWithRelationInputSchema.array(),OrderOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderScalarFieldEnumSchema,OrderScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const OrderAggregateArgsSchema: z.ZodType<Prisma.OrderAggregateArgs> = z.object({
  where: OrderWhereInputSchema.optional(),
  orderBy: z.union([ OrderOrderByWithRelationInputSchema.array(),OrderOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const OrderGroupByArgsSchema: z.ZodType<Prisma.OrderGroupByArgs> = z.object({
  where: OrderWhereInputSchema.optional(),
  orderBy: z.union([ OrderOrderByWithAggregationInputSchema.array(),OrderOrderByWithAggregationInputSchema ]).optional(),
  by: OrderScalarFieldEnumSchema.array(),
  having: OrderScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const OrderFindUniqueArgsSchema: z.ZodType<Prisma.OrderFindUniqueArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereUniqueInputSchema,
}).strict() ;

export const OrderFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.OrderFindUniqueOrThrowArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereUniqueInputSchema,
}).strict() ;

export const UserOrderFindFirstArgsSchema: z.ZodType<Prisma.UserOrderFindFirstArgs> = z.object({
  select: UserOrderSelectSchema.optional(),
  include: UserOrderIncludeSchema.optional(),
  where: UserOrderWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderOrderByWithRelationInputSchema.array(),UserOrderOrderByWithRelationInputSchema ]).optional(),
  cursor: UserOrderWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserOrderScalarFieldEnumSchema,UserOrderScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserOrderFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserOrderFindFirstOrThrowArgs> = z.object({
  select: UserOrderSelectSchema.optional(),
  include: UserOrderIncludeSchema.optional(),
  where: UserOrderWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderOrderByWithRelationInputSchema.array(),UserOrderOrderByWithRelationInputSchema ]).optional(),
  cursor: UserOrderWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserOrderScalarFieldEnumSchema,UserOrderScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserOrderFindManyArgsSchema: z.ZodType<Prisma.UserOrderFindManyArgs> = z.object({
  select: UserOrderSelectSchema.optional(),
  include: UserOrderIncludeSchema.optional(),
  where: UserOrderWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderOrderByWithRelationInputSchema.array(),UserOrderOrderByWithRelationInputSchema ]).optional(),
  cursor: UserOrderWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserOrderScalarFieldEnumSchema,UserOrderScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserOrderAggregateArgsSchema: z.ZodType<Prisma.UserOrderAggregateArgs> = z.object({
  where: UserOrderWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderOrderByWithRelationInputSchema.array(),UserOrderOrderByWithRelationInputSchema ]).optional(),
  cursor: UserOrderWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserOrderGroupByArgsSchema: z.ZodType<Prisma.UserOrderGroupByArgs> = z.object({
  where: UserOrderWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderOrderByWithAggregationInputSchema.array(),UserOrderOrderByWithAggregationInputSchema ]).optional(),
  by: UserOrderScalarFieldEnumSchema.array(),
  having: UserOrderScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserOrderFindUniqueArgsSchema: z.ZodType<Prisma.UserOrderFindUniqueArgs> = z.object({
  select: UserOrderSelectSchema.optional(),
  include: UserOrderIncludeSchema.optional(),
  where: UserOrderWhereUniqueInputSchema,
}).strict() ;

export const UserOrderFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserOrderFindUniqueOrThrowArgs> = z.object({
  select: UserOrderSelectSchema.optional(),
  include: UserOrderIncludeSchema.optional(),
  where: UserOrderWhereUniqueInputSchema,
}).strict() ;

export const OrderStatusHistoryFindFirstArgsSchema: z.ZodType<Prisma.OrderStatusHistoryFindFirstArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereInputSchema.optional(),
  orderBy: z.union([ OrderStatusHistoryOrderByWithRelationInputSchema.array(),OrderStatusHistoryOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderStatusHistoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderStatusHistoryScalarFieldEnumSchema,OrderStatusHistoryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const OrderStatusHistoryFindFirstOrThrowArgsSchema: z.ZodType<Prisma.OrderStatusHistoryFindFirstOrThrowArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereInputSchema.optional(),
  orderBy: z.union([ OrderStatusHistoryOrderByWithRelationInputSchema.array(),OrderStatusHistoryOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderStatusHistoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderStatusHistoryScalarFieldEnumSchema,OrderStatusHistoryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const OrderStatusHistoryFindManyArgsSchema: z.ZodType<Prisma.OrderStatusHistoryFindManyArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereInputSchema.optional(),
  orderBy: z.union([ OrderStatusHistoryOrderByWithRelationInputSchema.array(),OrderStatusHistoryOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderStatusHistoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderStatusHistoryScalarFieldEnumSchema,OrderStatusHistoryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const OrderStatusHistoryAggregateArgsSchema: z.ZodType<Prisma.OrderStatusHistoryAggregateArgs> = z.object({
  where: OrderStatusHistoryWhereInputSchema.optional(),
  orderBy: z.union([ OrderStatusHistoryOrderByWithRelationInputSchema.array(),OrderStatusHistoryOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderStatusHistoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const OrderStatusHistoryGroupByArgsSchema: z.ZodType<Prisma.OrderStatusHistoryGroupByArgs> = z.object({
  where: OrderStatusHistoryWhereInputSchema.optional(),
  orderBy: z.union([ OrderStatusHistoryOrderByWithAggregationInputSchema.array(),OrderStatusHistoryOrderByWithAggregationInputSchema ]).optional(),
  by: OrderStatusHistoryScalarFieldEnumSchema.array(),
  having: OrderStatusHistoryScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const OrderStatusHistoryFindUniqueArgsSchema: z.ZodType<Prisma.OrderStatusHistoryFindUniqueArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereUniqueInputSchema,
}).strict() ;

export const OrderStatusHistoryFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.OrderStatusHistoryFindUniqueOrThrowArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereUniqueInputSchema,
}).strict() ;

export const ProductFindFirstArgsSchema: z.ZodType<Prisma.ProductFindFirstArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereInputSchema.optional(),
  orderBy: z.union([ ProductOrderByWithRelationInputSchema.array(),ProductOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductScalarFieldEnumSchema,ProductScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProductFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ProductFindFirstOrThrowArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereInputSchema.optional(),
  orderBy: z.union([ ProductOrderByWithRelationInputSchema.array(),ProductOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductScalarFieldEnumSchema,ProductScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProductFindManyArgsSchema: z.ZodType<Prisma.ProductFindManyArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereInputSchema.optional(),
  orderBy: z.union([ ProductOrderByWithRelationInputSchema.array(),ProductOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductScalarFieldEnumSchema,ProductScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ProductAggregateArgsSchema: z.ZodType<Prisma.ProductAggregateArgs> = z.object({
  where: ProductWhereInputSchema.optional(),
  orderBy: z.union([ ProductOrderByWithRelationInputSchema.array(),ProductOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ProductGroupByArgsSchema: z.ZodType<Prisma.ProductGroupByArgs> = z.object({
  where: ProductWhereInputSchema.optional(),
  orderBy: z.union([ ProductOrderByWithAggregationInputSchema.array(),ProductOrderByWithAggregationInputSchema ]).optional(),
  by: ProductScalarFieldEnumSchema.array(),
  having: ProductScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ProductFindUniqueArgsSchema: z.ZodType<Prisma.ProductFindUniqueArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereUniqueInputSchema,
}).strict() ;

export const ProductFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ProductFindUniqueOrThrowArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereUniqueInputSchema,
}).strict() ;

export const TelegramMessageSessionFindFirstArgsSchema: z.ZodType<Prisma.TelegramMessageSessionFindFirstArgs> = z.object({
  select: TelegramMessageSessionSelectSchema.optional(),
  where: TelegramMessageSessionWhereInputSchema.optional(),
  orderBy: z.union([ TelegramMessageSessionOrderByWithRelationInputSchema.array(),TelegramMessageSessionOrderByWithRelationInputSchema ]).optional(),
  cursor: TelegramMessageSessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TelegramMessageSessionScalarFieldEnumSchema,TelegramMessageSessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TelegramMessageSessionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TelegramMessageSessionFindFirstOrThrowArgs> = z.object({
  select: TelegramMessageSessionSelectSchema.optional(),
  where: TelegramMessageSessionWhereInputSchema.optional(),
  orderBy: z.union([ TelegramMessageSessionOrderByWithRelationInputSchema.array(),TelegramMessageSessionOrderByWithRelationInputSchema ]).optional(),
  cursor: TelegramMessageSessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TelegramMessageSessionScalarFieldEnumSchema,TelegramMessageSessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TelegramMessageSessionFindManyArgsSchema: z.ZodType<Prisma.TelegramMessageSessionFindManyArgs> = z.object({
  select: TelegramMessageSessionSelectSchema.optional(),
  where: TelegramMessageSessionWhereInputSchema.optional(),
  orderBy: z.union([ TelegramMessageSessionOrderByWithRelationInputSchema.array(),TelegramMessageSessionOrderByWithRelationInputSchema ]).optional(),
  cursor: TelegramMessageSessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TelegramMessageSessionScalarFieldEnumSchema,TelegramMessageSessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TelegramMessageSessionAggregateArgsSchema: z.ZodType<Prisma.TelegramMessageSessionAggregateArgs> = z.object({
  where: TelegramMessageSessionWhereInputSchema.optional(),
  orderBy: z.union([ TelegramMessageSessionOrderByWithRelationInputSchema.array(),TelegramMessageSessionOrderByWithRelationInputSchema ]).optional(),
  cursor: TelegramMessageSessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TelegramMessageSessionGroupByArgsSchema: z.ZodType<Prisma.TelegramMessageSessionGroupByArgs> = z.object({
  where: TelegramMessageSessionWhereInputSchema.optional(),
  orderBy: z.union([ TelegramMessageSessionOrderByWithAggregationInputSchema.array(),TelegramMessageSessionOrderByWithAggregationInputSchema ]).optional(),
  by: TelegramMessageSessionScalarFieldEnumSchema.array(),
  having: TelegramMessageSessionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TelegramMessageSessionFindUniqueArgsSchema: z.ZodType<Prisma.TelegramMessageSessionFindUniqueArgs> = z.object({
  select: TelegramMessageSessionSelectSchema.optional(),
  where: TelegramMessageSessionWhereUniqueInputSchema,
}).strict() ;

export const TelegramMessageSessionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TelegramMessageSessionFindUniqueOrThrowArgs> = z.object({
  select: TelegramMessageSessionSelectSchema.optional(),
  where: TelegramMessageSessionWhereUniqueInputSchema,
}).strict() ;

export const UserAnalysisResultFindFirstArgsSchema: z.ZodType<Prisma.UserAnalysisResultFindFirstArgs> = z.object({
  select: UserAnalysisResultSelectSchema.optional(),
  include: UserAnalysisResultIncludeSchema.optional(),
  where: UserAnalysisResultWhereInputSchema.optional(),
  orderBy: z.union([ UserAnalysisResultOrderByWithRelationInputSchema.array(),UserAnalysisResultOrderByWithRelationInputSchema ]).optional(),
  cursor: UserAnalysisResultWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserAnalysisResultScalarFieldEnumSchema,UserAnalysisResultScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserAnalysisResultFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserAnalysisResultFindFirstOrThrowArgs> = z.object({
  select: UserAnalysisResultSelectSchema.optional(),
  include: UserAnalysisResultIncludeSchema.optional(),
  where: UserAnalysisResultWhereInputSchema.optional(),
  orderBy: z.union([ UserAnalysisResultOrderByWithRelationInputSchema.array(),UserAnalysisResultOrderByWithRelationInputSchema ]).optional(),
  cursor: UserAnalysisResultWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserAnalysisResultScalarFieldEnumSchema,UserAnalysisResultScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserAnalysisResultFindManyArgsSchema: z.ZodType<Prisma.UserAnalysisResultFindManyArgs> = z.object({
  select: UserAnalysisResultSelectSchema.optional(),
  include: UserAnalysisResultIncludeSchema.optional(),
  where: UserAnalysisResultWhereInputSchema.optional(),
  orderBy: z.union([ UserAnalysisResultOrderByWithRelationInputSchema.array(),UserAnalysisResultOrderByWithRelationInputSchema ]).optional(),
  cursor: UserAnalysisResultWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserAnalysisResultScalarFieldEnumSchema,UserAnalysisResultScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserAnalysisResultAggregateArgsSchema: z.ZodType<Prisma.UserAnalysisResultAggregateArgs> = z.object({
  where: UserAnalysisResultWhereInputSchema.optional(),
  orderBy: z.union([ UserAnalysisResultOrderByWithRelationInputSchema.array(),UserAnalysisResultOrderByWithRelationInputSchema ]).optional(),
  cursor: UserAnalysisResultWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserAnalysisResultGroupByArgsSchema: z.ZodType<Prisma.UserAnalysisResultGroupByArgs> = z.object({
  where: UserAnalysisResultWhereInputSchema.optional(),
  orderBy: z.union([ UserAnalysisResultOrderByWithAggregationInputSchema.array(),UserAnalysisResultOrderByWithAggregationInputSchema ]).optional(),
  by: UserAnalysisResultScalarFieldEnumSchema.array(),
  having: UserAnalysisResultScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserAnalysisResultFindUniqueArgsSchema: z.ZodType<Prisma.UserAnalysisResultFindUniqueArgs> = z.object({
  select: UserAnalysisResultSelectSchema.optional(),
  include: UserAnalysisResultIncludeSchema.optional(),
  where: UserAnalysisResultWhereUniqueInputSchema,
}).strict() ;

export const UserAnalysisResultFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserAnalysisResultFindUniqueOrThrowArgs> = z.object({
  select: UserAnalysisResultSelectSchema.optional(),
  include: UserAnalysisResultIncludeSchema.optional(),
  where: UserAnalysisResultWhereUniqueInputSchema,
}).strict() ;

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
}).strict() ;

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
  create: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
}).strict() ;

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
}).strict() ;

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
}).strict() ;

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(),
}).strict() ;

export const UserInviteCodeCreateArgsSchema: z.ZodType<Prisma.UserInviteCodeCreateArgs> = z.object({
  select: UserInviteCodeSelectSchema.optional(),
  include: UserInviteCodeIncludeSchema.optional(),
  data: z.union([ UserInviteCodeCreateInputSchema,UserInviteCodeUncheckedCreateInputSchema ]),
}).strict() ;

export const UserInviteCodeUpsertArgsSchema: z.ZodType<Prisma.UserInviteCodeUpsertArgs> = z.object({
  select: UserInviteCodeSelectSchema.optional(),
  include: UserInviteCodeIncludeSchema.optional(),
  where: UserInviteCodeWhereUniqueInputSchema,
  create: z.union([ UserInviteCodeCreateInputSchema,UserInviteCodeUncheckedCreateInputSchema ]),
  update: z.union([ UserInviteCodeUpdateInputSchema,UserInviteCodeUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserInviteCodeCreateManyArgsSchema: z.ZodType<Prisma.UserInviteCodeCreateManyArgs> = z.object({
  data: z.union([ UserInviteCodeCreateManyInputSchema,UserInviteCodeCreateManyInputSchema.array() ]),
}).strict() ;

export const UserInviteCodeCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserInviteCodeCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserInviteCodeCreateManyInputSchema,UserInviteCodeCreateManyInputSchema.array() ]),
}).strict() ;

export const UserInviteCodeDeleteArgsSchema: z.ZodType<Prisma.UserInviteCodeDeleteArgs> = z.object({
  select: UserInviteCodeSelectSchema.optional(),
  include: UserInviteCodeIncludeSchema.optional(),
  where: UserInviteCodeWhereUniqueInputSchema,
}).strict() ;

export const UserInviteCodeUpdateArgsSchema: z.ZodType<Prisma.UserInviteCodeUpdateArgs> = z.object({
  select: UserInviteCodeSelectSchema.optional(),
  include: UserInviteCodeIncludeSchema.optional(),
  data: z.union([ UserInviteCodeUpdateInputSchema,UserInviteCodeUncheckedUpdateInputSchema ]),
  where: UserInviteCodeWhereUniqueInputSchema,
}).strict() ;

export const UserInviteCodeUpdateManyArgsSchema: z.ZodType<Prisma.UserInviteCodeUpdateManyArgs> = z.object({
  data: z.union([ UserInviteCodeUpdateManyMutationInputSchema,UserInviteCodeUncheckedUpdateManyInputSchema ]),
  where: UserInviteCodeWhereInputSchema.optional(),
}).strict() ;

export const UserInviteCodeDeleteManyArgsSchema: z.ZodType<Prisma.UserInviteCodeDeleteManyArgs> = z.object({
  where: UserInviteCodeWhereInputSchema.optional(),
}).strict() ;

export const UserAncestorCreateArgsSchema: z.ZodType<Prisma.UserAncestorCreateArgs> = z.object({
  select: UserAncestorSelectSchema.optional(),
  include: UserAncestorIncludeSchema.optional(),
  data: z.union([ UserAncestorCreateInputSchema,UserAncestorUncheckedCreateInputSchema ]),
}).strict() ;

export const UserAncestorUpsertArgsSchema: z.ZodType<Prisma.UserAncestorUpsertArgs> = z.object({
  select: UserAncestorSelectSchema.optional(),
  include: UserAncestorIncludeSchema.optional(),
  where: UserAncestorWhereUniqueInputSchema,
  create: z.union([ UserAncestorCreateInputSchema,UserAncestorUncheckedCreateInputSchema ]),
  update: z.union([ UserAncestorUpdateInputSchema,UserAncestorUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserAncestorCreateManyArgsSchema: z.ZodType<Prisma.UserAncestorCreateManyArgs> = z.object({
  data: z.union([ UserAncestorCreateManyInputSchema,UserAncestorCreateManyInputSchema.array() ]),
}).strict() ;

export const UserAncestorCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserAncestorCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserAncestorCreateManyInputSchema,UserAncestorCreateManyInputSchema.array() ]),
}).strict() ;

export const UserAncestorDeleteArgsSchema: z.ZodType<Prisma.UserAncestorDeleteArgs> = z.object({
  select: UserAncestorSelectSchema.optional(),
  include: UserAncestorIncludeSchema.optional(),
  where: UserAncestorWhereUniqueInputSchema,
}).strict() ;

export const UserAncestorUpdateArgsSchema: z.ZodType<Prisma.UserAncestorUpdateArgs> = z.object({
  select: UserAncestorSelectSchema.optional(),
  include: UserAncestorIncludeSchema.optional(),
  data: z.union([ UserAncestorUpdateInputSchema,UserAncestorUncheckedUpdateInputSchema ]),
  where: UserAncestorWhereUniqueInputSchema,
}).strict() ;

export const UserAncestorUpdateManyArgsSchema: z.ZodType<Prisma.UserAncestorUpdateManyArgs> = z.object({
  data: z.union([ UserAncestorUpdateManyMutationInputSchema,UserAncestorUncheckedUpdateManyInputSchema ]),
  where: UserAncestorWhereInputSchema.optional(),
}).strict() ;

export const UserAncestorDeleteManyArgsSchema: z.ZodType<Prisma.UserAncestorDeleteManyArgs> = z.object({
  where: UserAncestorWhereInputSchema.optional(),
}).strict() ;

export const OrderCreateArgsSchema: z.ZodType<Prisma.OrderCreateArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  data: z.union([ OrderCreateInputSchema,OrderUncheckedCreateInputSchema ]),
}).strict() ;

export const OrderUpsertArgsSchema: z.ZodType<Prisma.OrderUpsertArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereUniqueInputSchema,
  create: z.union([ OrderCreateInputSchema,OrderUncheckedCreateInputSchema ]),
  update: z.union([ OrderUpdateInputSchema,OrderUncheckedUpdateInputSchema ]),
}).strict() ;

export const OrderCreateManyArgsSchema: z.ZodType<Prisma.OrderCreateManyArgs> = z.object({
  data: z.union([ OrderCreateManyInputSchema,OrderCreateManyInputSchema.array() ]),
}).strict() ;

export const OrderCreateManyAndReturnArgsSchema: z.ZodType<Prisma.OrderCreateManyAndReturnArgs> = z.object({
  data: z.union([ OrderCreateManyInputSchema,OrderCreateManyInputSchema.array() ]),
}).strict() ;

export const OrderDeleteArgsSchema: z.ZodType<Prisma.OrderDeleteArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereUniqueInputSchema,
}).strict() ;

export const OrderUpdateArgsSchema: z.ZodType<Prisma.OrderUpdateArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  data: z.union([ OrderUpdateInputSchema,OrderUncheckedUpdateInputSchema ]),
  where: OrderWhereUniqueInputSchema,
}).strict() ;

export const OrderUpdateManyArgsSchema: z.ZodType<Prisma.OrderUpdateManyArgs> = z.object({
  data: z.union([ OrderUpdateManyMutationInputSchema,OrderUncheckedUpdateManyInputSchema ]),
  where: OrderWhereInputSchema.optional(),
}).strict() ;

export const OrderDeleteManyArgsSchema: z.ZodType<Prisma.OrderDeleteManyArgs> = z.object({
  where: OrderWhereInputSchema.optional(),
}).strict() ;

export const UserOrderCreateArgsSchema: z.ZodType<Prisma.UserOrderCreateArgs> = z.object({
  select: UserOrderSelectSchema.optional(),
  include: UserOrderIncludeSchema.optional(),
  data: z.union([ UserOrderCreateInputSchema,UserOrderUncheckedCreateInputSchema ]),
}).strict() ;

export const UserOrderUpsertArgsSchema: z.ZodType<Prisma.UserOrderUpsertArgs> = z.object({
  select: UserOrderSelectSchema.optional(),
  include: UserOrderIncludeSchema.optional(),
  where: UserOrderWhereUniqueInputSchema,
  create: z.union([ UserOrderCreateInputSchema,UserOrderUncheckedCreateInputSchema ]),
  update: z.union([ UserOrderUpdateInputSchema,UserOrderUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserOrderCreateManyArgsSchema: z.ZodType<Prisma.UserOrderCreateManyArgs> = z.object({
  data: z.union([ UserOrderCreateManyInputSchema,UserOrderCreateManyInputSchema.array() ]),
}).strict() ;

export const UserOrderCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserOrderCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserOrderCreateManyInputSchema,UserOrderCreateManyInputSchema.array() ]),
}).strict() ;

export const UserOrderDeleteArgsSchema: z.ZodType<Prisma.UserOrderDeleteArgs> = z.object({
  select: UserOrderSelectSchema.optional(),
  include: UserOrderIncludeSchema.optional(),
  where: UserOrderWhereUniqueInputSchema,
}).strict() ;

export const UserOrderUpdateArgsSchema: z.ZodType<Prisma.UserOrderUpdateArgs> = z.object({
  select: UserOrderSelectSchema.optional(),
  include: UserOrderIncludeSchema.optional(),
  data: z.union([ UserOrderUpdateInputSchema,UserOrderUncheckedUpdateInputSchema ]),
  where: UserOrderWhereUniqueInputSchema,
}).strict() ;

export const UserOrderUpdateManyArgsSchema: z.ZodType<Prisma.UserOrderUpdateManyArgs> = z.object({
  data: z.union([ UserOrderUpdateManyMutationInputSchema,UserOrderUncheckedUpdateManyInputSchema ]),
  where: UserOrderWhereInputSchema.optional(),
}).strict() ;

export const UserOrderDeleteManyArgsSchema: z.ZodType<Prisma.UserOrderDeleteManyArgs> = z.object({
  where: UserOrderWhereInputSchema.optional(),
}).strict() ;

export const OrderStatusHistoryCreateArgsSchema: z.ZodType<Prisma.OrderStatusHistoryCreateArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  data: z.union([ OrderStatusHistoryCreateInputSchema,OrderStatusHistoryUncheckedCreateInputSchema ]),
}).strict() ;

export const OrderStatusHistoryUpsertArgsSchema: z.ZodType<Prisma.OrderStatusHistoryUpsertArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereUniqueInputSchema,
  create: z.union([ OrderStatusHistoryCreateInputSchema,OrderStatusHistoryUncheckedCreateInputSchema ]),
  update: z.union([ OrderStatusHistoryUpdateInputSchema,OrderStatusHistoryUncheckedUpdateInputSchema ]),
}).strict() ;

export const OrderStatusHistoryCreateManyArgsSchema: z.ZodType<Prisma.OrderStatusHistoryCreateManyArgs> = z.object({
  data: z.union([ OrderStatusHistoryCreateManyInputSchema,OrderStatusHistoryCreateManyInputSchema.array() ]),
}).strict() ;

export const OrderStatusHistoryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.OrderStatusHistoryCreateManyAndReturnArgs> = z.object({
  data: z.union([ OrderStatusHistoryCreateManyInputSchema,OrderStatusHistoryCreateManyInputSchema.array() ]),
}).strict() ;

export const OrderStatusHistoryDeleteArgsSchema: z.ZodType<Prisma.OrderStatusHistoryDeleteArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereUniqueInputSchema,
}).strict() ;

export const OrderStatusHistoryUpdateArgsSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  data: z.union([ OrderStatusHistoryUpdateInputSchema,OrderStatusHistoryUncheckedUpdateInputSchema ]),
  where: OrderStatusHistoryWhereUniqueInputSchema,
}).strict() ;

export const OrderStatusHistoryUpdateManyArgsSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateManyArgs> = z.object({
  data: z.union([ OrderStatusHistoryUpdateManyMutationInputSchema,OrderStatusHistoryUncheckedUpdateManyInputSchema ]),
  where: OrderStatusHistoryWhereInputSchema.optional(),
}).strict() ;

export const OrderStatusHistoryDeleteManyArgsSchema: z.ZodType<Prisma.OrderStatusHistoryDeleteManyArgs> = z.object({
  where: OrderStatusHistoryWhereInputSchema.optional(),
}).strict() ;

export const ProductCreateArgsSchema: z.ZodType<Prisma.ProductCreateArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  data: z.union([ ProductCreateInputSchema,ProductUncheckedCreateInputSchema ]),
}).strict() ;

export const ProductUpsertArgsSchema: z.ZodType<Prisma.ProductUpsertArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereUniqueInputSchema,
  create: z.union([ ProductCreateInputSchema,ProductUncheckedCreateInputSchema ]),
  update: z.union([ ProductUpdateInputSchema,ProductUncheckedUpdateInputSchema ]),
}).strict() ;

export const ProductCreateManyArgsSchema: z.ZodType<Prisma.ProductCreateManyArgs> = z.object({
  data: z.union([ ProductCreateManyInputSchema,ProductCreateManyInputSchema.array() ]),
}).strict() ;

export const ProductCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductCreateManyAndReturnArgs> = z.object({
  data: z.union([ ProductCreateManyInputSchema,ProductCreateManyInputSchema.array() ]),
}).strict() ;

export const ProductDeleteArgsSchema: z.ZodType<Prisma.ProductDeleteArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereUniqueInputSchema,
}).strict() ;

export const ProductUpdateArgsSchema: z.ZodType<Prisma.ProductUpdateArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  data: z.union([ ProductUpdateInputSchema,ProductUncheckedUpdateInputSchema ]),
  where: ProductWhereUniqueInputSchema,
}).strict() ;

export const ProductUpdateManyArgsSchema: z.ZodType<Prisma.ProductUpdateManyArgs> = z.object({
  data: z.union([ ProductUpdateManyMutationInputSchema,ProductUncheckedUpdateManyInputSchema ]),
  where: ProductWhereInputSchema.optional(),
}).strict() ;

export const ProductDeleteManyArgsSchema: z.ZodType<Prisma.ProductDeleteManyArgs> = z.object({
  where: ProductWhereInputSchema.optional(),
}).strict() ;

export const TelegramMessageSessionCreateArgsSchema: z.ZodType<Prisma.TelegramMessageSessionCreateArgs> = z.object({
  select: TelegramMessageSessionSelectSchema.optional(),
  data: z.union([ TelegramMessageSessionCreateInputSchema,TelegramMessageSessionUncheckedCreateInputSchema ]),
}).strict() ;

export const TelegramMessageSessionUpsertArgsSchema: z.ZodType<Prisma.TelegramMessageSessionUpsertArgs> = z.object({
  select: TelegramMessageSessionSelectSchema.optional(),
  where: TelegramMessageSessionWhereUniqueInputSchema,
  create: z.union([ TelegramMessageSessionCreateInputSchema,TelegramMessageSessionUncheckedCreateInputSchema ]),
  update: z.union([ TelegramMessageSessionUpdateInputSchema,TelegramMessageSessionUncheckedUpdateInputSchema ]),
}).strict() ;

export const TelegramMessageSessionCreateManyArgsSchema: z.ZodType<Prisma.TelegramMessageSessionCreateManyArgs> = z.object({
  data: z.union([ TelegramMessageSessionCreateManyInputSchema,TelegramMessageSessionCreateManyInputSchema.array() ]),
}).strict() ;

export const TelegramMessageSessionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.TelegramMessageSessionCreateManyAndReturnArgs> = z.object({
  data: z.union([ TelegramMessageSessionCreateManyInputSchema,TelegramMessageSessionCreateManyInputSchema.array() ]),
}).strict() ;

export const TelegramMessageSessionDeleteArgsSchema: z.ZodType<Prisma.TelegramMessageSessionDeleteArgs> = z.object({
  select: TelegramMessageSessionSelectSchema.optional(),
  where: TelegramMessageSessionWhereUniqueInputSchema,
}).strict() ;

export const TelegramMessageSessionUpdateArgsSchema: z.ZodType<Prisma.TelegramMessageSessionUpdateArgs> = z.object({
  select: TelegramMessageSessionSelectSchema.optional(),
  data: z.union([ TelegramMessageSessionUpdateInputSchema,TelegramMessageSessionUncheckedUpdateInputSchema ]),
  where: TelegramMessageSessionWhereUniqueInputSchema,
}).strict() ;

export const TelegramMessageSessionUpdateManyArgsSchema: z.ZodType<Prisma.TelegramMessageSessionUpdateManyArgs> = z.object({
  data: z.union([ TelegramMessageSessionUpdateManyMutationInputSchema,TelegramMessageSessionUncheckedUpdateManyInputSchema ]),
  where: TelegramMessageSessionWhereInputSchema.optional(),
}).strict() ;

export const TelegramMessageSessionDeleteManyArgsSchema: z.ZodType<Prisma.TelegramMessageSessionDeleteManyArgs> = z.object({
  where: TelegramMessageSessionWhereInputSchema.optional(),
}).strict() ;

export const UserAnalysisResultCreateArgsSchema: z.ZodType<Prisma.UserAnalysisResultCreateArgs> = z.object({
  select: UserAnalysisResultSelectSchema.optional(),
  include: UserAnalysisResultIncludeSchema.optional(),
  data: z.union([ UserAnalysisResultCreateInputSchema,UserAnalysisResultUncheckedCreateInputSchema ]),
}).strict() ;

export const UserAnalysisResultUpsertArgsSchema: z.ZodType<Prisma.UserAnalysisResultUpsertArgs> = z.object({
  select: UserAnalysisResultSelectSchema.optional(),
  include: UserAnalysisResultIncludeSchema.optional(),
  where: UserAnalysisResultWhereUniqueInputSchema,
  create: z.union([ UserAnalysisResultCreateInputSchema,UserAnalysisResultUncheckedCreateInputSchema ]),
  update: z.union([ UserAnalysisResultUpdateInputSchema,UserAnalysisResultUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserAnalysisResultCreateManyArgsSchema: z.ZodType<Prisma.UserAnalysisResultCreateManyArgs> = z.object({
  data: z.union([ UserAnalysisResultCreateManyInputSchema,UserAnalysisResultCreateManyInputSchema.array() ]),
}).strict() ;

export const UserAnalysisResultCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserAnalysisResultCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserAnalysisResultCreateManyInputSchema,UserAnalysisResultCreateManyInputSchema.array() ]),
}).strict() ;

export const UserAnalysisResultDeleteArgsSchema: z.ZodType<Prisma.UserAnalysisResultDeleteArgs> = z.object({
  select: UserAnalysisResultSelectSchema.optional(),
  include: UserAnalysisResultIncludeSchema.optional(),
  where: UserAnalysisResultWhereUniqueInputSchema,
}).strict() ;

export const UserAnalysisResultUpdateArgsSchema: z.ZodType<Prisma.UserAnalysisResultUpdateArgs> = z.object({
  select: UserAnalysisResultSelectSchema.optional(),
  include: UserAnalysisResultIncludeSchema.optional(),
  data: z.union([ UserAnalysisResultUpdateInputSchema,UserAnalysisResultUncheckedUpdateInputSchema ]),
  where: UserAnalysisResultWhereUniqueInputSchema,
}).strict() ;

export const UserAnalysisResultUpdateManyArgsSchema: z.ZodType<Prisma.UserAnalysisResultUpdateManyArgs> = z.object({
  data: z.union([ UserAnalysisResultUpdateManyMutationInputSchema,UserAnalysisResultUncheckedUpdateManyInputSchema ]),
  where: UserAnalysisResultWhereInputSchema.optional(),
}).strict() ;

export const UserAnalysisResultDeleteManyArgsSchema: z.ZodType<Prisma.UserAnalysisResultDeleteManyArgs> = z.object({
  where: UserAnalysisResultWhereInputSchema.optional(),
}).strict() ;