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

    const emailBody = emailPayload.content[0].value;

    const mailResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MailChannels-Sender": "no-reply@sar.vision"
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: "brian.skyberg@gmail.com" }]
          }
        ],
        from: {
          email: "no-reply@sar.vision",
          name: "SAR Vision"
        },
        subject: "New SAR Vision Operational Inquiry",
        content: [
          {
            type: "text/plain",
            value: emailBody
          }
        ]
      })
    });

    const responseText = await mailResponse.text();

    if (!mailResponse.ok) {
      console.log("MailChannels status:", mailResponse.status);
      console.log("MailChannels response:", responseText);
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
