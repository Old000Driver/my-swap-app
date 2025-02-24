"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectTokenDialog } from "./SelectTokenDialog";
import { ReactElement, useState } from "react";
import { ChevronDown, ArrowDown } from "lucide-react";

import tokenList from "@/tokenList.json";

export const Swap = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [selectedPayToken, setSelectedPayToken] = useState(
    tokenList.find((token) => token.ticker === "WETH")
  );
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [tokenOneAmount, setTokenOneAmount] = useState(""); // 用户想要支付的代币数量
  const [tokenTwoAmount, setTokenTwoAmount] = useState(""); // 用户将收到的代币数量

  const handleSwapTokens = () => {
    const tempToken = selectedPayToken;
    setSelectedPayToken(selectedToken);
    setSelectedToken(tempToken);
  };

  function changeAmount(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    
    // 空值允许
    if (value === '') {
      setTokenOneAmount('');
      return;
    }

    // 校验规则：
    // 1. 只允许数字和小数点
    // 2. 第一位不能是小数点
    // 3. 不允许多个小数点
    // 4. 小数位数不能超过18位
    const regex = /^\d*\.?\d{0,18}$/;
    
    if (regex.test(value)) {
      setTokenOneAmount(value);
    }
  }

  return (
    <div>
      <div className="space-y-2">
        <div className="text-sm text-gray-400">You pay</div>
        <div className="flex items-center justify-between bg-gray-800 rounded-2xl p-4">
          <Input
            type="text"
            inputMode="decimal"
            value={tokenOneAmount}
            placeholder="0.0"
            className="border-0 bg-transparent text-2xl w-1/2 p-0 focus-visible:ring-0"
            onChange={changeAmount}
          />
          <Button
            variant="ghost"
            className="hover:bg-gray-700  h-9 px-3 border border-gray-700 rounded-2xl"
            onClick={() => setPayDialogOpen(true)}
          >
            <div className="flex items-center">
              <Image
                src={selectedPayToken?.img || ""}
                alt={selectedPayToken?.ticker || ""}
                width={24}
                height={24}
                className="rounded-full mr-2"
              />
              <span>{selectedPayToken?.ticker}</span>
              <span className="ml-2">
                <ChevronDown />
              </span>
            </div>
          </Button>
        </div>
      </div>

      <div className="relative my-2">
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 p-1 rounded-lg border border-gray-800">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-100"
            onClick={handleSwapTokens}
          >
            <ArrowDown />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-400">You receive</div>
        <div className="flex items-center justify-between bg-gray-800 rounded-2xl p-4">
          <Input
            type="text"
            value="0"
            className="border-0 bg-transparent text-2xl w-1/2 p-0 focus-visible:ring-0"
          />
          {selectedToken ? (
            <Button
              variant="ghost"
              className="hover:bg-gray-700 h-9 px-3 border border-gray-700 rounded-2xl"
              onClick={() => setDialogOpen(true)}
            >
              <div className="flex items-center">
                <Image
                  src={selectedToken.img}
                  alt={selectedToken.ticker}
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
                <span>{selectedToken.ticker}</span>
                <span className="ml-2">
                  <ChevronDown />
                </span>
              </div>
            </Button>
          ) : (
            <Button
              className="bg-purple-600 hover:bg-purple-700 rounded-2xl flex items-center gap-2"
              onClick={() => setDialogOpen(true)}
            >
              Select token
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <SelectTokenDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={setSelectedToken}
      />

      <SelectTokenDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        onSelect={setSelectedPayToken}
      />
    </div>
  );
};
