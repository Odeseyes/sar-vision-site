export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (url.pathname !== '/api/inquiry') {
      return jsonResponse({ success: false, error: 'Not found' }, 404);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
    }

    const teamName = typeof payload.teamName === 'string' ? payload.teamName.trim() : '';
    const agency = typeof payload.agency === 'string' ? payload.agency.trim() : '';
    const location = typeof payload.location === 'string' ? payload.location.trim() : '';
    const contactEmail = typeof payload.contactEmail === 'string' ? payload.contactEmail.trim() : '';
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';

    if (!teamName || !contactEmail) {
      return jsonResponse({ success: false, error: 'teamName and contactEmail are required' }, 400);
    }

    if (!isValidEmail(contactEmail)) {
      return jsonResponse({ success: false, error: 'Invalid contactEmail format' }, 400);
    }

    const inquiryRecipient = env.INQUIRY_RECIPIENT || 'brian.skyberg@gmail.com';
    const senderEmail = env.SENDER_EMAIL || 'no-reply@sar.vision';

    const textBody = [
      'New SAR Vision Team Interest Submission',
      '',
      `Team Name: ${teamName}`,
      `Agency / Organization: ${agency || 'N/A'}`,
      `Location: ${location || 'N/A'}`,
      `Contact Email: ${contactEmail}`,
      '',
      'Message:',
      message || 'N/A'
    ].join('\n');

    const mailPayload = {
      personalizations: [{ to: [{ email: inquiryRecipient }] }],
      from: {
        email: senderEmail,
        name: 'SAR Vision Inquiry'
      },
      reply_to: {
        email: contactEmail,
        name: teamName
      },
      subject: 'SAR Vision Team Interest Submission',
      content: [{ type: 'text/plain', value: textBody }]
    };

    try {
      const mailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(mailPayload)
      });

      if (!mailResponse.ok) {
        const errorBody = await mailResponse.text();
        return jsonResponse(
          { success: false, error: 'Email dispatch failed', details: errorBody.slice(0, 300) },
          502
        );
      }

      return jsonResponse({ success: true, message: 'Inquiry submitted successfully' }, 200);
    } catch {
      return jsonResponse({ success: false, error: 'Unable to process inquiry' }, 500);
    }
  }
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      ...corsHeaders()
    }
  });
}
