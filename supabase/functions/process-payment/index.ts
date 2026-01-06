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
      totalAmount 
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

    // Check if payment was successful (adjust based on actual DCM response format)
    const paymentSuccessful = paymentResponse.ok && paymentResult.status !== 'failed';

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
        payment_status: paymentSuccessful ? 'completed' : 'pending',
        stripe_payment_id: paymentResult.transactionId || paymentResult.reference || null,
      })
      .select()
      .single();

    if (registrationError) {
      console.error('Error creating registration:', registrationError);
      throw new Error('Failed to create registration');
    }

    // Update available spots for the event
    if (paymentSuccessful) {
      // Get current spots and decrement
      const { data: eventData } = await supabase
        .from('events')
        .select('spots')
        .eq('id', eventId)
        .single();
      
      if (eventData) {
        await supabase
          .from('events')
          .update({ spots: Math.max(0, eventData.spots - (quantity || 1)) })
          .eq('id', eventId);
      }
    }

    return new Response(
      JSON.stringify({
        success: paymentSuccessful,
        registration: registration,
        paymentResult: paymentResult,
        message: paymentSuccessful 
          ? 'Payment processed successfully' 
          : 'Payment initiated - please complete on your phone',
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
