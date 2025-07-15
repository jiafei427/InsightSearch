import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, X } from 'lucide-react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CSVRow, validateCSV, combineCSVData } from '@/lib/csvUtils';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/hooks/useLanguage';

interface FileUploadProps {
  onFileUploaded: (data: CSVRow[]) => void;
  isLoading: boolean;
}

interface FileData {
  fileName: string;
  data: CSVRow[];
  isValid: boolean;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, isLoading }) => {
  const { language } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);

  const handleFiles = useCallback((files: FileList) => {
    setError(null);
    const newFiles: FileData[] = [];

    Array.from(files).forEach(file => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError(t('pleaseUploadValidCSV', language));
        return;
      }

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Normalize keys for each row
          const normalizedData = (results.data as CSVRow[]).map(row => {
            const newRow = { ...row };
            if ('Issue key' in newRow) {
              newRow.issueKey = newRow['Issue key'];
            }
            if ('Summary' in newRow) {
              newRow.title = newRow['Summary'];
            }
            return newRow;
          });

          const validation = validateCSV(normalizedData, file.name);
          const fileData: FileData = {
            fileName: file.name,
            data: normalizedData,
            isValid: validation.isValid,
            error: validation.error
          };
          
          newFiles.push(fileData);
          
          // Update files when all are processed
          if (newFiles.length === files.length) {
            setUploadedFiles(prev => [...prev, ...newFiles]);
            
            // Combine all valid files and send to parent
            const allValidFiles = [...uploadedFiles, ...newFiles].filter(f => f.isValid);
            if (allValidFiles.length > 0) {
              const combined = combineCSVData(allValidFiles.map(f => ({ data: f.data, fileName: f.fileName })));
              onFileUploaded(combined);
            }
          }
        },
        error: (error) => {
          setError(`Error parsing CSV: ${error.message}`);
        }
      });
    });
  }, [onFileUploaded, uploadedFiles, language]);

  const removeFile = useCallback((fileName: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.fileName !== fileName);
    setUploadedFiles(updatedFiles);
    
    if (updatedFiles.length > 0) {
      const validFiles = updatedFiles.filter(f => f.isValid);
      const combined = combineCSVData(validFiles.map(f => ({ data: f.data, fileName: f.fileName })));
      onFileUploaded(combined);
    } else {
      onFileUploaded([]);
    }
  }, [uploadedFiles, onFileUploaded]);

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

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
          multiple
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-soft">
            {uploadedFiles.length > 0 ? (
              <FileText className="w-8 h-8 text-white" />
            ) : (
              <Upload className="w-8 h-8 text-white" />
            )}
          </div>
          
          {uploadedFiles.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-success">
                {t('fileUploadedSuccessfully', language)}
              </p>
              <p className="text-xs text-muted-foreground">
                {uploadedFiles.length} {t('files', language)}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                {t('dropFiles', language)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('orClickToBrowse', language)}
              </p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="mt-4"
          >
            {t('chooseFiles', language)}
          </Button>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t('uploadedFiles', language)}</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{file.fileName}</span>
                  {file.isValid ? (
                    <Badge variant="outline" className="text-xs bg-success/10 border-success/20">
                      Valid
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      Invalid
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.fileName)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>{t('csvMustContain', language)}</p>
        <p>{t('supportedColumns', language)}</p>
      </div>
    </div>
  );
};