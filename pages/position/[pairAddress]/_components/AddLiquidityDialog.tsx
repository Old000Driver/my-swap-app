"use client";

import { X } from "lucide-react";
import { DialogContent, DialogClose } from "@/components/ui/dialog";
import { AddLiquidityForm } from "../../create/_components/AddLiquidityForm";
import type { Token } from "../../create/_components/AddLiquidityForm";
import Image from "next/image";
import { useState } from "react";

type Props = {
  pairAddress: string;
  token1: Token;
  token2: Token;
  routerAddress: string;
  onClose?: () => void;
};

export function AddLiquidityDialog({
  pairAddress,
  token1,
  token2,
  routerAddress,
  onClose,
}: Props) {
  const [isTransactionActive, setIsTransactionActive] = useState(false);

  return (
    <DialogContent
      hideCloseButton={true}
      className="sm:max-w-md p-0 bg-gray-900 text-white border-zinc-800 overflow-hidden relative"
      onInteractOutside={(e) => {
        if (isTransactionActive) e.preventDefault();
      }}
      onEscapeKeyDown={(e) => {
        if (isTransactionActive) e.preventDefault();
      }}
    >
      {/* 通过 CSS 隐藏默认的关闭按钮 */}
      <style jsx>{`
        .absolute.right-4.top-4 {
          display: none;
        }
      `}</style>

      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="text-lg font-medium">添加流动性</h2>
        <DialogClose>
          <button
            className="text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isTransactionActive}
            onClick={() => onClose && onClose()}
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>
      </div>

      <div className="p-4">
        {isTransactionActive && (
          <div className="text-yellow-400 text-sm mb-4">
            交易进行中，请等待交易完成...
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
            <span className="text-xs text-zinc-400">在区间内</span>
          </div>
        </div>

        <AddLiquidityForm
          token1={token1}
          token2={token2}
          pairAddress={pairAddress}
          routerAddress={routerAddress}
          onTransactionStatusChange={setIsTransactionActive}
        />
      </div>
    </DialogContent>
  );
}
