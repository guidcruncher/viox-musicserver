import { ILogObj, Logger } from "tslog"

const logger: Logger<ILogObj> = new Logger()

export const getLogger = (): Logger<ILogObj> => {
  return logger
}
