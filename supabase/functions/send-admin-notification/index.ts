import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  eventTitle: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  registrationId: string;
  tierName?: string;
}

const ADMIN_EMAIL = "gamesandconnectgh@gmail.com";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      eventTitle,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      quantity,
      totalAmount,
      currency,
      paymentStatus,
      registrationId,
      tierName,
    }: AdminNotificationRequest = await req.json();

    console.log("Sending admin notification for registration:", registrationId);

    const statusEmoji = paymentStatus === 'completed' ? '✅' : paymentStatus === 'pending' ? '⏳' : '❌';
    const statusText = paymentStatus === 'completed' ? 'Completed' : paymentStatus === 'pending' ? 'Pending' : 'Failed';

    const emailResponse = await resend.emails.send({
      from: "Games & Connect <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `${statusEmoji} New Registration: ${eventTitle} - ${attendeeName}`,
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
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎫 New Registration Alert</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <div style="background-color: ${paymentStatus === 'completed' ? '#dcfce7' : paymentStatus === 'pending' ? '#fef3c7' : '#fee2e2'}; border-radius: 8px; padding: 15px; margin-bottom: 25px; text-align: center;">
                <span style="font-size: 24px;">${statusEmoji}</span>
                <p style="margin: 5px 0 0 0; font-weight: 600; color: ${paymentStatus === 'completed' ? '#166534' : paymentStatus === 'pending' ? '#92400e' : '#991b1b'};">
                  Payment ${statusText}
                </p>
              </div>
              
              <!-- Event Info -->
              <div style="margin-bottom: 25px;">
                <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 18px;">📅 Event</h2>
                <p style="color: #334155; margin: 0; font-size: 16px; font-weight: 600;">${eventTitle}</p>
                ${tierName ? `<p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Ticket Type: ${tierName}</p>` : ''}
              </div>
              
              <!-- Attendee Details -->
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">👤 Attendee Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%;">Name</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${attendeeName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">
                      <a href="mailto:${attendeeEmail}" style="color: #2563eb; text-decoration: none;">${attendeeEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Phone</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${attendeePhone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Tickets</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${quantity}</td>
                  </tr>
                  <tr style="border-top: 1px solid #e2e8f0;">
                    <td style="padding: 12px 0 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Amount</td>
                    <td style="padding: 12px 0 8px 0; color: #16a34a; font-size: 20px; font-weight: 700;">${currency} ${totalAmount.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
              
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                Registration ID: <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${registrationId}</code>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                This is an automated notification from Games & Connect
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Admin notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending admin notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send notification";
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
