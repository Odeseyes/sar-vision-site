export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    const { teamName, agency, location, contactEmail, message } = data;

    if (!teamName || !contactEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const email = contactEmail;

    const emailPayload = {
      personalizations: [
        {
          to: [{ email: "brian.skyberg@gmail.com" }]
        }
      ],
      from: {
        email: "no-reply@sar.vision",
        name: "SAR Vision Inquiry"
      },
      subject: "New SAR Vision Operational Inquiry",
      content: [
        {
          type: "text/plain",
          value:
`Team Name: ${teamName}
Agency: ${agency || ""}
Location: ${location || ""}
Contact Email: ${contactEmail}
Message:
${message || ""}`
        }
      ]
    };

    const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MailChannels-Sender": JSON.stringify({
          name: "SAR Vision",
          email: "no-reply@sar.vision"
        })
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: "brian.skyberg@gmail.com" }]
          }
        ],
        from: {
          name: "SAR Vision",
          email: "no-reply@sar.vision"
        },
        subject: `New SAR Vision Inquiry — ${teamName}`,
        content: [
          {
            type: "text/plain",
            value:
`Team: ${teamName}
Agency: ${agency}
Location: ${location}
Email: ${email}

Message:
${message}`
          }
        ]
      })
    });

    const responseText = await response.text();
    console.log("MailChannels status:", response.status);
    console.log("MailChannels response:", responseText);

    if (!response.ok) {
      throw new Error("Mail send failed");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.log("Function crash:", err);

    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
