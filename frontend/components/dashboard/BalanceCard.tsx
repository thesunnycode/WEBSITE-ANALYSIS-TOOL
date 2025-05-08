import { ArrowUpRight } from "lucide-react";

interface BalanceCardProps {
  balance: number;
  percentageChange: number;
  annualRate: number;
}

export default function BalanceCard({
  balance,
  percentageChange,
  annualRate,
}: BalanceCardProps) {
  const isPositive = percentageChange >= 0;

  return (
    <div className="bg-dark-card rounded-2xl p-6 border border-dark-lighter">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-400 text-sm">Total Balance</h2>
          <div
            className={`flex items-center gap-1 text-sm ${
              isPositive ? "text-accent-green" : "text-accent-red"
            }`}
          >
            <span>
              {isPositive ? "+" : ""}
              {percentageChange.toFixed(2)}%
            </span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold text-white">
            ${balance.toLocaleString()}
          </span>
          <span className="text-gray-400">.50</span>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-400">
        Average annual rate{" "}
        <span className="text-white">${annualRate.toLocaleString()}</span>
      </div>
    </div>
  );
}
