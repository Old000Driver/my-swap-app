import { useState } from "react";
import { Header } from "./Header";
import { Steps } from "./Steps";
import { Step1 } from "./Step1";
import { Step2 } from "./Step2";

type Token = {
  address: string;
  img: string;
  ticker: string;
};

export function AddLiquidity() {
  const [step, setStep] = useState(1);
  const [token1, setToken1] = useState<Token | null>(null);
  const [token2, setToken2] = useState<Token | null>(null);

  const handleTokenSelect = (token: Token | null, position: 1 | 2) => {
    if (position === 1) {
      setToken1(token);
      if (token2 && token2.address === token?.address) {
        setToken2(null);
      }
    } else {
      setToken2(token);
      if (token1 && token1.address === token?.address) {
        setToken1(null);
      }
    }
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleEdit = () => {
    setStep(1);
  };

  const handleReset = () => {
    setToken1(null);
    setToken2(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <Header onReset={handleReset} />
        <div className="flex gap-6">
          <Steps currentStep={step} onStepClick={handleEdit} />
          {step === 1 && (
            <Step1
              token1={token1}
              token2={token2}
              onTokenSelect={handleTokenSelect}
              onNext={handleNext}
            />
          )}
          {step === 2 && token1 && token2 && (
            <Step2 token1={token1} token2={token2} onEdit={handleEdit} />
          )}
        </div>
      </div>
    </div>
  );
}
