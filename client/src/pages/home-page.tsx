import { WalletDashboard } from "@/components/wallet-dashboard";
import { TransactionList } from "@/components/transaction-list";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <WalletDashboard />
        <TransactionList />
      </div>
    </div>
  );
}
