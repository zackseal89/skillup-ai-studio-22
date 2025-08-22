
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInviteTeamMember } from "@/hooks/useTeams";

interface TeamUploadProps {
  teamId: string;
}

export const TeamUpload = ({ teamId }: TeamUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [uploadResults, setUploadResults] = useState<{ success: number; errors: string[] } | null>(null);
  const inviteTeamMember = useInviteTeamMember();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadStatus('idle');
      setUploadResults(null);
    }
  };

  const processCSV = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        // Skip header row and extract emails
        const emails = lines.slice(1).map(line => {
          const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
          // Assume email is in the first column, adjust as needed
          return columns[0];
        }).filter(email => email && email.includes('@'));
        
        resolve(emails);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('processing');
    
    try {
      const emails = await processCSV(selectedFile);
      const results = { success: 0, errors: [] as string[] };

      // Process emails in batches to avoid overwhelming the API
      for (const email of emails) {
        try {
          await inviteTeamMember.mutateAsync({ teamId, email });
          results.success++;
        } catch (error) {
          results.errors.push(`Failed to invite ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setUploadResults(results);
      setUploadStatus(results.errors.length === 0 ? 'success' : 'error');
    } catch (error) {
      setUploadStatus('error');
      setUploadResults({
        success: 0,
        errors: [`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Bulk Upload Team
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="csv-upload">Upload CSV File</Label>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            CSV should have email addresses in the first column with a header row.
          </p>
        </div>

        {selectedFile && (
          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        )}

        <Button 
          onClick={handleUpload}
          disabled={!selectedFile || uploadStatus === 'processing'}
          className="w-full"
        >
          {uploadStatus === 'processing' ? (
            <>Processing...</>
          ) : (
            <>
              <Users className="h-4 w-4 mr-2" />
              Upload Team Members
            </>
          )}
        </Button>

        {uploadResults && (
          <Alert className={uploadStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Upload Results:</strong> {uploadResults.success} successful invitations sent.
                </p>
                {uploadResults.errors.length > 0 && (
                  <div>
                    <p className="font-medium text-red-600">Errors:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {uploadResults.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {uploadResults.errors.length > 5 && (
                        <li>... and {uploadResults.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>CSV Format Example:</strong></p>
          <div className="bg-muted p-2 rounded font-mono text-xs">
            Email,Name,Department<br/>
            john@company.com,John Doe,Finance<br/>
            jane@company.com,Jane Smith,Marketing
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
