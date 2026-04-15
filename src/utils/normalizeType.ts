export const normalizeType = (req: any, _reply: any, done: any) => {
  const t = req.query.type

  if (t !== undefined && !Array.isArray(t)) {
    req.query.type = [t]
  }

  done()
}
