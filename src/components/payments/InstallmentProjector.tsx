"use client"

import { useState, useMemo } from "react"
import { Calendar, DollarSign, ArrowRight, Info } from "lucide-react"

interface InstallmentProjectorProps {
  totalAmount: number
  minDepositPercentage: number
  annualInterestRate: number
}

export function InstallmentProjector({ 
  totalAmount, 
  minDepositPercentage = 20, 
  annualInterestRate = 12 
}: InstallmentProjectorProps) {
  const [months, setMonths] = useState(6)
  const [depositPercent, setDepositPercent] = useState(minDepositPercentage)

  const projection = useMemo(() => {
    const depositAmount = (depositPercent / 100) * totalAmount
    const principal = totalAmount - depositAmount
    const monthlyRate = (annualInterestRate / 100) / 12
    
    // Equated Monthly Installment (EMI) formula
    // EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1)
    
    const totalPayable = depositAmount + (emi * months)
    const totalInterest = totalPayable - totalAmount

    return {
      depositAmount,
      emi,
      totalPayable,
      totalInterest,
      installments: Array.from({ length: months }).map((_, i) => ({
        month: i + 1,
        amount: emi,
        date: new Date(new Date().setMonth(new Date().getMonth() + i + 1))
      }))
    }
  }, [totalAmount, depositPercent, months, annualInterestRate])

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 p-6 text-white">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-jungle-400" />
          Installment Projector
        </h3>
        <p className="text-slate-400 text-xs mt-1">Configure your flexible payment timeline.</p>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-bold text-slate-700">Duration (Months)</label>
                <span className="text-sm font-black text-jungle-700">{months} Months</span>
              </div>
              <input 
                type="range" min="3" max="24" step="3" 
                value={months} onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-jungle-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>3m</span>
                <span>12m</span>
                <span>24m</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-bold text-slate-700">Deposit Percentage</label>
                <span className="text-sm font-black text-jungle-700">{depositPercent}%</span>
              </div>
              <input 
                type="range" min={minDepositPercentage} max="80" step="5" 
                value={depositPercent} onChange={(e) => setDepositPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-jungle-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>Min {minDepositPercentage}%</span>
                <span>80%</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <span className="text-sm text-slate-500">Initial Deposit</span>
              <span className="font-bold text-slate-900">KES {projection.depositAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <span className="text-sm text-slate-500">Monthly EMI</span>
              <span className="font-bold text-jungle-700">KES {projection.emi.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Total Interest ({annualInterestRate}%)</span>
              <span className="font-bold text-slate-900">KES {projection.totalInterest.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Schedule</h4>
          <div className="space-y-2 max-h-48 overflow-auto pr-2">
            {projection.installments.map((inst) => (
              <div key={inst.month} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {inst.month}
                  </span>
                  <span className="font-medium text-slate-600">
                    {inst.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <span className="font-bold text-slate-900">KES {inst.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">
            This projection is for informational purposes. Final terms will be subject to supplier approval and contract signing.
          </p>
        </div>
      </div>
    </div>
  )
}
