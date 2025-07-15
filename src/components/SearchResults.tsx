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
  if (!priority) return 'bg-muted text-foreground';
  const priorityLetter = priority.trim().toUpperCase();
  if (priorityLetter === 'A') return 'bg-red-600 text-white';
  if (priorityLetter === 'B') return 'bg-orange-500 text-white';
  if (priorityLetter === 'C') return 'bg-yellow-400 text-black';
  if (priorityLetter === 'D') return 'bg-green-500 text-white';
  return 'bg-muted text-foreground';
};

const getStatusColor = (status: string | undefined) => {
  if (!status) return 'bg-muted';
  const s = status.toLowerCase();
  if (s.includes('complete') || s.includes('done')) return 'bg-success';
  if (s.includes('progress') || s.includes('active')) return 'bg-primary';
  if (s.includes('pending') || s.includes('waiting')) return 'bg-warning';
  return 'bg-muted';
};

// Utility to get the first language block (split by double newlines or a separator)
const getFirstBlock = (text: string) => {
  if (!text) return '';
  // Try to split by two or more newlines, or fallback to first 200 chars
  const blocks = text.split(/\n{2,}/);
  return blocks[0] || text.slice(0, 200);
};

// Card view is secondary now but keep component
const ResultCard: React.FC<{ result: SearchResult; index: number; maxScore: number }> = ({ result, index, maxScore }) => {
  const { row, score, highlightedTitle, highlightedDescription } = result;
  const percent = Math.round((score / (maxScore || 1)) * 100);
  const issueKey = (row['Issue Key'] as string) || (row.issueKey as string) || (row.IssueKey as string);
  const priority = row.priority || row.Priority;
  const status = row.status || row.Status;
  const assignee = row.assignee || row.Assignee;
  const created = row.created || row.Created || row['created date'] || row['Created Date'];
  const descriptionRaw = row.description || row.Description || '';
  const [showMore, setShowMore] = useState(false);
  const descBlock = getFirstBlock(descriptionRaw);
  const descToShow = showMore ? descriptionRaw : descBlock.slice(0, 200);
  const isTruncated = descriptionRaw.length > descToShow.length;

  return (
    <Card className="group hover:shadow-medium transition-all duration-200 hover:-translate-y-1 bg-gradient-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
            <Badge variant="outline" className="text-xs">{percent}% match</Badge>
            {priority && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPriorityColor(priority)}`}>{priority}</span>
            )}
            {status && (
              <Badge variant="outline" className="text-xs">{status}</Badge>
            )}
            {assignee && (
              <Badge variant="secondary" className="text-xs">{assignee}</Badge>
            )}
            {created && (
              <span className="text-xs text-muted-foreground">{created}</span>
            )}
            {issueKey && (
              <a href={`https://mcols.autoever.com/${issueKey}`} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs font-medium ml-2">{issueKey}</a>
            )}
          </div>
        </div>
        <h3
          className="font-semibold text-lg leading-tight text-foreground group-hover:text-primary transition-colors"
          dangerouslySetInnerHTML={{
            __html: getFirstBlock(highlightedTitle || row.title || row.Title || 'Untitled'),
          }}
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {descToShow && (
          <div className="text-sm text-muted-foreground leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: descToShow }} />
            {isTruncated && !showMore && (
              <button className="ml-2 text-primary underline text-xs" onClick={() => setShowMore(true)}>Show more</button>
            )}
            {showMore && isTruncated && (
              <button className="ml-2 text-primary underline text-xs" onClick={() => setShowMore(false)}>Show less</button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const SearchResults: React.FC<SearchResultsProps> = ({ results, isLoading }) => {
  const maxScore = results.reduce((max, r) => Math.max(max, r.score), 0);
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;

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
            <ResultCard key={index} result={result} index={index} maxScore={maxScore} />
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
                    Issue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Title
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
                     <td className="px-4 py-3 text-sm">
                       {(() => {
                         const key = result.row['Issue Key'] || result.row.issueKey || result.row.IssueKey;
                         return key ? (
                           <a
                             href={`https://mcols.autoever.com/${key}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-primary underline break-all"
                           >
                             {key}
                           </a>
                         ) : '-';
                       })()}
                     </td>
                     <td
                       className="px-4 py-3 text-sm font-medium max-w-xs truncate"
                       dangerouslySetInnerHTML={{
                         __html: result.highlightedTitle || result.row.title || result.row.Title || 'Untitled',
                       }}
                     />
                    <td className="px-4 py-3 text-sm">
                      {(result.row.priority || result.row.Priority) && (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPriorityColor(result.row.priority || result.row.Priority)}`}
                        >
                          {result.row.priority || result.row.Priority}
                        </span>
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
                        {Math.round((result.score / (maxScore || 1)) * 100)}%
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