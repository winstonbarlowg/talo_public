import React, { useState, useEffect } from 'react';
import MortgageInputs from './components/MortgageInputs';
import PaymentChart from './components/PaymentChart';
import BalanceChart from './components/BalanceChart';
import RefinanceScenarioEditor from './components/RefinanceScenarioEditor';

const App = () => {
  const [inputs, setInputs] = useState({
    purchasePrice: 485000,
    depositPercentage: 15,
    initialRate: 4.41,
    initialTerm: 30,
    fixedPeriod: 5,
  });

  const [refinanceScenarios, setRefinanceScenarios] = useState([
    {
      id: 1,
      newRate: 3.5,
      newTerm: 25,
      overpayment: 50000,
      refinanceFixedPeriod: 5,
    },
  ]);

  const [mortgageData, setMortgageData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);

  const handleNumberInput = (value, min = 0) => {
    if (value === '') return '';
    const numValue = Number(value);
    return numValue < min ? min : numValue;
  };

  const handleInterestRateInput = (value) => {
    if (value === '') return '';
    const strValue = value.toString();
    return strValue.startsWith('.') ? `0${strValue}` : Number(strValue);
  };

  const addRefinanceScenario = () => {
    setRefinanceScenarios([
      ...refinanceScenarios,
      {
        id: Date.now(),
        newRate: 3.5,
        newTerm: 25,
        overpayment: 0,
        refinanceFixedPeriod: 5,
      },
    ]);
  };

  useEffect(() => {
    console.log('Refinance Scenarios:', refinanceScenarios);
  }, [refinanceScenarios]);


  const calculateMonthlyPayment = (principal, annualRate, years) => {
    const monthlyRate = (annualRate / 100) / 12;
    const numberOfPayments = years * 12;
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  useEffect(() => {
    const calculateMortgageData = () => {
      const deposit = inputs.purchasePrice * (inputs.depositPercentage / 100);
      const initialLoan = inputs.purchasePrice - deposit;
      const monthlyPayment1 = calculateMonthlyPayment(
        initialLoan,
        inputs.initialRate,
        inputs.initialTerm
      );
  
      let balance = initialLoan;
      const data = [];
      let totalInterest = 0;
      let totalPrincipalPaid = 0;
  
      // Calculate initial fixed period
      for (let month = 1; month <= inputs.fixedPeriod * 12; month++) {
        const monthlyInterest = balance * (inputs.initialRate / 100 / 12);
        const monthlyPrincipal = monthlyPayment1 - monthlyInterest;
        totalInterest += monthlyInterest;
        totalPrincipalPaid += monthlyPrincipal;
        balance -= monthlyPrincipal;
  
        data.push({
          month,
          payment: monthlyPayment1,
          interest: monthlyInterest,
          principal: monthlyPrincipal,
          balance,
          totalInterest,
          totalPrincipalPaid,
          totalEquity: deposit + totalPrincipalPaid,
          scenarioIndex: 0,
        });
      }
  
      const initialPeriodSummary = {
        monthlyPayment: monthlyPayment1,
        totalInterest: totalInterest,
        totalPrincipal: totalPrincipalPaid,
        remainingBalance: balance,
      };
  
      let lastScenarioEnd = inputs.fixedPeriod * 12;
      const scenarioSummaries = [];
  
      refinanceScenarios.forEach((scenario, index) => {
        const scenarioStartBalance = balance;
        balance -= scenario.overpayment;
        totalPrincipalPaid += scenario.overpayment;
  
        const monthlyPayment = calculateMonthlyPayment(
          balance,
          scenario.newRate,
          scenario.newTerm
        );
  
        let scenarioInterest = 0;
        let scenarioPrincipal = 0;
  
        for (let month = 1; month <= scenario.refinanceFixedPeriod * 12; month++) {
          const monthlyInterest = balance * (scenario.newRate / 100 / 12);
          const monthlyPrincipal = monthlyPayment - monthlyInterest;
  
          scenarioInterest += monthlyInterest;
          scenarioPrincipal += monthlyPrincipal;
          totalInterest += monthlyInterest;
          totalPrincipalPaid += monthlyPrincipal;
          balance -= monthlyPrincipal;
  
          data.push({
            month: lastScenarioEnd + month,
            payment: monthlyPayment,
            interest: monthlyInterest,
            principal: monthlyPrincipal,
            balance,
            totalInterest,
            totalPrincipalPaid,
            totalEquity: deposit + totalPrincipalPaid + refinanceScenarios
              .slice(0, index + 1)
              .reduce((sum, s) => sum + s.overpayment, 0),
            scenarioIndex: index + 1,
          });
        }
  
        scenarioSummaries.push({
          id: scenario.id,
          startBalance: scenarioStartBalance,
          monthlyPayment, // Correctly calculated
          interestPaid: scenarioInterest, // Correctly calculated
          principalPaid: scenarioPrincipal + scenario.overpayment, // Correctly calculated
          endBalance: balance,
          overpayment: scenario.overpayment,
          newRate: scenario.newRate,
          refinanceFixedPeriod: scenario.refinanceFixedPeriod,
          newTerm: scenario.newTerm,
        });
  
        lastScenarioEnd += scenario.refinanceFixedPeriod * 12;
      });
  
      setMortgageData(data);
      setSummaryData({
        initialDetails: {
          loanAmount: initialLoan,
          depositAmount: deposit,
          monthlyPayment: monthlyPayment1,
        },
        initialPeriod: initialPeriodSummary,
        refinanceScenarios: scenarioSummaries,
        totals: {
          interestPaid: totalInterest,
          principalPaid: totalPrincipalPaid,
          totalEquity: deposit + totalPrincipalPaid + refinanceScenarios.reduce(
            (sum, s) => sum + s.overpayment,
            0
          ),
          remainingBalance: balance, // Correctly added
        },
      });
    };
  
    calculateMortgageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, refinanceScenarios]);

  const deleteRefinanceScenario = (id) => {
    setRefinanceScenarios((prev) => prev.filter((scenario) => scenario.id !== id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Mortgage Calculator</h1>
      <MortgageInputs
        inputs={inputs}
        setInputs={setInputs}
        handleNumberInput={handleNumberInput}
        handleInterestRateInput={handleInterestRateInput}
      />
      {/* <RefinanceScenarios
        // refinanceScenarios={refinanceScenarios}
        addRefinanceScenario={addRefinanceScenario}
        updateRefinanceScenario={updateRefinanceScenario}
        removeRefinanceScenario={removeRefinanceScenario}
        handleNumberInput={handleNumberInput}
        handleInterestRateInput={handleInterestRateInput}
      /> */}
{/* Summary section */}
{summaryData && (
  <div className="bg-white p-8 rounded-lg shadow mb-8">
    <h2 className="text-2xl font-bold mb-8">Summary</h2>
    
    {/* Initial period summary */}
    <div className="mb-8 border-b pb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Initial Period</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Deposit Amount</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryData.initialDetails.depositAmount)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Initial Loan Amount</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryData.initialDetails.loanAmount)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryData.initialPeriod.monthlyPayment)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Interest Paid</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryData.initialPeriod.totalInterest)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Principal Paid</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryData.initialPeriod.totalPrincipal)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Remaining Balance</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryData.initialPeriod.remainingBalance)}</p>
        </div>
      </div>
    </div>
        
    {/* Refinancing Scenarios Title and Button inside the Summary Section */}
    <div className="flex justify-between items-center mb-8">
      <h3 className="text-lg font-semibold mb-4">Refinancing Scenarios</h3>
      <button
        onClick={addRefinanceScenario}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Refinancing Scenario
      </button>
    </div>

    {/* Refinancing Scenarios Summary */}
    {refinanceScenarios.map((scenario, index) => (
      <div key={scenario.id}>
        <h3 className="text-lg font-semibold mb-4">Refinancing Scenario {index + 1}</h3>
        <RefinanceScenarioEditor
          key={scenario.id}
          scenario={summaryData.refinanceScenarios[index]} // Use the enriched data from summaryData
          updateRefinanceScenario={(id, updatedScenario) => {
            setRefinanceScenarios((prev) =>
              prev.map((s) =>
                s.id === id
                  ? { ...s, ...updatedScenario }
                  : s
              )
            );
          }}
          deleteRefinanceScenario={deleteRefinanceScenario}
        />
      </div>
    ))}
    {console.log('Summary Data:', summaryData)}

    {/* Overall totals */}
    <div className="bg-gray-100 p-6 rounded-lg mt-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Overall Totals</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8"> {/* Change to 4 columns */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Interest Paid</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryData.totals.interestPaid)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Principal Paid</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryData.totals.principalPaid)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Equity Built</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryData.totals.totalEquity)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Remaining Balance</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryData.totals.remainingBalance)}</p>
        </div>
      </div>
    </div>
  </div>
)}
      {mortgageData.length > 0 && (
        <div className="space-y-8">
          <PaymentChart data={mortgageData} refinanceScenarios={refinanceScenarios} />
          <BalanceChart data={mortgageData} refinanceScenarios={refinanceScenarios} />
        </div>
      )}
    </div>
  );
};

export default App;