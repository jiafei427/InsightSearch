import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CSVRow } from '@/lib/csvUtils';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/hooks/useLanguage';

interface DataInsightsDashboardProps {
  data: CSVRow[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export const DataInsightsDashboard: React.FC<DataInsightsDashboardProps> = ({ data }) => {
  const { language } = useLanguage();

  const getPriorityData = () => {
    const priorityCounts: Record<string, number> = {};
    data.forEach(row => {
      const priority = row.priority || row.Priority || 'Unknown';
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
    });
    
    return Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));
  };

  const getStatusData = () => {
    const statusCounts: Record<string, number> = {};
    data.forEach(row => {
      const status = row.status || row.Status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const priorityData = getPriorityData();
  const statusData = getStatusData();

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Total Entries */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t('totalEntries', language)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{data.length}</div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      {priorityData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('priorityDistribution', language)}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Status Distribution */}
      {statusData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('statusDistribution', language)}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};