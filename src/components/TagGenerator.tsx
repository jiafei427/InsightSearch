import React from 'react';
import { Tag, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CSVRow } from '@/lib/csvUtils';

interface TagGeneratorProps {
  row: CSVRow;
}

export const TagGenerator: React.FC<TagGeneratorProps> = ({ row }) => {
  const generateTags = (row: CSVRow): string[] => {
    const tags: string[] = [];
    
    // Extract key information
    const text = [
      row.title || row.Title || '',
      row.description || row.Description || ''
    ].join(' ').toLowerCase();
    
    // Priority-based tags
    const priority = (row.priority || row.Priority || '').toLowerCase();
    if (priority.includes('high') || priority.includes('urgent')) {
      tags.push('high-priority');
    }
    if (priority.includes('critical')) {
      tags.push('critical');
    }
    
    // Status-based tags
    const status = (row.status || row.Status || '').toLowerCase();
    if (status.includes('bug') || text.includes('bug')) {
      tags.push('bug');
    }
    if (status.includes('feature') || text.includes('feature')) {
      tags.push('feature');
    }
    if (status.includes('done') || status.includes('complete')) {
      tags.push('completed');
    }
    
    // Content-based tags
    if (text.includes('login') || text.includes('auth')) {
      tags.push('authentication');
    }
    if (text.includes('ui') || text.includes('interface')) {
      tags.push('ui');
    }
    if (text.includes('api') || text.includes('backend')) {
      tags.push('backend');
    }
    if (text.includes('mobile') || text.includes('responsive')) {
      tags.push('mobile');
    }
    if (text.includes('error') || text.includes('issue')) {
      tags.push('issue');
    }
    if (text.includes('performance') || text.includes('slow')) {
      tags.push('performance');
    }
    if (text.includes('security') || text.includes('vulnerability')) {
      tags.push('security');
    }
    
    return [...new Set(tags)]; // Remove duplicates
  };

  const tags = generateTags(row);

  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Auto Tags:</span>
      </div>
      {tags.map(tag => (
        <Badge 
          key={tag} 
          variant="outline" 
          className="text-xs bg-primary/10 border-primary/20"
        >
          #{tag}
        </Badge>
      ))}
    </div>
  );
};