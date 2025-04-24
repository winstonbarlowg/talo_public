'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
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
      <div className="bg-white p-3 border rounded">
        <div className="font-medium mb-1">{displayDate}</div>
        {payload.map(entry => (
          <div key={entry.dataKey} className="text-sm">
            {entry.name}: £{entry.value.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})}
          </div>
        ))}
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
            <LineChart data={displayedData} margin={{ top:20, right:30, left:20, bottom:20 }}>
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
              <Line type="monotone" dataKey="balance" name="Balance" stroke="#a855f7" dot={false}/>
              <Line type="monotone" dataKey="equity" name="Equity" stroke="#10b981" dot={false}/>
              <Line type="monotone" dataKey="price" name="House Price" stroke="#3b82f6" dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}