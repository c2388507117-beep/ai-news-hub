export async function onRequest(context) {
  const { GITHUB_TOKEN } = context.env;
  if (!GITHUB_TOKEN) {
    return new Response('GITHUB_TOKEN not configured', { status: 500 });
  }

  const res = await fetch(
    'https://api.github.com/repos/c2388507117-beep/ai-news-hub/actions/workflows/fetch-and-deploy.yml/dispatches',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ai-news-hub-cf-function',
      },
      body: JSON.stringify({ ref: 'main' }),
    }
  );

  if (res.ok) {
    return new Response('OK', { status: 200 });
  }

  const text = await res.text();
  return new Response(text, { status: res.status });
}
