// src/components/MortgageInputs.jsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MortgageInputs = ({ inputs, setInputs, handleNumberInput, handleInterestRateInput }) => {
  const formFields = [
    { label: 'Purchase Price', key: 'purchasePrice', min: 0, step: 1 },
    { label: 'Deposit Percentage', key: 'depositPercentage', min: 0, max: 100, step: 0.1 },
    { label: 'Initial Interest Rate (%)', key: 'initialRate', min: 0, step: 0.01 },
    { label: 'Initial Term (Years)', key: 'initialTerm', min: 1, step: 1 },
    { label: 'Fixed Period (Years)', key: 'fixedPeriod', min: 1, step: 1 },
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Initial Mortgage Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formFields.map(({ label, key, ...props }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type="number"
                value={inputs[key] || ''}
                onChange={(e) =>
                  setInputs({ ...inputs, [key]: handleNumberInput(e.target.value, props.min) })
                }
                className="w-full"
                {...props}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MortgageInputs;