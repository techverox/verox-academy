"use client";

import { useEffect, useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { motion } from "framer-motion";

interface AnalyticsChartsProps {
  data: any[];
  title: string;
  type: "area" | "bar";
  color?: string;
}

export default function AnalyticsCharts({ data, title, type, color = "#7C3AED" }: AnalyticsChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="h-[300px] w-full bg-secondary/10 rounded-lg animate-pulse" />
  );

  return (
    <div className="w-full relative">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-muted-foreground">{title}</h3>
        </div>
      )}

      <div className="h-[300px] w-full min-h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%" debounce={1}>
          {type === "area" ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--surface))', 
                  borderColor: 'hsl(var(--border))', 
                  borderRadius: '1rem',
                  fontSize: '11px',
                  fontWeight: '700',
                  boxShadow: 'var(--shadow-premium)',
                  border: '1px solid var(--border)'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                animationDuration={1500}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--surface))', 
                  borderColor: 'hsl(var(--border))', 
                  borderRadius: '1rem',
                  fontSize: '11px',
                  fontWeight: '700',
                  boxShadow: 'var(--shadow-premium)',
                  border: '1px solid var(--border)'
                }} 
              />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} animationDuration={1500}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={color} fillOpacity={0.7 + (index / data.length) * 0.3} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
