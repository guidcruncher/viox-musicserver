import axios from "axios"

import { logger } from "@/logger"

export const axiosFactory = (opts: any) => {
  const http = axios.create(opts)

  http.interceptors.response.use((response) => {
    logger.trace(`Response ${response.config.url} [${response.status}]`)
    return response
  })

  return http
}
