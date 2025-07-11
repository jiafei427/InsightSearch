import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, disabled }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search for tasks, projects, or any content..."
            value={query}
            onChange={handleInputChange}
            disabled={disabled || isLoading}
            className="pl-10 pr-4 py-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>
        
        <Button
          type="submit"
          disabled={!query.trim() || disabled || isLoading}
          className="px-6 py-3 bg-gradient-primary hover:shadow-medium transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>
      
      {disabled && (
        <p className="text-sm text-muted-foreground mt-2">
          Please upload a CSV file first to start searching
        </p>
      )}
    </form>
  );
};