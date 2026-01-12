import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log('DCM Webhook received:', JSON.stringify(payload, null, 2));

    // Extract transaction details from DCM callback
    // DCM typically sends: transactionId, status, amount, accountNumber, etc.
    const {
      transactionId,
      status,
      collectionTransactionID,
      message,
      data,
    } = payload;

    // Get the actual transaction ID (DCM may use different field names)
    const txnId = transactionId || collectionTransactionID || data?.transactionId || data?.collection?.data?.transactionId;
    
    // Determine payment status from DCM callback
    // DCM status codes: "000" = success/completed, "200" = pending, others = failed
    const dcmStatus = status || data?.collection?.message?.status || message?.status;
    
    let paymentStatus = 'pending';
    if (dcmStatus === '000' || dcmStatus === 'success' || dcmStatus === 'SUCCESSFUL') {
      paymentStatus = 'completed';
    } else if (dcmStatus === '200' || dcmStatus === 'pending' || dcmStatus === 'PENDING') {
      paymentStatus = 'pending';
    } else if (dcmStatus === 'failed' || dcmStatus === 'FAILED' || dcmStatus === '001') {
      paymentStatus = 'failed';
    }

    console.log('Parsed webhook data:', { txnId, dcmStatus, paymentStatus });

    if (!txnId) {
      console.error('No transaction ID found in webhook payload');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing transaction ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the registration by transaction ID (stored in stripe_payment_id field)
    const { data: registration, error: fetchError } = await supabase
      .from('registrations')
      .select('*, events(title, date, location, currency)')
      .eq('stripe_payment_id', txnId)
      .single();

    if (fetchError || !registration) {
      console.error('Registration not found for transaction:', txnId, fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Registration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found registration:', registration.id, 'Current status:', registration.payment_status);

    // Only update if status has changed
    if (registration.payment_status !== paymentStatus) {
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ payment_status: paymentStatus })
        .eq('id', registration.id);

      if (updateError) {
        console.error('Error updating registration:', updateError);
        throw new Error('Failed to update registration status');
      }

      console.log('Updated registration status to:', paymentStatus);

      // If payment just completed, send confirmation email
      if (paymentStatus === 'completed' && registration.payment_status !== 'completed') {
        try {
          const emailPayload = {
            email: registration.email,
            fullName: registration.full_name,
            eventTitle: registration.events?.title || 'Event',
            eventDate: registration.events?.date || '',
            eventLocation: registration.events?.location || '',
            quantity: registration.quantity,
            totalAmount: registration.total_amount,
            currency: registration.events?.currency || 'GHS',
            transactionId: txnId,
          };

          // Call the send-registration-email function
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-registration-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify(emailPayload),
          });

          const emailResult = await emailResponse.json();
          console.log('Email send result:', emailResult);
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }
      }

      // If payment failed after being pending, restore spots
      if (paymentStatus === 'failed' && registration.payment_status === 'pending') {
        const { data: eventData } = await supabase
          .from('events')
          .select('spots')
          .eq('id', registration.event_id)
          .single();

        if (eventData) {
          await supabase
            .from('events')
            .update({ spots: eventData.spots + registration.quantity })
            .eq('id', registration.event_id);
          
          console.log('Restored', registration.quantity, 'spots to event');
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        registrationId: registration.id,
        paymentStatus: paymentStatus,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing DCM webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Webhook processing failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
