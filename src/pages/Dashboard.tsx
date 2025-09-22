import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Loader2 } from "lucide-react";
import ReceiptUpload from "@/components/ReceiptUpload";
import StatementUpload from "@/components/StatementUpload";
import ExpenseDashboard from "@/components/ExpenseDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Receipt {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  items: string[];
  category: string;
  currency: string;
  user_id: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance?: number;
  category: string;
  transaction_type: string;
  user_id: string;
  bank_type: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [defaultTab, setDefaultTab] = useState("dashboard");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const [receiptsRes, transactionsRes] = await Promise.all([
            supabase
              .from("receipts")
              .select("*")
              .order("created_at", { ascending: false }),
            supabase
              .from("transactions")
              .select("*")
              .order("date", { ascending: false }),
          ]);

          if (receiptsRes.error) throw receiptsRes.error;
          if (transactionsRes.error) throw transactionsRes.error;

          setReceipts(receiptsRes.data || []);
          setTransactions(transactionsRes.data || []);
        } catch (error: any) {
          console.error("Error fetching data:", error);
          toast({
            title: "Error fetching data",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchData();
    }
  }, [user, toast]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleReceiptProcessed = (receipt: Receipt) => {
    setReceipts((prev) => [receipt, ...prev]);
    setDefaultTab("dashboard");
  };

  const handleStatementProcessed = (newTransactions: Transaction[]) => {
    setTransactions((prev) => [...newTransactions, ...prev]);
    setDefaultTab("dashboard");
  };

  const handleMatchTransactions = () => {
    // This is called when matching is complete
    console.log("Transaction matching completed");
  };

  if (!user) {
    // This part is rendered on initial load before user is checked,
    // or if user is genuinely not logged in.
    // The AuthProvider's loading state handles the initial flicker.
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to access this page.
          </p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">SmartSpend</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoadingData ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">
              Loading your financial data...
            </p>
          </div>
        ) : (
          <Tabs
            defaultValue="dashboard"
            value={defaultTab}            
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger onClick={() => setDefaultTab('dashboard')} value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger onClick={() => setDefaultTab('receipts')} value="receipts">Upload Receipt</TabsTrigger>
              <TabsTrigger onClick={() => setDefaultTab('statements')} value="statements">Import Statement</TabsTrigger>
              <TabsTrigger onClick={() => setDefaultTab('data')} value="data">View Data</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <ExpenseDashboard
                receipts={receipts}
                transactions={transactions}
                onMatchTransactions={handleMatchTransactions}
              />
            </TabsContent>

            <TabsContent value="receipts" className="mt-6">
              <div className="flex justify-center">
                <ReceiptUpload onReceiptProcessed={handleReceiptProcessed} />
              </div>
            </TabsContent>

            <TabsContent value="statements" className="mt-6">
              <div className="flex justify-center">
                <StatementUpload
                  onStatementProcessed={handleStatementProcessed}
                />
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Receipts List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Receipts ({receipts.length})
                  </h3>
                  {receipts.length === 0 ? (
                    <p className="text-muted-foreground">
                      No receipts uploaded yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                      {receipts.map((receipt) => (
                        <div key={receipt.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{receipt.merchant}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(receipt.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm capitalize">
                                {receipt.category}
                              </p>
                            </div>
                            <p className="font-bold">
                              ₦{Number(receipt.amount).toLocaleString()}
                            </p>
                          </div>
                          {receipt.items && receipt.items.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">
                                Items: {receipt.items.join(", ")}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Transactions List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Transactions ({transactions.length})
                  </h3>
                  {transactions.length === 0 ? (
                    <p className="text-muted-foreground">
                      No transactions imported yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {transaction.description}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(
                                  transaction.date
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-sm capitalize">
                                {transaction.category}
                              </p>
                            </div>
                            <p
                              className={`font-bold ${
                                transaction.amount < 0
                                  ? "text-destructive"
                                  : "text-green-600"
                              }`}
                            >
                              {transaction.amount < 0 ? "-" : ""}₦
                              {Number(
                                Math.abs(transaction.amount)
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
