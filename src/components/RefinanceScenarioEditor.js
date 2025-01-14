import React, { useState } from 'react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const RefinanceScenarioEditor = ({
  scenario = {
    newRate: 0,
    newTerm: 0,
    overpayment: 0,
    refinanceFixedPeriod: 0,
    monthlyPayment: 0,
    interestPaid: 0,
    principalPaid: 0,
  },
  updateRefinanceScenario,
  deleteRefinanceScenario,
}) => {
  const [editing, setEditing] = useState(false);
  const [tempScenario, setTempScenario] = useState({
    newRate: scenario.newRate || 0,
    newTerm: scenario.newTerm || 0,
    overpayment: scenario.overpayment || 0,
    refinanceFixedPeriod: scenario.refinanceFixedPeriod || 0,
    monthlyPayment: scenario.monthlyPayment || 0,
    interestPaid: scenario.interestPaid || 0,
    principalPaid: scenario.principalPaid || 0,
  });

  const handleInputChange = (key, value) => {
    setTempScenario({ ...tempScenario, [key]: value });
  };

  const saveChanges = () => {
    updateRefinanceScenario(scenario.id, tempScenario);
    setEditing(false);
  };

  console.log('Scenario data in RefinanceScenarioEditor:', scenario);

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-4">
      {editing ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Interest Rate (%)</label>
              <input
                type="number"
                value={tempScenario.newRate}
                onChange={(e) => handleInputChange('newRate', parseFloat(e.target.value))}
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Term (Years)</label>
              <input
                type="number"
                value={tempScenario.newTerm}
                onChange={(e) => handleInputChange('newTerm', parseInt(e.target.value, 10))}
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Overpayment Amount</label>
              <input
                type="number"
                value={tempScenario.overpayment}
                onChange={(e) => handleInputChange('overpayment', parseInt(e.target.value, 10))}
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fixed Period (Years)</label>
              <input
                type="number"
                value={tempScenario.refinanceFixedPeriod}
                onChange={(e) => handleInputChange('refinanceFixedPeriod', parseInt(e.target.value, 10))}
                className="mt-1 block w-full"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={saveChanges}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <ul className="mb-4 space-y-2">
            <li><strong>Interest rate:</strong> {scenario.newRate !== undefined ? `${scenario.newRate}%` : 'N/A'}</li>
            <li><strong>Fixed term:</strong> {scenario.refinanceFixedPeriod !== undefined ? `${scenario.refinanceFixedPeriod} years` : 'N/A'}</li>
            <li><strong>Remaining mortgage term:</strong> {scenario.newTerm !== undefined ? `${scenario.newTerm} years` : 'N/A'}</li>
          </ul>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
              <p className="text-xl font-bold text-gray-900">
                {scenario.monthlyPayment !== undefined ? formatCurrency(scenario.monthlyPayment) : 'N/A'}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Interest Paid</p>
              <p className="text-xl font-bold text-gray-900">
                {scenario.interestPaid !== undefined ? formatCurrency(scenario.interestPaid) : 'N/A'}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Principal Paid</p>
              <p className="text-xl font-bold text-gray-900">
                {scenario.principalPaid !== undefined ? formatCurrency(scenario.principalPaid) : 'N/A'}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Overpayment</p>
              <p className="text-xl font-bold text-gray-900">
                {scenario.overpayment !== undefined ? formatCurrency(scenario.overpayment) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => deleteRefinanceScenario(scenario.id)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RefinanceScenarioEditor;