import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface ChartsSectionProps {
  stats: any
  monthlyData: any[]
  categoryData: { Mal: number; Hizmet: number; Yapım: number }
  totalCat: number
  malPct: number
  hizmetPct: number
  yapimPct: number
  formatCurrency: (value: number) => string
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  stats,
  monthlyData,
  categoryData,
  totalCat,
  malPct,
  hizmetPct,
  yapimPct,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Spend Trend Chart (SVG) */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Aylık Harcama Hacmi</h3>
            <p className="text-[11px] text-slate-450 mt-0.5">Yıl genelinde doğrudan temin kalemlerine yapılan harcamalar</p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl text-slate-700 dark:text-slate-350">
            2026 (Toplam: {formatCurrency(stats.toplamYaklasikMaliyet)})
          </span>
        </div>

        {/* Line Chart Component via Recharts */}
        <div className="h-64 relative w-full flex flex-col justify-end mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTutar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis
                dataKey="ay"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={(val) => (val > 0 ? `${(val / 1000).toFixed(0)}K` : '0')}
                dx={-10}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(value as number), 'Harcama']}
                labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="tutar"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTutar)"
                activeDot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right: Spend Distribution (SVG Donut) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Kategori Dağılımı</h3>
          <p className="text-[11px] text-slate-450 mt-0.5">Yaklaşık maliyetlerin mal, hizmet ve yapım türlerine oranı</p>
        </div>

        {/* Donut Chart via Recharts */}
        <div className="relative flex items-center justify-center my-4 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Mal Alımı', value: categoryData.Mal, color: '#3b82f6' },
                  { name: 'Hizmet Alımı', value: categoryData.Hizmet, color: '#10b981' },
                  { name: 'Yapım İşi', value: categoryData.Yapım, color: '#f59e0b' }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {[
                  { name: 'Mal Alımı', value: categoryData.Mal, color: '#3b82f6' },
                  { name: 'Hizmet Alımı', value: categoryData.Hizmet, color: '#10b981' },
                  { name: 'Yapım İşi', value: categoryData.Yapım, color: '#f59e0b' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => formatCurrency(value as number)}
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">%{totalCat > 1 ? 100 : 0}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dağılım</span>
          </div>
        </div>

        {/* Legend Details */}
        <div className="space-y-2 mt-2">
          <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Mal Alımı</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-850 dark:text-slate-105">
              {formatCurrency(categoryData.Mal)} (%{malPct})
            </span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Hizmet Alımı</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-850 dark:text-slate-105">
              {formatCurrency(categoryData.Hizmet)} (%{hizmetPct})
            </span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Yapım İşi</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-850 dark:text-slate-105">
              {formatCurrency(categoryData.Yapım)} (%{yapimPct})
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
