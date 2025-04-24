// src/components/PaymentChart.jsx
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";

const PaymentChart = ({ data, refinanceScenarios }) => {
  const chartData = data.map((item) => ({
    month: item.month,
    interest: item.interest,
    principal: item.principal,
    total: item.interest + item.principal
  }));

  // Define the refinance points for reference lines
  const refinancePoints = refinanceScenarios.map((scenario, index) => {
    const month = data.find((d) => d.scenarioIndex === index + 1)?.month;
    return month ? { month, label: `Refinance ${index + 1}` } : null;
  }).filter(Boolean);

  const chartConfig = {
    interest: { label: "Interest Payment", color: "#f87171" },
    principal: { label: "Principal Payment", color: "#22c55e" },
  };

  const formatCurrency = (value) => `£${value.toFixed(2)}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-sm">
          <p className="font-medium text-sm">Month: {label}</p>
          <div className="mt-2">
            <p className="text-sm flex items-center">
              <span className="w-3 h-3 inline-block mr-2 rounded-full bg-red-300"></span>
              Interest: {formatCurrency(payload[0].value)}
            </p>
            <p className="text-sm flex items-center">
              <span className="w-3 h-3 inline-block mr-2 rounded-full bg-green-500"></span>
              Principal: {formatCurrency(payload[1].value)}
            </p>
            <div className="border-t mt-2 pt-2">
              <p className="text-sm font-medium">Total: {formatCurrency(payload[0].value + payload[1].value)}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Payment Components</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-78 w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis 
              dataKey="month" 
              label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: 'Payment Amount (£)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `£${value}`}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="interest" stackId="a" fill="var(--color-interest)" radius={4} />
            <Bar dataKey="principal" stackId="a" fill="var(--color-principal)" radius={4} />
            {refinancePoints.map((point, index) => (
              <ReferenceLine 
                key={index}
                x={point.month}
                stroke="#888888"
                strokeDasharray="3 3"
                label={{
                  value: point.label,
                  position: 'top',
                  fill: '#888888',
                  fontSize: 12,
                }}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PaymentChart;