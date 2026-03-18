import QRCode from "qrcode"

class QrService {
  async generatePng(url: string): Promise<Buffer> {
    return QRCode.toBuffer(url, {
      type: "png",
      margin: 2,
      scale: 6,
    })
  }
}

export const qrService = new QrService()
