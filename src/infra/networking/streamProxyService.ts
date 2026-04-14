import http from "http"
import { PassThrough } from "stream"
import { URL } from "url"

import { logger } from "@/logger"

import { ProxyResult, ProxyService } from "./types/proxyService"
import { getHttpClient } from "./utils"

export class StreamProxyService implements ProxyService {
  constructor(
    private maxRedirects = 5,
    private bufferSizeMb = 5,
  ) {}

  async stream(remoteUrl: string): Promise<ProxyResult> {
    logger.debug("proxy.stream.start", { remoteUrl })

    const bufferStream = new PassThrough({
      highWaterMark: this.bufferSizeMb * 1024 * 1024,
    })

    let activeRequest: http.ClientRequest | null = null

    const fetch = (
      url: string,
      redirectsRemaining: number,
      resolve: (v: ProxyResult) => void,
      reject: (e: Error) => void,
    ) => {
      if (redirectsRemaining < 0) {
        return reject(new Error("Too many redirects"))
      }

      const client = getHttpClient(url)
      activeRequest = client.get(url, (res: any) => {
        const status = res.statusCode ?? 0

        if (status >= 300 && status < 400 && res.headers.location) {
          const nextUrl = new URL(res.headers.location, url).toString()
          res.resume()
          return fetch(nextUrl, redirectsRemaining - 1, resolve, reject)
        }

        if (status < 200 || status >= 300) {
          res.resume()
          return reject(new Error(`Upstream error: ${status}`))
        }

        const contentType = res.headers["content-type"] || "audio/mpeg"

        res.on("data", (chunk: any) => bufferStream.write(chunk))
        res.on("end", () => bufferStream.end())
        res.on("error", (err: any) => bufferStream.destroy(err))

        resolve({
          stream: bufferStream,
          contentType,
          abort: () => {
            bufferStream.destroy()
            activeRequest?.destroy()
          },
        })
      })

      if (activeRequest) {
        activeRequest.on("error", reject)
      }
    }

    return new Promise((resolve, reject) => {
      fetch(remoteUrl, this.maxRedirects, resolve, reject)
    })
  }
}
