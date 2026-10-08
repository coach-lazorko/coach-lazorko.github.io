/**
 * Cloudflare Worker: приймає заявки з форми на сайті й надсилає їх у Telegram.
 *
 * Змінні (Cloudflare → Workers → цей worker → Settings → Variables and Secrets):
 *   TELEGRAM_BOT_TOKEN  токен бота від @BotFather                      (Secret)
 *   TELEGRAM_CHAT_ID    куди надсилати заявки; кілька — через кому     (Secret)
 *   ALLOWED_ORIGINS     адреса сайту, напр. https://name.github.io;
 *                       кілька — через кому. Порожньо = будь-який сайт  (Text)
 *
 * Відкрийте адресу worker у браузері, щоб перевірити налаштування.
 * Поки TELEGRAM_CHAT_ID не задано, сторінка показує chat ID тих, хто написав боту /start.
 */

const FIELDS = [
  ['name', '👤 Ім’я'],
  ['phone', '📞 Телефон'],
  ['group', '👥 Група'],
  ['gym', '📍 Зал'],
  ['contact_via', '💬 Як зв’язатися'],
  ['message', '📝 Коментар'],
];
const MAX_FIELD_LENGTH = 1000;

export default {
  async fetch(request, env) {
    const cors = corsFor(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: cors.allowed ? 204 : 403, headers: cors.headers });
    }
    if (request.method === 'GET') return statusPage(env);
    if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405, cors.headers);
    if (!cors.allowed) return json({ ok: false, error: 'Origin not allowed' }, 403, cors.headers);

    let data;
    try {
      const type = request.headers.get('Content-Type') || '';
      data = type.includes('application/json')
        ? await request.json()
        : Object.fromEntries(await request.formData());
    } catch {
      return json({ ok: false, error: 'Bad request' }, 400, cors.headers);
    }

    // Пастка для ботів: людина це приховане поле не бачить і не заповнює
    if (data._gotcha) return json({ ok: true }, 200, cors.headers);

    const field = (key) => String(data[key] ?? '').trim().slice(0, MAX_FIELD_LENGTH);
    if (!field('name') || field('phone').replace(/\D/g, '').length < 9) {
      return json({ ok: false, error: 'Name and phone are required' }, 422, cors.headers);
    }

    const chatIds = splitList(env.TELEGRAM_CHAT_ID);
    if (!env.TELEGRAM_BOT_TOKEN || chatIds.length === 0) {
      return json({ ok: false, error: 'Worker is not configured' }, 500, cors.headers);
    }

    const lines = ['<b>🥊 Нова заявка з сайту</b>', ''];
    for (const [key, label] of FIELDS) {
      const value = field(key);
      if (value) lines.push(`${label}: ${escapeHtml(value)}`);
    }

    const results = await Promise.all(chatIds.map((chatId) => telegram(env, 'sendMessage', {
      chat_id: chatId,
      text: lines.join('\n'),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    })));

    if (!results.some((r) => r.ok)) {
      console.error('Telegram error:', JSON.stringify(results));
      return json({ ok: false, error: 'Telegram error' }, 502, cors.headers);
    }
    return json({ ok: true }, 200, cors.headers);
  },
};

function corsFor(request, env) {
  const origin = request.headers.get('Origin');
  const allowList = splitList(env.ALLOWED_ORIGINS).map((o) => o.replace(/\/+$/, ''));
  const allowed = allowList.length === 0 || (origin !== null && allowList.includes(origin));
  const headers = { Vary: 'Origin' };
  if (allowed) {
    headers['Access-Control-Allow-Origin'] = allowList.length === 0 ? '*' : origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept';
  }
  return { allowed, headers };
}

async function statusPage(env) {
  const text = (body) => new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

  if (!env.TELEGRAM_BOT_TOKEN) {
    return text('❌ Не задано TELEGRAM_BOT_TOKEN.\nДодайте його в Settings → Variables and Secrets.');
  }
  if (splitList(env.TELEGRAM_CHAT_ID).length > 0) {
    const me = await telegram(env, 'getMe', {});
    return text(me.ok
      ? `✅ Форма працює. Заявки надсилає бот @${me.result.username}.`
      : `❌ Telegram не приймає токен: ${me.description || 'невідома помилка'}`);
  }

  // Режим налаштування: показуємо chat ID тих, хто написав боту
  const updates = await telegram(env, 'getUpdates', {});
  if (!updates.ok) return text(`❌ Telegram не приймає токен: ${updates.description || 'невідома помилка'}`);
  const chats = new Map();
  for (const u of updates.result) {
    const chat = (u.message || u.channel_post || u.my_chat_member || {}).chat;
    if (chat) chats.set(chat.id, chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(' ') || chat.username);
  }
  if (chats.size === 0) {
    return text('Майже готово! Напишіть боту в Telegram /start і оновіть цю сторінку.');
  }
  const list = [...chats].map(([id, name]) => `${id} — ${name}`).join('\n');
  return text(`Скопіюйте потрібний chat ID у змінну TELEGRAM_CHAT_ID:\n\n${list}`);
}

async function telegram(env, method, payload) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, description: String(err) };
  }
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function splitList(value) {
  return String(value || '').split(',').map((s) => s.trim()).filter(Boolean);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
