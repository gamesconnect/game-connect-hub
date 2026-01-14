import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import QRCode from "https://esm.sh/qrcode@1.5.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TicketEmailRequest {
  email: string;
  fullName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  quantity: number;
  registrationId: string;
  currency: string;
  totalAmount: number;
  tierName?: string;
}

async function generateTicketPDF(
  ticketCode: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string,
  attendeeName: string,
  ticketNumber: number,
  totalTickets: number,
  tierName?: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 300]);
  const { width, height } = page.getSize();

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Background gradient effect (purple theme)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: height,
    color: rgb(0.4, 0.3, 0.6),
  });

  // White content area
  page.drawRectangle({
    x: 15,
    y: 15,
    width: width - 30,
    height: height - 30,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.4, 0.3, 0.6),
    borderWidth: 2,
  });

  // Header bar
  page.drawRectangle({
    x: 15,
    y: height - 65,
    width: width - 30,
    height: 50,
    color: rgb(0.4, 0.3, 0.6),
  });

  // Event title in header
  page.drawText("🎫 EVENT TICKET", {
    x: 30,
    y: height - 48,
    size: 20,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  // Ticket number badge
  page.drawText(`${ticketNumber} of ${totalTickets}`, {
    x: width - 100,
    y: height - 48,
    size: 14,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  // Event details
  const leftMargin = 30;
  let yPos = height - 95;

  page.drawText(eventTitle, {
    x: leftMargin,
    y: yPos,
    size: 18,
    font: helveticaBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  yPos -= 25;
  page.drawText(`📅 ${eventDate}`, {
    x: leftMargin,
    y: yPos,
    size: 12,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  yPos -= 20;
  page.drawText(`📍 ${eventLocation}`, {
    x: leftMargin,
    y: yPos,
    size: 12,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  if (tierName) {
    yPos -= 20;
    page.drawText(`🎟️ ${tierName}`, {
      x: leftMargin,
      y: yPos,
      size: 12,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  yPos -= 30;
  page.drawText("Attendee:", {
    x: leftMargin,
    y: yPos,
    size: 10,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  yPos -= 18;
  page.drawText(attendeeName, {
    x: leftMargin,
    y: yPos,
    size: 14,
    font: helveticaBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Ticket code
  yPos -= 30;
  page.drawText("Ticket Code:", {
    x: leftMargin,
    y: yPos,
    size: 10,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  yPos -= 18;
  page.drawText(ticketCode, {
    x: leftMargin,
    y: yPos,
    size: 14,
    font: helveticaBold,
    color: rgb(0.4, 0.3, 0.6),
  });

  // Generate QR code as data URL
  const qrData = JSON.stringify({
    ticketCode,
    event: eventTitle,
    attendee: attendeeName,
  });

  try {
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 120,
      margin: 1,
      color: {
        dark: "#4B3D7A",
        light: "#FFFFFF",
      },
    });

    // Convert data URL to bytes
    const base64Data = qrDataUrl.split(",")[1];
    const qrImageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    // Draw QR code on the right side
    page.drawImage(qrImage, {
      x: width - 150,
      y: 40,
      width: 120,
      height: 120,
    });
  } catch (qrError) {
    console.error("Error generating QR code:", qrError);
    // Draw placeholder text if QR fails
    page.drawText("QR Code", {
      x: width - 130,
      y: 100,
      size: 12,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Footer text
  page.drawText("Present this ticket at the venue for entry", {
    x: leftMargin,
    y: 25,
    size: 9,
    font: helvetica,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
}

const handler = async (req: Request): Promise<Response> => {
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
      registrationId,
      currency,
      totalAmount,
      tierName,
    }: TicketEmailRequest = await req.json();

    console.log("Generating and sending tickets for:", { email, quantity, registrationId });

    // Generate individual tickets
    const attachments = [];
    for (let i = 1; i <= quantity; i++) {
      const ticketCode = `${registrationId.substring(0, 8).toUpperCase()}-${String(i).padStart(3, "0")}`;
      
      console.log(`Generating ticket ${i}/${quantity}: ${ticketCode}`);
      
      const pdfBytes = await generateTicketPDF(
        ticketCode,
        eventTitle,
        eventDate,
        eventLocation,
        fullName,
        i,
        quantity,
        tierName
      );

      // Convert to base64 for attachment
      const base64Pdf = btoa(String.fromCharCode(...pdfBytes));
      
      attachments.push({
        filename: `ticket-${ticketCode}.pdf`,
        content: base64Pdf,
      });
    }

    console.log(`Generated ${attachments.length} ticket PDFs, sending email...`);

    const emailResponse = await resend.emails.send({
      from: "Games & Connect <onboarding@resend.dev>",
      to: [email],
      subject: `Your Tickets for ${eventTitle}`,
      attachments: attachments,
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
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎫 Your Tickets Are Ready!</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
                Hello <strong>${fullName}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 30px;">
                Great news! Your tickets for <strong>${eventTitle}</strong> are attached to this email as PDF files.
              </p>
              
              <!-- Ticket Summary Card -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #667eea;">
                <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">📋 Ticket Summary</h2>
                
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
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Number of Tickets</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${quantity}</td>
                  </tr>
                  <tr style="border-top: 1px solid #ddd;">
                    <td style="padding: 12px 0 8px 0; color: #666; font-size: 14px; font-weight: 600;">Total Amount</td>
                    <td style="padding: 12px 0 8px 0; color: #667eea; font-size: 18px; font-weight: 700; text-align: right;">${currency} ${totalAmount.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Instructions -->
              <div style="background-color: #e8f4fd; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #0066cc; margin: 0 0 15px 0; font-size: 16px;">📱 How to Use Your Tickets</h3>
                <ol style="color: #555; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Download the attached PDF ticket(s)</li>
                  <li>Save them to your phone or print them out</li>
                  <li>Present the QR code at the venue for scanning</li>
                  <li>Each ticket has a unique code - one ticket per person</li>
                </ol>
              </div>
              
              <p style="font-size: 14px; color: #555; line-height: 1.6;">
                We look forward to seeing you at the event! 🎉
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

    console.log("Ticket emails sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending ticket emails:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send ticket emails";
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
