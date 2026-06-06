import { useState } from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import { IndianRupee, Landmark, Calculator, AlertCircle, Percent } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EducationLoan() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(7);

  // EMI calculation logic
  const calculateEMI = () => {
    const P = amount;
    const r = (rate / 12) / 100;
    const n = tenure * 12;
    if (r === 0) return (P / n).toFixed(0);
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return isNaN(emi) ? 0 : emi.toFixed(0);
  };

  const emi = Number(calculateEMI());
  const totalPayable = emi * tenure * 12;
  const interestPayable = totalPayable - amount;

  const banks = [
    { name: 'State Bank of India (SBI)', product: 'SBI Student Loan Scheme', rate: '8.15% - 9.5%', maxAmount: 'Up to ₹20L', collateral: 'Not req. up to ₹7.5L' },
    { name: 'HDFC Bank', product: 'HDFC Education Loan', rate: '9.25% - 10.5%', maxAmount: 'Up to ₹45L', collateral: 'Varies on amount' },
    { name: 'ICICI Bank', product: 'ICICI iLoans for Education', rate: '9.5% - 11.2%', maxAmount: 'Up to ₹1 Crore', collateral: 'Secured/Unsecured options' },
  ];

  const handleApplyLoan = (bankName) => {
    toast.success(`Loan application initialized with ${bankName}! You will receive an eligibility consultation call.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <PublicNavbar />

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-3">
          <span className="badge badge-primary text-xs uppercase font-extrabold px-3 py-1 rounded-full">Financial Aid</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Education Loan Support
          </h1>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Calculate your study expenses, estimate interest rates, and find the lowest cost student loans to fund your higher education goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* EMI Calculator Widget */}
          <div className="lg:col-span-3 card bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800 shadow-md p-6 space-y-6">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 uppercase tracking-wide border-b border-gray-150 dark:border-slate-800 pb-3 flex items-center gap-1.5">
              <Calculator className="w-5 h-5 text-primary-500" />
              Interactive EMI Calculator
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">
                  <span>Loan Amount (Principal)</span>
                  <span className="font-mono text-primary-600">₹{amount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="3000000"
                  step="50000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-primary-600 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">
                    <span>Interest Rate (p.a.)</span>
                    <span className="font-mono text-primary-600">{rate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="18"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full accent-primary-600 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">
                    <span>Loan Tenure</span>
                    <span className="font-mono text-primary-600">{tenure} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full accent-primary-600 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Calculations Output */}
            <div className="grid grid-cols-3 gap-3 border-t border-gray-100 dark:border-slate-750 pt-5 text-center">
              <div className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-gray-400">Monthly EMI</span>
                <div className="text-sm md:text-base font-black text-gray-800 dark:text-white mt-1 font-mono">
                  ₹{emi.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-gray-400">Total Interest</span>
                <div className="text-sm md:text-base font-black text-amber-600 mt-1 font-mono">
                  ₹{interestPayable.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-gray-400">Total Payable</span>
                <div className="text-sm md:text-base font-black text-primary-600 mt-1 font-mono">
                  ₹{totalPayable.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Loan details & bank compare */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card space-y-5">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1">
                <Landmark className="w-5 h-5 text-violet-500" />
                Featured Lenders
              </h3>

              <div className="space-y-4">
                {banks.map((bank, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-3 hover:border-gray-250 transition-colors">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">{bank.name}</h4>
                        <span className="text-[10px] font-black text-emerald-600 font-mono bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                          {bank.rate}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{bank.product}</p>
                      <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-2 font-medium">
                        Limit: {bank.maxAmount} · {bank.collateral}
                      </p>
                    </div>

                    <button
                      onClick={() => handleApplyLoan(bank.name)}
                      className="btn btn-ghost border-gray-200 dark:border-slate-850 hover:bg-white text-[10px] py-1.5 font-bold text-center"
                    >
                      Apply via UniScholar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
