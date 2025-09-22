import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  amount: number;
  balance?: number;
  category: string;
  transaction_type: string;
  bank_type: string;
}

interface StatementUploadProps {
  onStatementProcessed: (transactions: Transaction[]) => void;
}

const SUPPORTED_BANKS = [
  { value: 'gtb', label: 'GTBank' },
  { value: 'access', label: 'Access Bank' },
  { value: 'zenith', label: 'Zenith Bank' },
  { value: 'uba', label: 'UBA' },
  { value: 'first_bank', label: 'First Bank' },
  { value: 'generic', label: 'Other/Generic' }
];

const StatementUpload: React.FC<StatementUploadProps> = ({ onStatementProcessed }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50MB limit
  });

  const processStatement = async () => {
    if (!uploadedFiles.length || !user || !selectedBank) {
      toast({
        title: "Error",
        description: "Please select a file and bank type first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const file = uploadedFiles[0];
      
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        try {
          const fileData = reader.result as string;

          console.log('Processing bank statement...');
          
          const { data, error } = await supabase.functions.invoke('parse-statement', {
            body: {
              fileData,
              fileType: file.type,
              bankType: selectedBank,
              userId: user.id
            }
          });

          if (error) {
            console.error('Edge function error:', error);
            throw new Error(error.message || 'Failed to process statement');
          }

          if (!data.transactions || data.transactions.length === 0) {
            throw new Error('No transactions found in the statement');
          }

          console.log(`Statement processed successfully: ${data.transactions.length} transactions`);
          
          toast({
            title: "Statement Processed!",
            description: `Imported and saved ${data.transactions.length} transactions`,
          });

          onStatementProcessed(data.transactions);
          setUploadedFiles([]);
          setSelectedBank('');

        } catch (processingError) {
          console.error('Statement processing error:', processingError);
          toast({
            title: "Processing Failed",
            description: processingError instanceof Error ? processingError.message : 'Unable to parse statement data',
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: "File Error",
          description: "Unable to read the selected file",
          variant: "destructive",
        });
        setIsProcessing(false);
      };
      
    } catch (error) {
      console.error('Statement processing error:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : 'Unable to parse statement data',
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Import Bank Statement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Bank</label>
          <Select value={selectedBank} onValueChange={setSelectedBank}>
            <SelectTrigger>
              <SelectValue placeholder="Select your bank" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_BANKS.map((bank) => (
                <SelectItem key={bank.value} value={bank.value}>
                  {bank.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          
          <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          
          {isDragActive ? (
            <p className="text-primary">Drop the statement file here...</p>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop a statement file, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, CSV, XLS, XLSX up to 50MB
              </p>
            </div>
          )}
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected file:</p>
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {uploadedFiles[0].name}
            </div>
          </div>
        )}

        <Button
          onClick={processStatement}
          disabled={!uploadedFiles.length || !selectedBank || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Statement...
            </>
          ) : (
            'Parse Statement Data'
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>We'll do our best to parse any common statement format.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatementUpload;
