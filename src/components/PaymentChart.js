import React from 'react';
import Chart from 'react-apexcharts';

const PaymentChart = ({ data, refinanceScenarios }) => {
  const months = data.map((item) => item.month);
  const interestPayments = data.map((item) => item.interest);
  const principalPayments = data.map((item) => item.principal);

  const options = {
    chart: {
      type: 'line',
      zoom: { enabled: false },
      toolbar: { show: false }
    },
    xaxis: {
      categories: months,
      title: { text: 'Month' },
      labels: {
        rotate: -45, // Rotate labels to prevent overlap
        hideOverlappingLabels: true // Hide overlapping labels automatically
      },
      tickAmount: Math.min(12, months.length) // Show only 12 or fewer ticks
    },
    yaxis: {
      title: { text: 'Payment Amount (£)' },
      labels: {
        formatter: (val) => `£${val.toFixed(2)}` // Format Y-axis to 2 decimal places
      }
    },
    stroke: { 
      curve: 'smooth',
      width: 3,
    },
    
    tooltip: {
      y: { formatter: (val) => `£${val.toFixed(2)}` }
    },
    annotations: {
      xaxis: refinanceScenarios.map((scenario, index) => {
        const month = data.find((d) => d.scenarioIndex === index + 1)?.month;
        return month
          ? {
              x: month,
              borderColor: '#888',
              label: {
                text: `Refinance ${index + 1}`,
                style: { fontSize: '12px' }
              }
            }
          : null;
      }).filter(Boolean)
    },
    responsive: [
      {
        breakpoint: 768, // For screens smaller than 768px
        options: {
          chart: {
            height: 300 // Adjust chart height
          },
          xaxis: {
            labels: { rotate: -30 } // Reduce label rotation for smaller screens
          }
        }
      },
      {
        breakpoint: 480, // For very small screens
        options: {
          chart: {
            height: 250
          },
          xaxis: {
            labels: { rotate: 0 } // No rotation for very small screens
          }
        }
      }
    ]
  };

  const series = [
    { name: 'Interest Payment', data: interestPayments },
    { name: 'Principal Payment', data: principalPayments }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Monthly Payment Components</h2>
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default PaymentChart;