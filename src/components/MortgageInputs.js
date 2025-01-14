import React from 'react';

const MortgageInputs = ({ inputs, setInputs, handleNumberInput, handleInterestRateInput }) => (
  <div className="bg-white p-6 rounded-lg shadow mb-8">
    <h2 className="text-xl font-bold mb-4">Initial Mortgage Details</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { label: 'Purchase Price', key: 'purchasePrice', min: 0, step: 1 },
        { label: 'Deposit Percentage', key: 'depositPercentage', min: 0, max: 100, step: 0.1 },
        { label: 'Initial Interest Rate (%)', key: 'initialRate', min: 0, step: 0.01 },
        { label: 'Initial Term (Years)', key: 'initialTerm', min: 1, step: 1 },
        { label: 'Fixed Period (Years)', key: 'fixedPeriod', min: 1, step: 1 },
      ].map(({ label, key, ...props }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <input
            type="number"
            value={inputs[key] || ''}
            onChange={(e) =>
              setInputs({ ...inputs, [key]: handleNumberInput(e.target.value, props.min) })
            }
            className="mt-1 block w-full"
            {...props}
          />
        </div>
      ))}
    </div>
  </div>
);

export default MortgageInputs;