import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const BalanceChart = ({ data, refinanceScenarios }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-xl font-bold mb-4">Remaining Mortgage Balance</h2>
    <div className="h-96">
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: 'Balance (£)', angle: -90, position: 'insideLeft', offset: 10 }} />
          <Tooltip formatter={(value) => `£${value.toFixed(2)}`} labelFormatter={(label) => `Month ${label}`} />
          <Legend />
          {refinanceScenarios.map((scenario, index) => {
            const month = data.find((d) => d.scenarioIndex === index + 1)?.month;
            return month ? (
              <ReferenceLine
                key={scenario.id}
                x={month}
                stroke="#888"
                strokeDasharray="3 3"
                label={{ value: `Refinance ${index + 1}`, position: 'top' }}
              />
            ) : null;
          })}
          <Line type="monotone" dataKey="balance" name="Remaining Balance" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default BalanceChart;