import {
  ArrowPathIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
} from "@/components/ui/icons";
import { SelectTokenDialog } from "@/pages/components/SelectTokenDialog";
import { useState } from "react";
import Image from "next/image";
import tokenList from "@/tokenList.json";

type Props = {
  onNext: () => void;
};

type Token = {
  address: string;
  img: string;
  ticker: string;
};

export const Step1 = ({ onNext }: Props) => {
  const [token1, setToken1] = useState<Token | null>(tokenList[0]);
  const [token2, setToken2] = useState<Token | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentButton, setCurrentButton] = useState<1 | 2 | null>(null);

  const handleSelectToken = (token: any) => {
    if (currentButton === 1) {
      setToken1(token);
      if (token2 && token2.address === token.address) {
        setToken2(null);
      }
    } else if (currentButton === 2) {
      setToken2(token);
      if (token1 && token1.address === token.address) {
        setToken1(null);
      }
    }
    setDialogOpen(false);
  };

  return (
    <div className="w-2/3 bg-gray-900 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-2">选择代币对</h2>
      <p className="text-gray-400 mb-6">
        选择你想要提供流动性的代币。你可以在所有支持的网络上选择代币。
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
              <span>选择代币</span>
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
              <span>选择代币</span>
            )}
          </div>
          <ChevronDownIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">费用等级</h3>
        <p className="text-gray-400 mb-2">
          通过提供流动性赚取的金额。所有 v2 资金池收取 0.3% 的固定费用
        </p>
      </div>
      <button
        onClick={onNext}
        className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-lg font-bold"
      >
        继续
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
