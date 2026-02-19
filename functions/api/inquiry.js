export async function onRequestPost(context) {
  try {
    const { env } = context;
    const data = await context.request.json();

    const { teamName, agency, location, contactEmail, message } = data;

    if (!teamName || !contactEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "SAR Vision <no-reply@sar.vision>",
        to: "brian.skyberg@gmail.com",
        subject: `SAR Vision Inquiry - ${teamName}`,
        reply_to: contactEmail,
        html: `
      <h2>New SAR Vision Inquiry</h2>
      <p><strong>Team:</strong> ${teamName}</p>
      <p><strong>Agency:</strong> ${agency}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Email:</strong> ${contactEmail}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
      })
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.log("Resend error:", errorText);
      throw new Error("Resend send failed");
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
