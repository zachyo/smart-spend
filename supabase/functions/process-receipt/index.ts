import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  { global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` } } }
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const { fileData, fileType, userId } = await req.json();
    
    if (!fileData) {
      throw new Error('No file data provided');
    }

    console.log(`Processing ${fileType} for user:`, userId);

    // Use Gemini Vision API for receipt OCR
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Extract the following information from this receipt image or PDF and return it as a JSON object. The currency must be NGN.
{
  "merchant": "name of the business/store",
  "amount": "total amount as a number",
  "date": "date in YYYY-MM-DD format",
  "items": ["list of purchased items"],
  "category": "suggested category (Food, Transport, Office, Entertainment, etc.)",
  "currency": "NGN"
}

Be precise with the amount and date. If you can't find certain information, use null for that field. The currency is always NGN.`
              },
              {
                inline_data: {
                  mime_type: fileType, // e.g., "image/jpeg" or "application/pdf"
                  data: fileData.split(',')[1] // Remove data URI prefix
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Gemini response:', result);

    const extractedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!extractedText) {
      throw new Error('No content returned from Gemini API');
    }

    // Parse the JSON response from Gemini
    let receiptData;
    try {
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        receiptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Failed to parse receipt data');
    }

    // Validate and clean the data
    const processedData = {
      user_id: userId,
      merchant: receiptData.merchant || 'Unknown Merchant',
      amount: parseFloat(receiptData.amount) || 0,
      date: receiptData.date || new Date().toISOString().split('T')[0],
      items: Array.isArray(receiptData.items) ? receiptData.items : [],
      category: receiptData.category || 'Other',
      currency: 'NGN', // Always NGN
    };

    console.log('Processed receipt data:', processedData);

    // Save to Supabase
    const { data: dbData, error: dbError } = await supabase
      .from('receipts')
      .insert(processedData)
      .select()
      .single();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      throw new Error(dbError.message || 'Failed to save receipt to database');
    }

    console.log('Receipt saved to DB:', dbData);

    return new Response(JSON.stringify(dbData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing receipt:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process receipt',
        details: error.stack 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
