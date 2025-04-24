// src/components/RefinanceScenarioEditor.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const RefinanceScenarioEditor = ({
  scenario,
  updateRefinanceScenario,
  deleteRefinanceScenario,
}) => {
  const [temp, setTemp] = useState({
    newRate: scenario.newRate,
    refinanceFixedPeriod: scenario.refinanceFixedPeriod,
    newTerm: scenario.newTerm,
    overpayment: scenario.overpayment,
  });

  useEffect(() => {
    setTemp({
      newRate: scenario.newRate,
      refinanceFixedPeriod: scenario.refinanceFixedPeriod,
      newTerm: scenario.newTerm,
      overpayment: scenario.overpayment,
    });
  }, [scenario]);

  const handleChange = (key) => (e) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    setTemp((t) => ({ ...t, [key]: val }));
  };

  const handleSave = () => {
    updateRefinanceScenario(scenario.id, temp);
  };

  const handleDelete = () => {
    deleteRefinanceScenario(scenario.id);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="newRate">Interest Rate (%)</Label>
          <Input
            id="newRate"
            type="number"
            step="0.01"
            value={temp.newRate}
            onChange={handleChange("newRate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="refinanceFixedPeriod">Fixed Period (yrs)</Label>
          <Input
            id="refinanceFixedPeriod"
            type="number"
            value={temp.refinanceFixedPeriod}
            onChange={handleChange("refinanceFixedPeriod")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newTerm">Remaining Term (yrs)</Label>
          <Input
            id="newTerm"
            type="number"
            value={temp.newTerm}
            onChange={handleChange("newTerm")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="overpayment">Overpayment (£)</Label>
          <Input
            id="overpayment"
            type="number"
            step="100"
            value={temp.overpayment}
            onChange={handleChange("overpayment")}
          />
        </div>
      </div>
      <div className="flex space-x-4 pt-4">
        <Button onClick={handleSave}>Save</Button>
        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
      </div>
    </div>
  );
};

export default RefinanceScenarioEditor;