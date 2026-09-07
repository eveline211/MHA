export async function onRequestPost({ request, env }) {
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
