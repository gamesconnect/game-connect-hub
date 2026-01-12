import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationEmailRequest {
  email: string;
  fullName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  transactionId?: string;
  tierName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      fullName,
      eventTitle,
      eventDate,
      eventLocation,
      quantity,
      totalAmount,
      currency,
      transactionId,
      tierName,
    }: RegistrationEmailRequest = await req.json();

    console.log("Sending registration confirmation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Games & Connect <onboarding@resend.dev>",
      to: [email],
      subject: `Registration Confirmed: ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Registration Confirmed!</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
                Hello <strong>${fullName}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 30px;">
                Thank you for registering! Your payment has been confirmed and your spot is secured.
              </p>
              
              <!-- Event Details Card -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #667eea;">
                <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">📅 Event Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Event</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${eventTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Date</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${eventDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Location</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${eventLocation}</td>
                  </tr>
                  ${tierName ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Ticket Type</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${tierName}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Quantity</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${quantity} ticket(s)</td>
                  </tr>
                  <tr style="border-top: 1px solid #ddd;">
                    <td style="padding: 12px 0 8px 0; color: #666; font-size: 14px; font-weight: 600;">Total Paid</td>
                    <td style="padding: 12px 0 8px 0; color: #667eea; font-size: 18px; font-weight: 700; text-align: right;">${currency} ${totalAmount.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
              
              ${transactionId ? `
              <p style="font-size: 12px; color: #888; margin-bottom: 20px;">
                Transaction ID: <code style="background-color: #f0f0f0; padding: 2px 6px; border-radius: 4px;">${transactionId}</code>
              </p>
              ` : ''}
              
              <p style="font-size: 14px; color: #555; line-height: 1.6;">
                Please save this email for your records. We look forward to seeing you at the event!
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 14px; margin: 0 0 10px 0;">
                Games & Connect
              </p>
              <p style="color: #aaa; font-size: 12px; margin: 0;">
                If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending registration email:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
