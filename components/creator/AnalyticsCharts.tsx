"use client";

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
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black tracking-tight uppercase text-zinc-400">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Data</span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 800 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 800 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0B0F19', 
                  borderColor: '#1F2937', 
                  borderRadius: '1rem',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 800 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 800 }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }}
                contentStyle={{ 
                  backgroundColor: '#0B0F19', 
                  borderColor: '#1F2937', 
                  borderRadius: '1rem',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }} 
              />
              <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={color} fillOpacity={0.8 + (index / data.length) * 0.2} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
