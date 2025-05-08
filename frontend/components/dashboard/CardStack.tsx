"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Card {
  type: "visa" | "mastercard";
  balance: number;
  lastFour: string;
}

interface Transaction {
  id: string;
  type: "payment" | "service";
  name: string;
  amount: number;
  date: string;
  icon?: string;
}

interface CardStackProps {
  cards: Card[];
  transactions: Transaction[];
}

export function CardStack({ cards, transactions }: CardStackProps) {
  return (
    <div className="relative bg-dark-card/20 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-glass overflow-hidden group transition-all duration-300 hover:shadow-glass-hover">
      <div className="absolute inset-0 bg-orange-gradient opacity-20 transition-opacity group-hover:opacity-30" />
      <div className="absolute inset-0 bg-glass-gradient" />
      <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-dark-gradient opacity-50" />

      <div className="relative space-y-6">
        {/* Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-medium">My Cards</h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-1 text-sm text-white bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              + Add new
            </motion.button>
          </div>

          {/* Card Stack */}
          <div className="relative space-y-3">
            {cards.map((card, index) => (
              <motion.div
                key={card.lastFour}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: index * 4 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-dark-lighter to-dark border border-white/5 backdrop-blur-sm hover:shadow-glass transition-all duration-300"
                style={{ zIndex: cards.length - index }}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {card.type === "visa" ? (
                        <Image
                          src="/assets/visa.svg"
                          alt="Visa"
                          width={40}
                          height={13}
                          className="opacity-80"
                        />
                      ) : (
                        <Image
                          src="/assets/mastercard.svg"
                          alt="Mastercard"
                          width={30}
                          height={18}
                          className="opacity-80"
                        />
                      )}
                    </div>
                    <div className="text-sm text-gray-400">Balance</div>
                    <div className="text-xl font-semibold text-white">
                      ${card.balance.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-accent-green text-sm">
                    <span>+3.52%</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Recent Transactions</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              View All
            </motion.button>
          </div>

          <div className="space-y-3">
            {transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-3 rounded-xl bg-dark-lighter/50 hover:bg-dark-lighter transition-all duration-300 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  {transaction.icon ? (
                    <Image
                      src={transaction.icon}
                      alt={transaction.name}
                      width={24}
                      height={24}
                      className="rounded opacity-80"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-sm">
                        {transaction.name[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-white">{transaction.name}</div>
                    <div className="text-xs text-gray-400">
                      {transaction.date}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-sm ${
                    transaction.amount > 0
                      ? "text-accent-green"
                      : "text-accent-red"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : ""}$
                  {Math.abs(transaction.amount).toFixed(2)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
