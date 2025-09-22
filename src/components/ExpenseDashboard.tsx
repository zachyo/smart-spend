import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  DollarSign, 
  Receipt, 
  CreditCard, 
  TrendingUp, 
  Link2, 
  FileText,
  Calendar
} from 'lucide-react';
import { formatNumberShort } from '@/lib/utils';

interface Receipt {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  items: string[];
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  transaction_type: string;
}

interface Match {
  receipt_id: string;
  transaction_id: string;
  confidence_score: number;
  matching_factors: string[];
  receipt: Receipt;
  transaction: Transaction;
}

interface ExpenseDashboardProps {
  receipts: Receipt[];
  transactions: Transaction[];
  onMatchTransactions: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ExpenseDashboard: React.FC<ExpenseDashboardProps> = ({ 
  receipts, 
  transactions, 
  onMatchTransactions 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  // Calculate category totals for pie chart
  const categoryTotals = [...receipts, ...transactions].reduce((acc, item) => {
    const category = item.category || 'Other';
    const amount = Math.abs(item.amount);
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      name: category,
      value: amount
    }))
    .sort((a, b) => b.value - a.value);

  // Calculate monthly totals for bar chart
  const monthlyTotals = [...receipts, ...transactions].reduce((acc, item) => {
    const month = item.date.substring(0, 7); // YYYY-MM format
    const amount = Math.abs(item.amount);
    acc[month] = (acc[month] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month,
      amount
    }));

  const totalExpenses = pieData.reduce((sum, item) => sum + item.value, 0);

  const matchTransactions = async () => {
    if (!user || receipts.length === 0 || transactions.length === 0) {
      toast({
        title: "No Data",
        description: "You need both receipts and transactions to perform matching",
        variant: "destructive",
      });
      return;
    }

    setIsMatching(true);

    try {
      console.log('Matching transactions...');
      
      const { data, error } = await supabase.functions.invoke('match-transactions', {
        body: {
          receipts,
          transactions,
          userId: user.id
        }
      });

      if (error) {
        console.error('Matching error:', error);
        throw new Error(error.message || 'Failed to match transactions');
      }

      console.log('Matching completed:', data);
      setMatches(data.matches || []);
      
      toast({
        title: "Matching Complete!",
        description: `Found ${data.matches?.length || 0} potential matches`,
      });

      onMatchTransactions();
      
    } catch (error) {
      console.error('Transaction matching error:', error);
      toast({
        title: "Matching Failed",
        description: error instanceof Error ? error.message : 'Unable to match transactions',
        variant: "destructive",
      });
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className='text-green-500 text-2xl'>₦</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{Number(totalExpenses.toFixed(2)).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Receipts</p>
                <p className="text-2xl font-bold">{receipts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Link2 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Matches</p>
                <p className="text-2xl font-bold">{matches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={matchTransactions}
          disabled={isMatching || receipts.length === 0 || transactions.length === 0}
          className="flex items-center gap-2"
        >
          <Link2 className="h-4 w-4" />
          {isMatching ? 'Matching...' : 'Match Transactions'}
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₦${Number(Number(value).toFixed(2)).toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {pieData.map((entry, index) => {
                  const percentage = totalExpenses > 0 ? (entry.value / totalExpenses) * 100 : 0;
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div key={entry.name} className="flex items-center justify-between text-sm group">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-medium capitalize group-hover:text-primary">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          ₦{Number(entry.value.toFixed(2)).toLocaleString()}
                        </span>
                        <span className="text-muted-foreground w-16 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
              })}
            </div>
          </CardContent>
        </Card>
        <hr className='lg:hidden'/>

        {/* Monthly Trends */}
        <Card className='border-none px-0'>
          <CardHeader className='px-4'>
            <CardTitle>Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent className='px-4'>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatNumberShort} />
                <Tooltip formatter={(value) => [`₦${Number(Number(value).toFixed(2)).toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Matches Table */}
      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matches.slice(0, 10).map((match, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div>
                        <p className="font-medium">{match.receipt.merchant}</p>
                        <p className="text-sm text-muted-foreground">{match.receipt.date}</p>
                      </div>
                      <div className="text-center">
                        <Link2 className="h-4 w-4 mx-auto text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{match.transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{match.transaction.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={match.confidence_score > 0.8 ? 'default' : 'secondary'}>
                        {Math.round(match.confidence_score * 100)}% match
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ${Math.abs(match.receipt.amount).toFixed(2)} / ${Math.abs(match.transaction.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpenseDashboard;