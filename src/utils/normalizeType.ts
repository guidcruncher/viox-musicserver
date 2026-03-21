const normalizeType = (req, _reply, done) => {
  const t = req.query.type

  if (t !== undefined && !Array.isArray(t)) {
    req.query.type = [t]
  }

  done()
}
