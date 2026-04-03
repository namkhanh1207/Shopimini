function requireAdmin(req, res, next) {
  if (!req.session.adminUserId) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }
  next();
}

module.exports = { requireAdmin };
