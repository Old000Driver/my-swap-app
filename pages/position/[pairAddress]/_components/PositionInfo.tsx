import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Lock, X } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAccount, useReadContract } from "wagmi";
import { pair_ABI } from "@/resource.js"; // 假设 ABI 定义在此处
import { routerAddress } from "@/resource.js";
import { RemoveLiquidityForm } from "./RemoveLiquidityForm";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { AddLiquidityDialog } from "./AddLiquidityDialog";
import tokenList from "@/tokenList.json";
import type { Token } from "@/types";

export function PositionInfo() {
  const router = useRouter();
  const { pairAddress } = router.query;
  const { address: userAddress } = useAccount();
  const [open, setOpen] = useState(false);
  const [token0Token, setToken0Token] = useState<Token | null>(null);
  const [token1Token, setToken1Token] = useState<Token | null>(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);
  const [isTransactionActiveAdd, setIsTransactionActiveAdd] = useState(false);
  const [isTransactionActiveRemove, setIsTransactionActiveRemove] =
    useState(false);

  const erc20_ABI = [
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const [positionData, setPositionData] = useState<{
    pairName: string;
    pairToken0: string;
    pairToken1: string;
    lpBalance: bigint;
    reserves: [bigint, bigint];
    token0Decimals: number;
    token1Decimals: number;
  } | null>(null);

  // 获取 Pair 合约数据
  const { data: token0Address } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: pair_ABI,
    functionName: "token0",
  });
  const { data: token1Address } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: pair_ABI,
    functionName: "token1",
  });
  const { data: lpBalance } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: pair_ABI,
    functionName: "balanceOf",
    args: [userAddress],
  });
  const { data: reservesData } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: pair_ABI,
    functionName: "getReserves",
  }) as { data: [bigint, bigint, number] | undefined };
  const { data: totalSupply } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: pair_ABI,
    functionName: "totalSupply",
  });

  // 获取代币符号和小数位
  const { data: token0Symbol } = useReadContract({
    address: token0Address as `0x${string}`,
    abi: erc20_ABI,
    functionName: "symbol",
  });
  const { data: token1Symbol } = useReadContract({
    address: token1Address as `0x${string}`,
    abi: erc20_ABI,
    functionName: "symbol",
  });
  const { data: token0Decimals } = useReadContract({
    address: token0Address as `0x${string}`,
    abi: erc20_ABI,
    functionName: "decimals",
  });
  const { data: token1Decimals } = useReadContract({
    address: token1Address as `0x${string}`,
    abi: erc20_ABI,
    functionName: "decimals",
  });

  const handleCloseAddDialog = () => {
    if (!isTransactionActiveAdd) setOpenAdd(false);
  };

  const handleCloseRemoveDialog = () => {
    if (!isTransactionActiveRemove) setOpenRemove(false);
  };

  // 组合数据
  useEffect(() => {
    if (
      token0Symbol &&
      token1Symbol &&
      lpBalance &&
      reservesData &&
      token0Decimals &&
      token1Decimals
    ) {
      tokenList.forEach((token) => {
        if (token.address === token0Address) {
          if (token.ticker === "WETH") token = tokenList[0];
          setToken0Token(token);
        }
        if (token.address === token1Address) {
          if (token.ticker === "WETH") token = tokenList[0];
          setToken1Token(token);
        }
      });
      setPositionData({
        pairName: `${token0Symbol} / ${token1Symbol}`,
        pairToken0: token0Symbol as string,
        pairToken1: token1Symbol as string,
        lpBalance: lpBalance as bigint,
        reserves: [reservesData[0], reservesData[1]],
        token0Decimals: token0Decimals as number,
        token1Decimals: token1Decimals as number,
      });
    }
  }, [
    token0Symbol,
    token1Symbol,
    lpBalance,
    reservesData,
    token0Decimals,
    token1Decimals,
  ]);

  if (!positionData || !pairAddress || !userAddress) {
    return (
      <div className="min-h-screen w-screen bg-black text-white p-6">
        <div className="max-w-2xl mx-auto p-4 border border-gray-700 rounded-3xl">
          <div className="flex items-center text-gray-400 mb-6">
            <div className="h-6 bg-gray-700 rounded w-1/3 animate-pulse"></div>
            <ChevronRight className="h-4 w-4 mx-1" />
            <div className="h-6 bg-gray-700 rounded w-1/6 animate-pulse"></div>
          </div>

          <div className="flex items-center mb-6">
            <div className="relative h-12 w-12 mr-3 bg-gray-700 rounded-full animate-pulse"></div>
            <div>
              <div className="flex items-center">
                <div className="h-6 bg-gray-700 rounded w-1/2 animate-pulse mr-2"></div>
                {/* <Badge variant="outline" className="bg-gray-800 text-xs h-5">
                  v2
                </Badge> */}
              </div>
              <div className="flex items-center mt-1">
                <span className="h-2 w-2 bg-gray-700 rounded-full mr-2 animate-pulse"></span>
                <span className="h-4 bg-gray-700 rounded w-1/4 animate-pulse"></span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-gray-700 rounded-full w-1/3 animate-pulse"></div>
            <div className="h-10 bg-gray-700 rounded-full w-1/3 animate-pulse"></div>
          </div>

          <Card className="bg-gray-900 border-gray-800 p-6 text-white rounded-xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="h-6 bg-gray-700 rounded w-1/3 animate-pulse"></span>
                <span className="h-6 bg-gray-700 rounded w-1/4 animate-pulse"></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="h-6 bg-gray-700 rounded w-1/3 animate-pulse"></span>
                <div className="flex items-center">
                  <span className="h-6 bg-gray-700 rounded w-1/4 animate-pulse mr-2"></span>
                  <div className="h-6 w-6 bg-gray-700 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="h-6 bg-gray-700 rounded w-1/3 animate-pulse"></span>
                <div className="flex items-center">
                  <span className="h-6 bg-gray-700 rounded w-1/4 animate-pulse mr-2"></span>
                  <div className="h-6 w-6 bg-gray-700 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="h-6 bg-gray-700 rounded w-1/3 animate-pulse"></span>
                <div className="flex items-center">
                  <span className="h-6 bg-gray-700 rounded w-1/4 animate-pulse mr-2"></span>
                  <div className="h-6 w-6 bg-gray-700 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="h-6 bg-gray-700 rounded w-1/3 animate-pulse"></span>
                <span className="h-6 bg-gray-700 rounded w-1/4 animate-pulse"></span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 计算各项值
  const lpBalanceFormatted = ethers.formatUnits(positionData.lpBalance, 18);
  const token0Amount = ethers.formatUnits(
    positionData.reserves[0],
    positionData.token0Decimals
  );
  const token1Amount = ethers.formatUnits(
    positionData.reserves[1],
    positionData.token1Decimals
  );
  const totalValue = (
    Number(token0Amount) * 0.1 + // 模拟价格 $0.1 per LINK
    Number(token1Amount) * 5000
  ) // 模拟价格 $5000 per ETH
    .toFixed(2);
  const poolShare = totalSupply
    ? (
        (Number(ethers.formatUnits(lpBalance as bigint, 18)) /
          Number(ethers.formatUnits(totalSupply as bigint, 18))) *
        100
      ).toFixed(2)
    : "0";

  // 代币图片
  const token0Image =
    positionData.pairToken0 === "LINK"
      ? "https://cdn.moralis.io/eth/0x514910771af9ca656af840dff83e8264ecf986ca.png"
      : "https://token-icons.s3.amazonaws.com/eth.png";
  const token1Image =
    positionData.pairToken1 === "ETH" || "WETH"
      ? "https://token-icons.s3.amazonaws.com/eth.png"
      : "https://cdn.moralis.io/eth/0x514910771af9ca656af840dff83e8264ecf986ca.png";
  const pairImage =
    "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png";

  return (
    <div className="w-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto p-4 border border-gray-700 rounded-3xl">
        <div className="flex items-center text-gray-400 mb-6">
          <span
            onClick={() => router.push("/position")}
            className="cursor-pointer"
          >
            Your Position
          </span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-white">
            {pairAddress.toString().slice(0, 6)}...
            {pairAddress.toString().slice(-4)}
          </span>
        </div>

        <div className="flex items-center mb-6">
          <div className="relative h-12 w-12 mr-3">
            <Image
              src={token0Token?.img || ""}
              alt={`${positionData.pairName} pair`}
              width={48}
              height={48}
              className="rounded-full bg-gray-800"
            />
            <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
              <Image
                src={token1Token?.img || ""}
                alt=""
                width={16}
                height={16}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold mr-2">
                {positionData.pairName}
              </h1>
              <Badge variant="outline" className="bg-gray-800 text-xs h-5">
                v2
              </Badge>
            </div>
            <div className="flex items-center mt-1">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
              <span className="text-sm text-gray-400">In Range</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div className="flex gap-3 mb-6">
                <Button
                  variant="outline"
                  className="rounded-full bg-gray-900 border-gray-700 hover:bg-white hover:text-black"
                  onClick={() => setOpen(true)}
                >
                  Add Liquidity
                </Button>
              </div>
            </DialogTrigger>
            <AddLiquidityDialog
              token1={token0Token!}
              token2={token1Token!}
              pairAddress={pairAddress as string}
              routerAddress={routerAddress}
            />
          </Dialog>

          <Dialog
            open={openRemove}
            onOpenChange={(newOpen) =>
              !isTransactionActiveRemove && setOpenRemove(newOpen)
            }
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full bg-gray-900 border-gray-700 hover:bg-white hover:text-black"
                onClick={() => setOpenRemove(true)}
              >
                Remove Liquidity
              </Button>
            </DialogTrigger>
            <DialogContent hideCloseButton={true} className="sm:max-w-md p-0 bg-gray-900 text-white border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <h2 className="text-lg font-medium">Remove Liquidity</h2>
                <DialogClose asChild>
                  <button
                    className="text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isTransactionActiveRemove}
                    onClick={handleCloseRemoveDialog}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </DialogClose>
              </div>
              <div className="p-4">
                <RemoveLiquidityForm
                  token1={token0Token!}
                  token2={token1Token!}
                  pairAddress={pairAddress as string}
                  routerAddress={routerAddress}
                  onTransactionStatusChange={setIsTransactionActiveRemove}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-gray-900 border-gray-800 p-6 text-white rounded-xl">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Position Value</span>
              <span className="text-xl font-medium">US${totalValue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Your Pool Token Balance:</span>
              <div className="flex items-center">
                <span className="mr-2">
                  {Number(lpBalanceFormatted).toFixed(2)}
                </span>
                <div className="bg-gray-800 rounded-full p-1">
                  <Image
                    src={pairImage}
                    alt="LP Token"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">
                Deposited {positionData.pairToken0}
              </span>
              <div className="flex items-center">
                <span className="mr-2">{Number(token0Amount).toFixed(2)}</span>
                <div className="bg-gray-800 rounded-full p-1">
                  <Image
                    src={token0Image}
                    alt={positionData.pairToken0}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">
                Deposited {positionData.pairToken1}
              </span>
              <div className="flex items-center">
                <span className="mr-2">{Number(token1Amount).toFixed(2)}</span>
                <div className="bg-gray-800 rounded-full p-1">
                  <Image
                    src={token1Image}
                    alt={positionData.pairToken1}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pool Share</span>
              <span>{poolShare}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
