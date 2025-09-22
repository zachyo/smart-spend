import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Calculate fuzzy string similarity using Levenshtein distance
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity score between 0 and 1
 */
function calculateSimilarity(str1: string, str2: string): number {
  const a = str1.toLowerCase().trim();
  const b = str2.toLowerCase().trim();
  
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  const distance = matrix[b.length][a.length];
  return 1 - distance / Math.max(a.length, b.length);
}

/**
 * Calculate date difference in days
 * @param date1 First date string (YYYY-MM-DD)
 * @param date2 Second date string (YYYY-MM-DD)
 * @returns Absolute difference in days
 */
function getDateDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if amounts are similar (exact match or close)
 * @param amount1 First amount
 * @param amount2 Second amount
 * @param tolerance Tolerance percentage (default 0.02 = 2%)
 * @returns True if amounts are similar
 */
function amountsMatch(amount1: number, amount2: number, tolerance = 0.02): boolean {
  const abs1 = Math.abs(amount1);
  const abs2 = Math.abs(amount2);
  
  if (abs1 === abs2) return true;
  
  const difference = Math.abs(abs1 - abs2);
  const average = (abs1 + abs2) / 2;
  
  return difference / average <= tolerance;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { receipts, transactions, userId } = await req.json();
    
    if (!receipts || !transactions) {
      throw new Error('Receipts and transactions data required');
    }

    console.log(`Matching ${receipts.length} receipts with ${transactions.length} transactions for user ${userId}`);

    const matches = [];

    for (const receipt of receipts) {
      let bestMatch = null;
      let bestScore = 0;

      for (const transaction of transactions) {
        let score = 0;
        const factors = [];

        // Amount matching (most important factor - 40% weight)
        const amountMatch = amountsMatch(Math.abs(receipt.amount), Math.abs(transaction.amount));
        if (amountMatch) {
          score += 0.4;
          factors.push('amount_exact');
        } else {
          // Partial credit for close amounts
          const amountDiff = Math.abs(Math.abs(receipt.amount) - Math.abs(transaction.amount));
          const avgAmount = (Math.abs(receipt.amount) + Math.abs(transaction.amount)) / 2;
          const amountSimilarity = Math.max(0, 1 - (amountDiff / avgAmount));
          score += 0.4 * amountSimilarity;
          if (amountSimilarity > 0.5) factors.push('amount_close');
        }

        // Date matching (30% weight)
        const dateDiff = getDateDifference(receipt.date, transaction.date);
        if (dateDiff === 0) {
          score += 0.3;
          factors.push('date_exact');
        } else if (dateDiff <= 3) {
          score += 0.3 * (1 - dateDiff / 3);
          factors.push('date_close');
        }

        // Merchant name similarity (30% weight)
        const merchantSimilarity = calculateSimilarity(
          receipt.merchant || '',
          transaction.description || ''
        );
        score += 0.3 * merchantSimilarity;
        if (merchantSimilarity > 0.7) factors.push('merchant_high');
        else if (merchantSimilarity > 0.4) factors.push('merchant_medium');

        // Update best match if this score is higher
        if (score > bestScore && score > 0.5) { // Minimum threshold of 50%
          bestScore = score;
          bestMatch = {
            receipt_id: receipt.id,
            transaction_id: transaction.id,
            confidence_score: score,
            matching_factors: factors,
            receipt,
            transaction
          };
        }
      }

      if (bestMatch) {
        matches.push(bestMatch);
      }
    }

    console.log(`Found ${matches.length} potential matches`);

    // Sort matches by confidence score (highest first)
    matches.sort((a, b) => b.confidence_score - a.confidence_score);

    return new Response(JSON.stringify({ 
      matches,
      summary: {
        total_receipts: receipts.length,
        total_transactions: transactions.length,
        matched_count: matches.length,
        unmatched_receipts: receipts.length - matches.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error matching transactions:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to match transactions',
        details: error.stack 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});