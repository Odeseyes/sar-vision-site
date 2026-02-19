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

    const mailResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailPayload)
    });

    if (!mailResponse.ok) {
      const errorText = await mailResponse.text();
      console.log("MailChannels error:", errorText);

      return new Response(
        JSON.stringify({ success: false, error: "Email send failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
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
