import React, { useState } from 'react';
import { Search, Loader2, Filter, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/hooks/useLanguage';

interface AdvancedSearchBarProps {
  onSearch: (query: string, options: {
    searchColumns: string[];
    fuzzySearch: boolean;
  }) => void;
  isLoading: boolean;
  disabled?: boolean;
  availableColumns: string[];
}

export const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({ 
  onSearch, 
  isLoading, 
  disabled,
  availableColumns 
}) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [searchColumns, setSearchColumns] = useState<string[]>([]);
  const [fuzzySearch, setFuzzySearch] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim(), {
        searchColumns,
        fuzzySearch
      });
    }
  };

  const handleColumnToggle = (column: string, checked: boolean) => {
    if (checked) {
      setSearchColumns(prev => [...prev, column]);
    } else {
      setSearchColumns(prev => prev.filter(c => c !== column));
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder={t('searchPlaceholder', language)}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={disabled || isLoading}
              className="pl-10 pr-4 py-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3"
          >
            <Settings2 className="w-4 h-4" />
          </Button>
          
          <Button
            type="submit"
            disabled={!query.trim() || disabled || isLoading}
            className="px-6 py-3 bg-gradient-primary hover:shadow-medium transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('searching', language)}
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                {t('search', language)}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Advanced Options */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleContent className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Advanced Search Options
            </h4>
            
            {/* Column Selection */}
            {availableColumns.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('filterByColumn', language)}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableColumns.map(column => (
                    <div key={column} className="flex items-center space-x-2">
                      <Checkbox
                        id={`column-${column}`}
                        checked={searchColumns.includes(column)}
                        onCheckedChange={(checked) => handleColumnToggle(column, checked as boolean)}
                      />
                      <Label 
                        htmlFor={`column-${column}`}
                        className="text-xs truncate"
                        title={column}
                      >
                        {column}
                      </Label>
                    </div>
                  ))}
                </div>
                {searchColumns.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t('allColumns', language)} selected
                  </p>
                )}
              </div>
            )}
            
            {/* Fuzzy Search Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fuzzy-search"
                checked={fuzzySearch}
                onCheckedChange={(checked) => setFuzzySearch(checked as boolean)}
              />
              <Label htmlFor="fuzzy-search" className="text-sm">
                Enable fuzzy search (typo tolerance)
              </Label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {disabled && (
        <p className="text-sm text-muted-foreground">
          {t('pleaseUploadFirst', language)}
        </p>
      )}
    </div>
  );
};