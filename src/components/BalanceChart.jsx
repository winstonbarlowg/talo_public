'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

import { ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BalanceChart({ data = [], refinanceScenarios = [] }) {
  // show monthly or yearly points
  const [viewMode, setViewMode] = useState('monthly');

  // original chartData with every month
  const chartData = data.map(item => ({
    month: item.month,
    balance: item.balance,
    equity: item.totalEquity,
    price: item.price,
  }));

  // if yearly, pick only the end-of-year points (months divisible by 12)
  const displayedData = useMemo(() => {
    if (viewMode === 'yearly') {
      return chartData.filter(pt => pt.month % 12 === 0);
    }
    return chartData;
  }, [viewMode, chartData]);

  // build refinance reference lines
  const refinancePoints = refinanceScenarios.map((sc, idx) => {
    const m = data.find(d => d.scenarioIndex === idx + 1)?.month;
    return m ? { month: m, label: `Refinance ${idx + 1}` } : null;
  }).filter(Boolean);

  const chartConfig = {
    balance: { label: "Balance",     color: "#a855f7" },
    equity:  { label: "Equity",      color: "#10b981" },
    price:   { label: "House Price", color: "#3b82f6" },
  };

  const formatAxis = v => v >= 1000
    ? `£${(v/1000).toFixed(0)}k`
    : `£${v.toLocaleString('en-GB', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    const displayDate = useMemo(() => {
      const d = new Date();
      d.setMonth(d.getMonth() + label);
      return d.toLocaleString('en-GB', { month:'long', year:'numeric' });
    }, [label]);
    return (
      <div className="bg-white p-3 border rounded-md shadow-sm">
        <div className="font-medium mb-2">{displayDate}</div>
        <div className="flex flex-col space-y-1">
          {payload.map(entry => (
            <div key={entry.dataKey} className="flex items-center text-sm">
              <span
                className="inline-block w-3 h-3 mr-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="flex-1">{entry.name}:</span>
              <span className="font-medium">£{entry.value.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader><CardTitle>Remaining Balance & Equity</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center justify-end mb-2 space-x-2">
          <p className="text-sm font-medium">View:</p>
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-auto min-w-[100px]">
              <SelectValue placeholder="Monthly" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ChartContainer config={{
          balance:{ label:'Balance', color:'#a855f7'},
          equity:{ label:'Equity', color:'#10b981'},
          price:{ label:'House Price', color:'#3b82f6'}
        }} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayedData} margin={{ top:20, right:30, left:20, bottom:20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{fontSize:12}}
                tickFormatter={(m) =>
                  viewMode === 'yearly'
                    ? `Year ${m/12}`
                    : m
                }
              />
              <YAxis tickFormatter={formatAxis}/>
              <ChartTooltip content={<CustomTooltip />} />
              <ChartLegend content={<ChartLegendContent />} />
              {/* Bar for equity */}
              <Bar
                dataKey="equity"
                name="Equity"
                fill="var(--color-equity)"
                radius={[4, 4, 0, 0]}
              />
              {/* Line for remaining balance */}
              <Line
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="var(--color-balance)"
                strokeWidth={3}
                dot={false}
              />
              {/* Line for house price */}
              <Line
                type="monotone"
                dataKey="price"
                name="House Price"
                stroke="var(--color-price)"
                strokeWidth={3}
                dot={false}
              />
              {refinancePoints.map((pt, i) => (
                <ReferenceLine
                  key={i}
                  x={pt.month}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="3 3"
                  label={{ value: pt.label, position: 'top', fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}