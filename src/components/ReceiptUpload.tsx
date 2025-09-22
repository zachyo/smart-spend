import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, FileImage, Loader2 } from "lucide-react";

interface ReceiptData {
  id: string;
  user_id: string;
  merchant: string;
  amount: number;
  date: string;
  items: string[];
  category: string;
  currency: string;
}

interface ReceiptUploadProps {
  onReceiptProcessed: (receipt: ReceiptData) => void;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  onReceiptProcessed,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  const processReceipt = async () => {
    if (!uploadedFiles.length || !user) {
      toast({
        title: "Error",
        description: "Please select a file first",
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

          console.log("Processing receipt with Supabase function...");

          const { data, error } = await supabase.functions.invoke(
            "process-receipt",
            {
              body: {
                fileData,
                fileType: file.type,
                userId: user.id,
              },
            }
          );

          if (error) {
            console.error("Edge function error:", error);
            throw new Error(error.message || "Failed to process receipt");
          }

          console.log("Receipt processed and saved:", data);

          toast({
            title: "Receipt Processed!",
            description: `Saved receipt from ${data.merchant} - ₦${data.amount}`,
          });

          onReceiptProcessed(data);
          setUploadedFiles([]);
        } catch (processingError) {
          console.error("Processing error:", processingError);
          toast({
            title: "Processing Failed",
            description:
              processingError instanceof Error
                ? processingError.message
                : "Unable to extract receipt data",
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
      console.error("Receipt processing error:", error);
      toast({
        title: "Error",
        description: "Failed to process receipt. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Upload Receipt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadedFiles.length <= 0 && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />

            <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />

            {isDragActive ? (
              <p className="text-primary">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop a receipt file, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports JPEG, PNG, WebP, PDF up to 10MB
                </p>
              </div>
            )}
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected file:</p>
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {uploadedFiles[0].name}
            </div>
          </div>
        )}

        <Button
          onClick={processReceipt}
          disabled={!uploadedFiles.length || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Receipt...
            </>
          ) : (
            "Extract Receipt Data"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReceiptUpload;
