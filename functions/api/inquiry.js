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

    const emailPayload = {
      personalizations: [
        {
          to: [{ email: "brian.skyberg@gmail.com" }],
          subject: "SAR Vision Operational Inquiry"
        }
      ],
      from: { email: "no-reply@sar.vision" },
      content: [
        {
          type: "text/plain",
          value: `
Team Name: ${teamName}
Agency: ${agency}
Location: ${location}
Contact Email: ${contactEmail}

Message:
${message}
          `
        }
      ]
    }

    await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailPayload)
    })

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
