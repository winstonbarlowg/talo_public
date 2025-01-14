import React from 'react';

const RefinanceScenarios = ({ addRefinanceScenario }) => (
  <div className="space-y-8 mb-8">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold">Refinancing Scenarios</h2>
      <button
        onClick={addRefinanceScenario}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Refinancing Scenario
      </button>
    </div>
  </div>
);

export default RefinanceScenarios;