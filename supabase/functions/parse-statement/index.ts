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

    const { fileData, fileType, bankType, userId } = await req.json();
    
    if (!fileData) {
      throw new Error('No file data provided');
    }

    console.log(`Parsing ${fileType} statement for user:`, userId, 'Bank type:', bankType);

    const model = fileType.startsWith('image/') || fileType === 'application/pdf' 
      ? 'gemini-2.0-flash-exp' 
      : 'gemini-2.0-flash-exp ';

    const prompt = `Parse this bank statement (${fileType}) and return standardized transaction objects as a JSON array. The currency is NGN.

Return format:
[
  {
    "date": "YYYY-MM-DD",
    "description": "merchant/payee name",
    "amount": number (negative for debits, positive for credits),
    "balance": number (if available),
    "category": "suggested category (e.g., Food, Transport, Salary, Bills)",
    "transaction_type": "debit" or "credit"
  }
]

Handle various bank formats. Be precise with amounts and dates. Convert all dates to YYYY-MM-DD format.
Categorize transactions based on descriptions.
Return only the JSON array, no additional text.`;

    const requestBody: any = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        response_mime_type: "application/json",
      }
    };

    if (model === 'gemini-pro-vision') {
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: fileType,
          data: fileData.split(',')[1]
        }
      });
      // Vision model doesn't support JSON response type, so remove it
      delete requestBody.generationConfig.response_mime_type;
    } else {
      // For text-based files, add the content
      const fileContent = atob(fileData.split(',')[1]);
      requestBody.contents[0].parts[0].text += `\n\nFile Content:\n${fileContent}`;
    }

    // Use Gemini to parse and standardize bank statement data
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Gemini response received');

    const extractedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!extractedText) {
      throw new Error('No content returned from Gemini API');
    }

    let transactions;
    try {
      transactions = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError, 'Raw text:', extractedText);
      // Fallback for non-json response from vision model
      const jsonMatch = extractedText.match(/\n[\s\S]*\]/);
      if (jsonMatch) {
        transactions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse transaction data');
      }
    }

    if (!Array.isArray(transactions)) {
      throw new Error('Parsed data is not an array of transactions');
    }

    const transactionsToInsert = transactions.map((tx: any) => ({
      user_id: userId,
      date: tx.date || new Date().toISOString().split('T')[0],
      description: tx.description || 'Unknown Transaction',
      amount: parseFloat(tx.amount) || 0,
      balance: tx.balance ? parseFloat(tx.balance) : null,
      category: tx.category || 'Other',
      transaction_type: tx.transaction_type || (parseFloat(tx.amount) < 0 ? 'debit' : 'credit'),
      bank_type: bankType || 'unknown'
    }));

    console.log(`Inserting ${transactionsToInsert.length} transactions`);

    const { data: dbData, error: dbError } = await supabase
      .from('transactions')
      .insert(transactionsToInsert)
      .select();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      throw new Error(dbError.message || 'Failed to save transactions to database');
    }

    console.log(`Successfully inserted ${dbData.length} transactions.`);

    return new Response(JSON.stringify({ transactions: dbData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error parsing statement:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to parse statement',
        details: error.stack 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
