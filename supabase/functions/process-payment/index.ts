import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DCM_API_URL = 'http://54.86.149.215/pay';

const NETWORK_CODES: Record<string, string> = {
  'mtn': '300591',
  'airteltigo': '300592',
  'telecel': '300594',
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

    const { 
      eventId, 
      fullName, 
      email, 
      phone, 
      quantity, 
      network,
      totalAmount,
      tierName,
    } = await req.json();

    console.log('Processing payment request:', { eventId, fullName, email, phone, quantity, network, totalAmount });

    // Validate required fields
    if (!eventId || !fullName || !email || !phone || !network || !totalAmount) {
      throw new Error('Missing required fields');
    }

    // Format phone number (ensure it starts with 233)
    let formattedPhone = phone.replace(/\s+/g, '').replace(/^0/, '');
    if (!formattedPhone.startsWith('233')) {
      formattedPhone = '233' + formattedPhone;
    }

    // Prepare DCM payment request
    const paymentPayload = {
      accountNumber: formattedPhone,
      amount: String(totalAmount),
      narration: `Event registration: ${fullName}`,
      network: network.toLowerCase(),
    };

    console.log('Sending payment request to DCM:', paymentPayload);

    // Call DCM API
    const paymentResponse = await fetch(DCM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    });

    const paymentResult = await paymentResponse.json();
    console.log('DCM API response:', paymentResult);

    // Check payment status based on DCM response structure
    // DCM returns success:true when request was received, but the actual payment status 
    // is in data.collection.message.status ("200" = initiated/pending, "000" = completed)
    const collectionStatus = paymentResult?.data?.collection?.message?.status;
    const isPaymentInitiated = paymentResponse.ok && paymentResult.success === true;
    const isPaymentCompleted = collectionStatus === '000';
    const isPaymentPending = collectionStatus === '200';

    // Get transaction ID from the collection data
    const transactionId = paymentResult?.data?.collection?.data?.transactionId || 
                          paymentResult?.collectionTransactionID || 
                          paymentResult?.paymentId;

    // Determine payment status for registration
    let paymentStatus = 'failed';
    if (isPaymentCompleted) {
      paymentStatus = 'completed';
    } else if (isPaymentInitiated || isPaymentPending) {
      paymentStatus = 'pending';
    }

    console.log('Payment status determined:', { paymentStatus, collectionStatus, isPaymentInitiated });

    // Create registration record
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .insert({
        event_id: eventId,
        full_name: fullName,
        email: email,
        phone: formattedPhone,
        quantity: quantity || 1,
        total_amount: totalAmount,
        payment_status: paymentStatus,
        stripe_payment_id: transactionId || null,
      })
      .select()
      .single();

    if (registrationError) {
      console.error('Error creating registration:', registrationError);
      throw new Error('Failed to create registration');
    }

    // Fetch event details for email
    const { data: eventData } = await supabase
      .from('events')
      .select('title, date, location, currency, spots')
      .eq('id', eventId)
      .single();

    // Update available spots for the event when payment is completed or pending (to reserve spots)
    if (paymentStatus === 'completed' || paymentStatus === 'pending') {
      if (eventData) {
        await supabase
          .from('events')
          .update({ spots: Math.max(0, eventData.spots - (quantity || 1)) })
          .eq('id', eventId);
      }
    }

    // Send confirmation email if payment is completed
    if (paymentStatus === 'completed' && eventData) {
      try {
        const emailPayload = {
          email: email,
          fullName: fullName,
          eventTitle: eventData.title,
          eventDate: eventData.date,
          eventLocation: eventData.location,
          quantity: quantity || 1,
          totalAmount: totalAmount,
          currency: eventData.currency || 'GHS',
          transactionId: transactionId,
          tierName: tierName,
        };

        console.log('Sending confirmation email:', emailPayload);

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
        // Don't fail the payment if email fails
      }
    }

    // Determine response message based on status
    let responseMessage = '';
    if (paymentStatus === 'completed') {
      responseMessage = 'Payment completed successfully! A confirmation email has been sent.';
    } else if (paymentStatus === 'pending') {
      responseMessage = 'Payment initiated! Please check your phone and approve the payment prompt. You will receive a confirmation email once payment is complete.';
    } else {
      responseMessage = 'Payment could not be processed. Please try again.';
    }

    return new Response(
      JSON.stringify({
        success: paymentStatus !== 'failed',
        paymentStatus: paymentStatus,
        registration: registration,
        paymentResult: paymentResult,
        message: responseMessage,
        transactionId: transactionId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
