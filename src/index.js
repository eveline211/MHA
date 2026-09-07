export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/subscribe" && request.method === "POST") {
      return handleSubscribe(request, env);
    }

    // Everything else: serve the static site (index.html, images, etc.)
    return env.ASSETS.fetch(request);
  }
};

async function handleSubscribe(request, env) {
  try {
    const { email } = await request.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const key = email.toLowerCase().trim();
    const existing = await env.NEWSLETTER_KV.get(key);
    if (existing) {
      return new Response(JSON.stringify({ ok: true, alreadySubscribed: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    await env.NEWSLETTER_KV.put(key, JSON.stringify({
      email: key,
      subscribedAt: new Date().toISOString()
    }));

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
