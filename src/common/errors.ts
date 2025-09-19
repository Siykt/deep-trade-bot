export enum ApiErrorCode {
  // 通用错误
  NOT_FOUND = 1001, // 未找到
  INTERNAL_ERROR = 1002, // 内部错误
  UNAUTHORIZED = 1003, // 未授权
  FORBIDDEN = 1004, // 禁止访问
  INVALID_PARAMS = 1005, // 无效的参数

  // 用户相关错误
  USER_NOT_FOUND = 2001, // 用户不存在
  USER_BALANCE_NOT_ENOUGH = 2002, // 用户余额不足
  USER_INVALID_INVITE_CODE = 2003, // 无效的邀请码
  USER_INVITE_CODE_ALREADY_USED = 2004, // 邀请码已使用
  USER_INVALID_INVITE_RELATION = 2005, // 无效的邀请关系
  USER_INVALID_CODE = 2006, // 无效的邀请码

  // 订单相关错误
  ORDER_NOT_FOUND = 3001, // 订单不存在
  ORDER_MAX_COUNT_REACHED = 3002, // 订单数量达到上限
  ORDER_STATUS_INVALID = 3003, // 订单状态无效
  ORDER_ALREADY_RESOLVED = 3004, // 订单已解决

  // 外部服务相关错误
  EXTERNAL_SERVICE_ERROR = 5001, // 外部服务错误
}

export type ErrorCodeKeys = keyof typeof ApiErrorCode
export class ApiError extends Error {
  public codeMsg!: string
  constructor(public code: ApiErrorCode, msg?: string) {
    super(msg)
    const codeName = ApiErrorCode[code] as ErrorCodeKeys
    this.codeMsg = codeName
    this.message = msg ?? codeName
  }
}
