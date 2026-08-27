module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.GITHUB_TOKEN || '';
  const adminPassword = process.env.ADMIN_PASSWORD || '2370';

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }
    const password = body ? body.password : '';
    if (password && password === adminPassword) {
      return res.status(200).json({
        success: true,
        token: token,
        owner: 'namu2forest',
        repo: 'namu2forest'
      });
    } else {
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }
  }

  return res.status(200).json({
    owner: 'namu2forest',
    repo: 'namu2forest',
    hasToken: !!token
  });
};
