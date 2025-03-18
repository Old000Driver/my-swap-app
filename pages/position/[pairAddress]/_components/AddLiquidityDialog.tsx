"use client";

import { X } from "lucide-react";
import { DialogContent, DialogClose } from "@/components/ui/dialog";
import AddLiquidityForm from "../../create/_components/AddLiquidityForm";
import type { Token } from "../../create/_components/AddLiquidityForm";
import Image from "next/image";
import { useState } from "react";

type Props = {
  pairAddress: string;
  token1: Token;
  token2: Token;
  routerAddress: string;
  onTransactionStatusChange?: (isActive: boolean) => void; // 新增回调类型
};

export default function AddLiquidityDialog({
  pairAddress,
  token1 = { address: "", img: "", ticker: "" },
  token2 = { address: "", img: "", ticker: "" },
  routerAddress,
  onTransactionStatusChange,
}: Props) {
  const [isTransactionActive, setIsTransactionActive] = useState(false);

  const handleTransactionStatusChange = (isActive: boolean) => {
    setIsTransactionActive(isActive);
    onTransactionStatusChange?.(isActive); // 通知父组件
  };

  return (
    <div>

      

      <div className="p-4">
        {isTransactionActive && (
          <div className="text-yellow-400 text-sm mb-4">
            Transaction in progress, please wait for it to complete...
          </div>
        )}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Image src={token1.img} alt="" width={24} height={24} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black border border-zinc-800 rounded-full flex items-center justify-center">
                <Image src={token2.img} alt="" width={16} height={16} />
              </div>
            </div>
            <span className="font-bold">{`${token1.ticker} / ${token2.ticker}`}</span>
          </div>
          <span className="text-xs px-1.5 py-0.5 bg-zinc-800 rounded">v2</span>
          <div className="flex items-center gap-1 ml-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-zinc-400">In Range</span>
          </div>
        </div>

        <AddLiquidityForm
          token1={token1}
          token2={token2}
          pairAddress={pairAddress}
          routerAddress={routerAddress}
          onTransactionStatusChange={handleTransactionStatusChange}
        />
      </div>
   </div>
  );
}
