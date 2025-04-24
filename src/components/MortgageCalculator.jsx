// src/components/MortgageCalculator.jsx
// src/components/MortgageCalculator.jsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import MortgageInputs from './MortgageInputs';
import PaymentChart from './PaymentChart';
import BalanceChart from './BalanceChart';
import RefinanceScenarioEditor from './RefinanceScenarioEditor';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Edit as EditIcon } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const MortgageCalculator = () => {
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

  const [editingScenarioId, setEditingScenarioId] = useState(null);
  const [appreciationRange, setAppreciationRange] = useState([1, 5]);

  const [sellMonth, setSellMonth] = useState(1);
  const [transactionFees, setTransactionFees] = useState(0);
  const [feeInput, setFeeInput] = useState(
    0..toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );

  const saleAnalysis = useMemo(() => {
    if (!mortgageData.length || !summaryData) return null;
    const month = Math.min(Math.max(1, sellMonth), mortgageData[mortgageData.length-1].month);
    const pt = mortgageData.find(p => p.month === month);
    if (!pt) return null;
    const salePrice = pt.price;
    const remainingBalance = pt.balance;
    const netProceedsBeforeInterest = salePrice - remainingBalance;
    const cashOutBeforeInterest = summaryData.initialDetails.depositAmount + transactionFees;
    const profitBeforeInterest = netProceedsBeforeInterest - cashOutBeforeInterest;
    const interestPaid = mortgageData
      .filter(p => p.month <= month)
      .reduce((sum, p) => sum + p.interest, 0);
    const profitAfterInterest = profitBeforeInterest - interestPaid;
    // Compute ROI and IRR
    const roi = profitAfterInterest / cashOutBeforeInterest;
    const irr = Math.pow(
      (profitAfterInterest + cashOutBeforeInterest) / cashOutBeforeInterest,
      1 / (month / 12)
    ) - 1;
    return {
      salePrice,
      remainingBalance,
      netProceedsBeforeInterest,
      cashOutBeforeInterest,
      profitBeforeInterest,
      interestPaid,
      profitAfterInterest,
      roi,
      irr,
    };
  }, [mortgageData, summaryData, sellMonth, transactionFees]);

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
            totalEquity: deposit + totalPrincipalPaid,
            scenarioIndex: index + 1,
          });
        }
  
        scenarioSummaries.push({
          id: scenario.id,
          startBalance: scenarioStartBalance,
          monthlyPayment,
          interestPaid: scenarioInterest,
          principalPaid: scenarioPrincipal + scenario.overpayment,
          endBalance: balance,
          overpayment: scenario.overpayment,
          newRate: scenario.newRate,
          refinanceFixedPeriod: scenario.refinanceFixedPeriod,
          newTerm: scenario.newTerm,
        });
  
        lastScenarioEnd += scenario.refinanceFixedPeriod * 12;
      });
  
      // apply price appreciation per year within selected range
      const years = Math.ceil(data.length / 12);
      const annualRates = Array.from({ length: years }, () =>
        Math.random() * (appreciationRange[1] - appreciationRange[0]) + appreciationRange[0]
      );
      let price = inputs.purchasePrice;
      data.forEach(pt => {
        const yearIndex = Math.floor((pt.month - 1) / 12);
        const monthlyRate = Math.pow(1 + annualRates[yearIndex] / 100, 1/12) - 1;
        price *= 1 + monthlyRate;
        pt.price = price;
        // equity = current house value minus remaining balance
        pt.totalEquity = pt.price - pt.balance;
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
          totalEquity: deposit + totalPrincipalPaid,
          remainingBalance: balance,
        },
      });
    };
  
    calculateMortgageData();
  }, [inputs, refinanceScenarios, appreciationRange]);

  const deleteRefinanceScenario = (id) => {
    setRefinanceScenarios((prev) => prev.filter((scenario) => scenario.id !== id));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Mortgage Calculator</h1>
      
      <MortgageInputs
        inputs={inputs}
        setInputs={setInputs}
        handleNumberInput={handleNumberInput}
        handleInterestRateInput={handleInterestRateInput}
      />
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Price Appreciation</CardTitle>
          <CardDescription>Select annual growth range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Growth: {appreciationRange[0]}% – {appreciationRange[1]}%</Label>
          <Slider
            value={appreciationRange}
            min={1}
            max={15}
            step={1}
            onValueChange={setAppreciationRange}
            marks={[
              { value: 1, label: '1%' },
              { value: 6, label: '6%' },
              { value: 11, label: '11%' },
            ]}
          />
        </CardContent>
      </Card>

      {/* Summary section */}
      {summaryData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Initial period summary */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Initial Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Deposit Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(summaryData.initialDetails.depositAmount)}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Initial Loan Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(summaryData.initialDetails.loanAmount)}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                  <p className="text-xl font-bold">{formatCurrency(summaryData.initialPeriod.monthlyPayment)}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Interest Paid</p>
                  <p className="text-xl font-bold">{formatCurrency(summaryData.initialPeriod.totalInterest)}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Principal Paid</p>
                  <p className="text-xl font-bold">{formatCurrency(summaryData.initialPeriod.totalPrincipal)}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Remaining Balance</p>
                  <p className="text-xl font-bold">{formatCurrency(summaryData.initialPeriod.remainingBalance)}</p>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            {/* Refinancing Scenarios Title and Button */}
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-semibold">Refinancing Scenarios</h3>
              <Button onClick={addRefinanceScenario} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Refinancing Scenario
              </Button>
            </div>

            <Separator className="my-8" />

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Fixed Term</TableHead>
                  <TableHead>Remaining Term</TableHead>
                  <TableHead>Monthly Payment</TableHead>
                  <TableHead>Interest Paid</TableHead>
                  <TableHead>Principal Paid</TableHead>
                  <TableHead>Overpayment</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryData.refinanceScenarios.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.newRate}%</TableCell>
                    <TableCell>{s.refinanceFixedPeriod} yrs</TableCell>
                    <TableCell>{s.newTerm} yrs</TableCell>
                    <TableCell>{formatCurrency(s.monthlyPayment)}</TableCell>
                    <TableCell>{formatCurrency(s.interestPaid)}</TableCell>
                    <TableCell>{formatCurrency(s.principalPaid)}</TableCell>
                    <TableCell>{formatCurrency(s.overpayment)}</TableCell>
                    <TableCell>
                      <Button size="xs" variant="outline" onClick={() => setEditingScenarioId(s.id)} className="p-2">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Drawer
              direction="right"
              open={editingScenarioId !== null}
              onOpenChange={(open) => { if (!open) setEditingScenarioId(null); }}
            >
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Edit Scenario</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  {editingScenarioId && (
                    <RefinanceScenarioEditor
                      scenario={summaryData.refinanceScenarios.find(s => s.id === editingScenarioId)}
                      updateRefinanceScenario={(id, upd) => {
                        setRefinanceScenarios(rs => rs.map(r => r.id === id ? {...r, ...upd} : r));
                        setEditingScenarioId(null);
                      }}
                      deleteRefinanceScenario={(id) => {
                        deleteRefinanceScenario(id);
                        setEditingScenarioId(null);
                      }}
                    />
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </CardContent>
        </Card>
      )}
      
      {mortgageData.length > 0 && (
        <div className="space-y-8">
          <PaymentChart data={mortgageData} refinanceScenarios={refinanceScenarios} />
          <BalanceChart data={mortgageData} refinanceScenarios={refinanceScenarios} />
          {saleAnalysis && (
            <Card className="mt-8">
              <CardHeader><CardTitle>Sale Analysis</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sellMonth">Sell Month</Label>
                    <Input
                      id="sellMonth"
                      type="number"
                      value={sellMonth}
                      min={1}
                      max={mortgageData[mortgageData.length-1].month}
                      onChange={e => {
                        // remove any leading zeros before parsing
                        const raw = e.target.value.replace(/^0+(?=\d)/, '');
                        const num = raw === '' ? 0 : Number(raw);
                        setSellMonth(num);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fees">Transaction Fees (£)</Label>
                    <Input
                      id="fees"
                      type="text"
                      value={feeInput}
                      onFocus={() => {
                        // show raw number when editing
                        setFeeInput(transactionFees.toString());
                      }}
                      onChange={(e) => {
                        // allow only digits and decimal point
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        setFeeInput(raw);
                        setTransactionFees(Number(raw) || 0);
                      }}
                      onBlur={() => {
                        // format with GBP separators on blur
                        setFeeInput(
                          transactionFees.toLocaleString('en-GB', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-muted p-4 rounded">
                    <p className="text-sm text-muted-foreground">Sale Price</p>
                    <p className="text-xl font-bold">{formatCurrency(saleAnalysis.salePrice)}</p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <p className="text-sm text-muted-foreground">Net Proceeds (before interest)</p>
                    <p className="text-xl font-bold">{formatCurrency(saleAnalysis.netProceedsBeforeInterest)}</p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <p className="text-sm text-muted-foreground">Cash Out (before interest)</p>
                    <p className="text-xl font-bold">{formatCurrency(saleAnalysis.cashOutBeforeInterest)}</p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <p className="text-sm text-muted-foreground">Profit (before interest)</p>
                    <p className="text-xl font-bold">{formatCurrency(saleAnalysis.profitBeforeInterest)}</p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <p className="text-sm text-muted-foreground">Profit (after interest)</p>
                    <p className="text-xl font-bold">{formatCurrency(saleAnalysis.profitAfterInterest)}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold">Performance Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="bg-muted p-4 rounded">
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="text-xl font-bold">{(saleAnalysis.roi * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-muted p-4 rounded">
                      <p className="text-sm text-muted-foreground">IRR (annual)</p>
                      <p className="text-xl font-bold">{(saleAnalysis.irr * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default MortgageCalculator;