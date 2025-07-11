import React from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/hooks/useLanguage';

interface ColumnRelevanceSettingsProps {
  columns: string[];
  relevanceWeights: Record<string, number>;
  onWeightChange: (column: string, weight: number) => void;
}

export const ColumnRelevanceSettings: React.FC<ColumnRelevanceSettingsProps> = ({
  columns,
  relevanceWeights,
  onWeightChange
}) => {
  const { language } = useLanguage();

  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          {t('columnRelevance', language)}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('setRelevance', language)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {columns.map(column => (
          <div key={column} className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">{column}</Label>
              <span className="text-sm text-muted-foreground">
                {relevanceWeights[column]?.toFixed(1) || '1.0'}x
              </span>
            </div>
            <Slider
              value={[relevanceWeights[column] || 1]}
              onValueChange={([value]) => onWeightChange(column, value)}
              max={3}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};