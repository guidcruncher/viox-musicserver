import { ILogObj, Logger } from "tslog"

const logger: Logger<ILogObj> = new Logger()

export function getLogger() {
  return logger
}
