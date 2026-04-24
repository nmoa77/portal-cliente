const jwt = require('jsonwebtoken');

const IS_PROD = process.env.NODE_ENV === 'production';

const SECRET = process.env.JWT_SECRET || (!IS_PROD && 'portal-cliente-dev-secret-change-in-production');
if (!SECRET) {
  throw new Error('JWT_SECRET é obrigatório em produção. Define a variável de ambiente.');
}

const COOKIE_NAME = 'portal_token';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    SECRET,
    { expiresIn: '7d' }
  );
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,                    // em produção HTTPS obrigatório
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
  });
}

function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Não autenticado' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Sessão inválida' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso apenas para administradores' });
    }
    next();
  });
}

module.exports = { signToken, setAuthCookie, clearAuthCookie, requireAuth, requireAdmin, COOKIE_NAME };
