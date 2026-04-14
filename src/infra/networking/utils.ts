import http from "http"
import https from "https"

export const getHttpClient = (url: string) => (url.startsWith("https") ? https : http)
