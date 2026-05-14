const TELEGRAM_API_BASE = 'https://api.telegram.org';

function getTelegramConfig() {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_GROUP_CHAT_ID || process.env.TELEGRAM_CHAT_ID,
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendTelegramMessage(text) {
  const { botToken, chatId } = getTelegramConfig();

  if (!botToken || !chatId) {
    console.warn('Telegram notification skipped: missing TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_CHAT_ID/TELEGRAM_CHAT_ID');
    return { skipped: true };
  }

  const res = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram sendMessage failed (${res.status}): ${body}`);
  }

  return res.json();
}


export function buildRequestAssignedMessage({ requestCode, assignedByName, assignedToName }) {
  const url =  `http://dashboard.bokinworld.com/requests`;

  const lines = [
    '📋 <b>YÊU CẦU VỪA ĐƯỢC PHÂN CÔNG</b>',
    '──────────────────────────',
    `🔖 Mã yêu cầu:   <a href="${url}">${escapeHtml(requestCode || 'Không rõ')}</a>`,
    `👤 Người giao:   <b>${escapeHtml(assignedByName || 'Không rõ')}</b>`,
  ];

  if (assignedToName) {
    lines.push(`🙋 Người nhận:   <b>${escapeHtml(assignedToName)}</b>`);
  }

  lines.push('──────────────────────────');

  return lines.join('\n');
}

export async function notifyRequestAssigned(payload) {
  return sendTelegramMessage(buildRequestAssignedMessage(payload));
}
