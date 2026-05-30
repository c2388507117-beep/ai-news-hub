// Basic Auth middleware for Cloudflare Pages
// Protects the entire site with a password

const SITE_USERNAME = 'tian';

export async function onRequest(context) {
  const { request, env } = context;

  // Password: env var takes precedence, fallback to hardcoded
  const SITE_PASSWORD = env.SITE_PASSWORD || '111';

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response('需要密码才能访问', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="AI News Hub", charset="UTF-8"',
        'Content-Type': 'text/plain; charset=UTF-8',
      },
    });
  }

  // Decode Base64 credentials
  let credentials;
  try {
    const base64 = authHeader.slice(6);
    const decoded = atob(base64);
    credentials = decoded.split(':');
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const [username, password] = credentials;

  if (username !== SITE_USERNAME || password !== SITE_PASSWORD) {
    return new Response('密码错误', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="AI News Hub", charset="UTF-8"',
        'Content-Type': 'text/plain; charset=UTF-8',
      },
    });
  }

  // Forward to the next handler (serve static files or API)
  return context.next();
}
