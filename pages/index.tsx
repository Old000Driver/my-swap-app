import { Header } from "./components/Header";
import { Main } from "./components/Main";

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <Header />

      {/* Main Content */}
      <Main />
    </div>
  );
}
