import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CSVRow, validateCSV } from '@/lib/csvUtils';

interface FileUploadProps {
  onFileUploaded: (data: CSVRow[]) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a valid CSV file');
      return;
    }

    setError(null);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validation = validateCSV(results.data as CSVRow[]);
        
        if (!validation.isValid) {
          setError(validation.error || 'Invalid CSV file');
          setFileName(null);
          return;
        }

        onFileUploaded(results.data as CSVRow[]);
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        setFileName(null);
      }
    });
  }, [onFileUploaded]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  return (
    <div className="w-full space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-border hover:border-primary/50 bg-gradient-card'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-soft">
            {fileName ? (
              <FileText className="w-8 h-8 text-white" />
            ) : (
              <Upload className="w-8 h-8 text-white" />
            )}
          </div>
          
          {fileName ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-success">File uploaded successfully!</p>
              <p className="text-xs text-muted-foreground">{fileName}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                Drop your CSV file here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="mt-4"
          >
            Choose File
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• CSV files must contain at least a "title" or "description" column</p>
        <p>• Supported columns: title, description, priority, status, assignee, created date, etc.</p>
      </div>
    </div>
  );
};