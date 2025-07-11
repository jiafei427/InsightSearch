import React, { useState, useCallback } from 'react';
import { FileText, Search, Upload, Zap } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { AdvancedSearchBar } from './AdvancedSearchBar';
import { SearchResults } from './SearchResults';
import { DataInsightsDashboard } from './DataInsightsDashboard';
import { ColumnRelevanceSettings } from './ColumnRelevanceSettings';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { CSVRow, SearchResult, searchCSV, getAvailableColumns } from '@/lib/csvUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';

export const CSVSearchApp: React.FC = () => {
  const { language } = useLanguage();
  useTheme(); // Initialize theme
  
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [columnWeights, setColumnWeights] = useState<Record<string, number>>({});
  const [showAllColumns, setShowAllColumns] = useState(false);

  const handleFileUploaded = useCallback((data: CSVRow[]) => {
    setIsUploading(true);
    // Simulate processing time for better UX
    setTimeout(() => {
      setCsvData(data);
      setSearchResults([]);
      setHasSearched(false);
      setIsUploading(false);
    }, 500);
  }, []);

  const handleSearch = useCallback((query: string) => {
    if (!csvData.length) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate processing time for better UX
    setTimeout(() => {
      const results = searchCSV(csvData, query, 20);
      setSearchResults(results);
      setIsSearching(false);
    }, 800);
  }, [csvData]);

  const getColumnNames = (): string[] => {
    if (csvData.length === 0) return [];
    return Object.keys(csvData[0]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="absolute top-4 right-4 flex gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{t('appName', language)}</h1>
            </div>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {t('appDescription', language)}
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>{t('csvUpload', language)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>{t('smartSearch', language)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>{t('realTimeResults', language)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* File Upload Section */}
        <Card className="shadow-soft border-border/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">{t('uploadCSVFile', language)}</h2>
              </div>
              <FileUpload 
                onFileUploaded={handleFileUploaded} 
                isLoading={isUploading}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Info */}
        {csvData.length > 0 && (
          <Card className="shadow-soft border-border/50 bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{t('fileLoadedSuccessfully', language)}</p>
                    <p className="text-sm text-muted-foreground">
                      {csvData.length} {t('rows', language)} • {getColumnNames().length} {t('columns', language)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(showAllColumns ? getColumnNames() : getColumnNames().slice(0, 6)).map((column) => (
                    <Badge key={column} variant="secondary" className="text-xs">
                      {column}
                    </Badge>
                  ))}
                  {!showAllColumns && getColumnNames().length > 6 && (
                    <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => setShowAllColumns(true)}>
                      +{getColumnNames().length - 6} {t('more', language)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Section */}
        <Card className="shadow-soft border-border/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">{t('searchYourData', language)}</h2>
              </div>
              <AdvancedSearchBar 
                onSearch={(query, options) => {
                  if (!csvData.length) return;
                  setIsSearching(true);
                  setHasSearched(true);
                  setTimeout(() => {
                    const results = searchCSV(csvData, query, 20, {
                      columnWeights,
                      searchColumns: options.searchColumns,
                      fuzzySearch: options.fuzzySearch
                    });
                    setSearchResults(results);
                    setIsSearching(false);
                  }, 800);
                }}
                isLoading={isSearching}
                disabled={csvData.length === 0}
                availableColumns={getAvailableColumns(csvData)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {(hasSearched || isSearching) && (
          <SearchResults results={searchResults} isLoading={isSearching} />
        )}

        {/* Features Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center p-6 shadow-soft">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Easy Upload</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop or click to upload your CSV files. Supports any CSV with title and description columns.
            </p>
          </Card>
          
          <Card className="text-center p-6 shadow-soft">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Smart Search</h3>
            <p className="text-sm text-muted-foreground">
              Advanced TF-IDF and cosine similarity algorithms find the most relevant matches in your data.
            </p>
          </Card>
          
          <Card className="text-center p-6 shadow-soft">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Rich Results</h3>
            <p className="text-sm text-muted-foreground">
              View results in cards or table format with highlighting, similarity scores, and pagination.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};