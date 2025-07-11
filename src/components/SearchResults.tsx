import React, { useState } from 'react';
import { Star, Clock, User, Flag, MoreHorizontal, Table, Grid3X3 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchResult } from '@/lib/csvUtils';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
}

const getPriorityColor = (priority: string | undefined) => {
  if (!priority) return 'bg-muted';
  const p = priority.toLowerCase();
  if (p.includes('high') || p.includes('urgent')) return 'bg-destructive';
  if (p.includes('medium')) return 'bg-warning';
  if (p.includes('low')) return 'bg-success';
  return 'bg-muted';
};

const getStatusColor = (status: string | undefined) => {
  if (!status) return 'bg-muted';
  const s = status.toLowerCase();
  if (s.includes('complete') || s.includes('done')) return 'bg-success';
  if (s.includes('progress') || s.includes('active')) return 'bg-primary';
  if (s.includes('pending') || s.includes('waiting')) return 'bg-warning';
  return 'bg-muted';
};

const ResultCard: React.FC<{ result: SearchResult; index: number }> = ({ result, index }) => {
  const { row, score, highlightedTitle, highlightedDescription } = result;
  
  return (
    <Card className="group hover:shadow-medium transition-all duration-200 hover:-translate-y-1 bg-gradient-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
              <Badge variant="outline" className="text-xs">
                {Math.round(score * 100)}% match
              </Badge>
            </div>
            <h3 
              className="font-semibold text-lg leading-tight text-foreground group-hover:text-primary transition-colors"
              dangerouslySetInnerHTML={{ 
                __html: highlightedTitle || row.title || row.Title || 'Untitled' 
              }}
            />
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {(row.description || row.Description) && (
          <div 
            className="text-sm text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: highlightedDescription || row.description || row.Description || '' 
            }}
          />
        )}
        
        <div className="flex flex-wrap gap-2">
          {(row.priority || row.Priority) && (
            <div className="flex items-center gap-1">
              <Flag className="w-3 h-3 text-muted-foreground" />
              <Badge className={`text-xs ${getPriorityColor(row.priority || row.Priority)}`}>
                {row.priority || row.Priority}
              </Badge>
            </div>
          )}
          
          {(row.status || row.Status) && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(row.status || row.Status)}`} />
              <Badge variant="outline" className="text-xs">
                {row.status || row.Status}
              </Badge>
            </div>
          )}
          
          {(row.assignee || row.Assignee) && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-muted-foreground" />
              <Badge variant="secondary" className="text-xs">
                {row.assignee || row.Assignee}
              </Badge>
            </div>
          )}
          
          {(row.created || row.Created || row['created date'] || row['Created Date']) && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {row.created || row.Created || row['created date'] || row['Created Date']}
              </span>
            </div>
          )}
        </div>
        
        {/* Additional fields */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(row)
            .filter(([key]) => !['title', 'Title', 'description', 'Description', 'priority', 'Priority', 'status', 'Status', 'assignee', 'Assignee', 'created', 'Created', 'created date', 'Created Date'].includes(key))
            .slice(0, 4)
            .map(([key, value]) => (
              <div key={key} className="truncate">
                <span className="font-medium text-muted-foreground">{key}:</span>
                <span className="ml-1 text-foreground">{value}</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const SearchResults: React.FC<SearchResultsProps> = ({ results, isLoading }) => {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 6;

  const totalPages = Math.ceil(results.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = results.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Searching through your data...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t('noResultsFound', language)}</h3>
        <p className="text-muted-foreground">{t('noResultsDescription', language)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t('searchResults', language)}</h2>
          <p className="text-sm text-muted-foreground">
            {t('found', language)} {results.length} {results.length === 1 ? t('result', language) : t('results', language)} 
            {totalPages > 1 && ` • ${t('page', language)} ${currentPage} ${t('of', language)} ${totalPages}`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            {t('cards', language)}
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <Table className="w-4 h-4 mr-2" />
            {t('table', language)}
          </Button>
        </div>
      </div>

      {/* Results */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentResults.map((result, index) => (
            <ResultCard 
              key={startIndex + index} 
              result={result} 
              index={startIndex + index} 
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Match
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentResults.map((result, index) => (
                  <tr key={startIndex + index} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">#{startIndex + index + 1}</td>
                    <td 
                      className="px-4 py-3 text-sm font-medium"
                      dangerouslySetInnerHTML={{ 
                        __html: result.highlightedTitle || result.row.title || result.row.Title || 'Untitled' 
                      }}
                    />
                    <td 
                      className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate"
                      dangerouslySetInnerHTML={{ 
                        __html: result.highlightedDescription || result.row.description || result.row.Description || '-' 
                      }}
                    />
                    <td className="px-4 py-3 text-sm">
                      {(result.row.priority || result.row.Priority) && (
                        <Badge className={`text-xs ${getPriorityColor(result.row.priority || result.row.Priority)}`}>
                          {result.row.priority || result.row.Priority}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {(result.row.status || result.row.Status) && (
                        <Badge variant="outline" className="text-xs">
                          {result.row.status || result.row.Status}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {Math.round(result.score * 100)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="w-10"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};