import {
  ArrowPathIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
} from "@/components/ui/icons";
import  SelectTokenDialog  from "@/pages/components/SelectTokenDialog";
import { useState } from "react";
import Image from "next/image";
import tokenList from "@/tokenList.json";

type Props = {
  token1: Token | null;
  token2: Token | null;
  onTokenSelect: (token: Token | null, position: 1 | 2) => void;
  onNext: () => void;
};

type Token = {
  address: string;
  img: string;
  ticker: string;
};

export const Step1 = ({ token1, token2, onTokenSelect, onNext }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentButton, setCurrentButton] = useState<1 | 2 | null>(null);

  const handleSelectToken = (token: Token) => {
    onTokenSelect(token, currentButton as 1 | 2);
    setDialogOpen(false);
  };

  return (
    <div className="w-2/3 bg-gray-900 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-2">Select Token Pair</h2>
      <p className="text-gray-400 mb-6">
        Choose the tokens you want to provide liquidity for. You can select tokens across all supported networks.
      </p>

      <div className="flex gap-4 mb-8">
        <button
          className={`flex items-center justify-between w-1/2 px-4 py-3 rounded-lg ${
            token1 ? "bg-gray-800 hover:bg-gray-700" : "bg-blue-800 text-white"
          }`}
          onClick={() => {
            setCurrentButton(1);
            setDialogOpen(true);
          }}
        >
          <div className="flex items-center gap-2">
            {token1 ? (
              <>
                <Image
                  src={token1.img}
                  alt={token1.ticker}
                  width={24}
                  height={24}
                />
                <span>{token1.ticker}</span>
              </>
            ) : (
              <span>Select Token</span>
            )}
          </div>
          <ChevronDownIcon className="w-5 h-5" />
        </button>

        <button
          className={`flex items-center justify-between w-1/2 px-4 py-3 rounded-lg ${
            token2 ? "bg-gray-800 hover:bg-gray-700" : "bg-blue-800 text-white"
          }`}
          onClick={() => {
            setCurrentButton(2);
            setDialogOpen(true);
          }}
        >
          <div className="flex items-center gap-2">
            {token2 ? (
              <>
                <Image
                  src={token2.img}
                  alt={token2.ticker}
                  width={24}
                  height={24}
                />
                <span>{token2.ticker}</span>
              </>
            ) : (
              <span>Select Token</span>
            )}
          </div>
          <ChevronDownIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">Fee Tier</h3>
        <p className="text-gray-400 mb-2">
          Earn by providing liquidity. All v2 pools charge a fixed fee of 0.3%.
        </p>
      </div>
      <button
        onClick={onNext}
        className={`w-full py-4 rounded-lg font-bold ${
          token1 && token2
            ? "bg-white text-black hover:bg-gray-200"
            : "bg-gray-400 text-gray-700 cursor-not-allowed"
        }`}
        disabled={!token1 || !token2}
      >
        Continue
      </button>

      <SelectTokenDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={handleSelectToken}
        filter="pool"
      />
    </div>
  );
};

export default Step1;
