export async function onRequestPost(context) {
  try {
    const data = await context.request.json()

    const { teamName, agency, location, contactEmail, message } = data

    if (!teamName || !contactEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const sendResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: "brian.skyberg@gmail.com" }],
          },
        ],
        from: {
          email: "brian.skyberg@gmail.com",
          name: "SAR Vision Intake",
        },
        subject: `New SAR Vision Inquiry – ${teamName}`,
        content: [
          {
            type: "text/plain",
            value: `
Team Name: ${teamName}
Agency: ${agency || "N/A"}
Location: ${location || "N/A"}
Contact Email: ${contactEmail}

Message:
${message || "N/A"}
        `,
          },
        ],
      }),
    });

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.log("MailChannels error:", errorText);
      return new Response(
        JSON.stringify({ error: "Email delivery failed" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Submission failed." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
