import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { parseUnits, formatUnits } from "ethers";
import { ethers } from "ethers";
import { route02_ABI, pair_ABI } from "@/resource.js";
import { useRouter } from "next/navigation";
import { config } from "@/wagmi";

export type Token = {
  address: string;
  img: string;
  ticker: string;
};

type RemoveLiquidityFormProps = {
  token1: Token;
  token2: Token;
  pairAddress: string;
  routerAddress: string;
  onTransactionStatusChange?: (isActive: boolean) => void;
};

export const RemoveLiquidityForm = ({
  token1,
  token2,
  pairAddress,
  routerAddress,
  onTransactionStatusChange,
}: RemoveLiquidityFormProps) => {
  const { address } = useAccount();
  const { writeContract, isPending: isPendingWrite } = useWriteContract();
  const router = useRouter();

  const [lpAmount, setLpAmount] = useState<string>("");
  const [isProcessStarted, setIsProcessStarted] = useState(false);
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>(
    undefined
  );
  const [removeTxHash, setRemoveTxHash] = useState<`0x${string}` | undefined>(
    undefined
  );

  const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const { isSuccess: isRemoveConfirmed } = useWaitForTransactionReceipt({
    hash: removeTxHash,
  });

  const isToken1ETH =
    token1.ticker === "ETH" ||
    token1.address === "0x0000000000000000000000000000000000000000";
  const isToken2ETH =
    token2.ticker === "ETH" ||
    token2.address === "0x0000000000000000000000000000000000000000";

  // 获取用户 LP 代币余额
  const { data: lpBalance } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: pair_ABI,
    functionName: "balanceOf",
    args: [address],
  })as { data: bigint | undefined };

  // 获取储备量和总供应量
  type Reserves = [bigint, bigint, number];
  const { data: reserves } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: pair_ABI,
    functionName: "getReserves",
  }) as { data: Reserves | undefined };
  const { data: totalSupply } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: pair_ABI,
    functionName: "totalSupply",
  })as { data: bigint | undefined };

  console.log("🔔",typeof lpBalance, typeof totalSupply);

  const lpBalanceFormatted = lpBalance ? formatUnits(lpBalance, 18) : "0.00";

  const validateInput = (value: string): string => {
    let cleanedValue = value.replace(/^0+(?=\d)/, "").replace(/[^0-9.]/g, "");
    const parts = cleanedValue.split(".");
    if (parts.length > 2)
      cleanedValue = parts[0] + "." + parts.slice(1).join("");
    if (parts[1]) cleanedValue = parts[0] + "." + parts[1].slice(0, 6);
    if (cleanedValue === "" || cleanedValue === ".") return "";
    return cleanedValue;
  };

  const handleLpInput = (value: string) => {
    const validatedValue = validateInput(value);
    setLpAmount(validatedValue);
  };

  const lpExceedsBalance =
    lpAmount !== "" && Number(lpAmount) > Number(lpBalanceFormatted);
  const isAmountEntered = lpAmount !== "";

  const calculateReturns = () => {
    if (!lpAmount || !reserves || !totalSupply)
      return { amount1: "0", amount2: "0" };
    const liquidity = parseUnits(lpAmount, 18);
    const amount1 = (BigInt(liquidity) * reserves[0]) / BigInt(totalSupply);
    const amount2 = (BigInt(liquidity) * reserves[1]) / BigInt(totalSupply);
    return {
      amount1: formatUnits(amount1, 18),
      amount2: formatUnits(amount2, 18),
    };
  };

  const { amount1, amount2 } = calculateReturns();
  const slippageTolerance = 0.01; // 1% 滑点保护
  const amount1Min = parseUnits(
    (Number(amount1) * (1 - slippageTolerance)).toString(),
    18
  );
  const amount2Min = parseUnits(
    (Number(amount2) * (1 - slippageTolerance)).toString(),
    18
  );

  // 授权 LP 代币
  const handleApprove = async (): Promise<void> => {
    if (!lpAmount || !address || lpExceedsBalance) return Promise.reject();

    const liquidity = parseUnits(lpAmount, 18);

    return new Promise((resolve, reject) => {
      writeContract(
        {
          address: pairAddress as `0x${string}`,
          abi: pair_ABI,
          functionName: "approve",
          args: [routerAddress, liquidity],
        },
        {
          onSuccess: async (hash: `0x${string}`) => {
            console.log("Approval tx hash:", hash);
            setApproveTxHash(hash);
            // @ts-ignore
            await waitForTransactionReceipt(config, { hash }); // 等待交易确认
            resolve();
          },
          onError: (error: Error) => {
            console.error("Approval failed:", error);
            reject(error);
          },
        }
      );
    });
  };

  // 移除流动性
  const handleRemoveLiquidity = async (): Promise<void> => {
    if (!lpAmount || !address || lpExceedsBalance) return Promise.reject();

    const liquidity = parseUnits(lpAmount, 18);
    const deadline = Math.floor(Date.now() / 1000) + 30 * 60;

    return new Promise((resolve, reject) => {
      writeContract(
        {
          address: routerAddress as `0x${string}`,
          abi: route02_ABI,
          functionName:
            isToken1ETH || isToken2ETH
              ? "removeLiquidityETH"
              : "removeLiquidity",
          args:
            isToken1ETH || isToken2ETH
              ? [
                  isToken1ETH ? token2.address : token1.address,
                  liquidity,
                  isToken1ETH ? amount2Min : amount1Min,
                  isToken1ETH ? amount1Min : amount2Min,
                  address,
                  deadline,
                ]
              : [
                  token1.address,
                  token2.address,
                  liquidity,
                  amount1Min,
                  amount2Min,
                  address,
                  deadline,
                ],
        },
        {
          onSuccess: async (hash: `0x${string}`) => {
            console.log("Remove liquidity tx hash:", hash);
            setRemoveTxHash(hash);
            // @ts-ignore
            await waitForTransactionReceipt(config, { hash }); // 等待交易确认
            resolve();
          },
          onError: (error: Error) => {
            console.error("Remove liquidity failed:", error);
            reject(error);
          },
        }
      );
    });
  };

  // 点击确认后启动流程
  const handleConfirm = async () => {
    setIsProcessStarted(true); // 开始流程，按钮变为“正在移除”
    try {
      await handleApprove(); // 等待授权完成
      await handleRemoveLiquidity(); // 授权完成后移除
    } catch (error) {
      setIsProcessStarted(false); // 失败时重置状态
    }
  };

  // 移除确认后跳转并关闭 Dialog
  useEffect(() => {
    if (isRemoveConfirmed && isProcessStarted) {
      router.push("/position"); // 移除完成后跳转
    }
    if (onTransactionStatusChange) {
      // 在整个流程完成前保持 Dialog 打开
      const isTransactionActive =
        isPendingWrite || (isProcessStarted && !isRemoveConfirmed);
      onTransactionStatusChange(isTransactionActive);
    }
  }, [
    isRemoveConfirmed,
    isPendingWrite,
    isProcessStarted,
    router,
    onTransactionStatusChange,
  ]);

  const getButtonText = () => {
    if (isProcessStarted) return "正在移除...";
    if (lpExceedsBalance) return "LP 余额不足";
    if (!isAmountEntered) return "输入 LP 数量";
    return "确认";
  };

  return (
    <div className="border border-gray-800 rounded-3xl p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">移除流动性</h2>
        <p className="text-sm text-gray-400">指定要移除的 LP 代币数量。</p>
      </div>

      <div className="bg-gray-800 rounded-2xl p-4">
        <div className="flex justify-between pr-2">
          <input
            value={lpAmount}
            onChange={(e) => handleLpInput(e.target.value)}
            onBlur={() => handleLpInput(lpAmount)}
            placeholder="0"
            className={`bg-transparent text-3xl outline-none w-full ${
              lpExceedsBalance ? "text-red-500" : ""
            }`}
            disabled={isProcessStarted} // 流程开始后禁用输入
          />
          <div className="flex items-center space-x-2">
            <span className="font-bold">LP</span>
          </div>
        </div>
        <div className="flex justify-end mt-2 text-sm">
          <span className="text-gray-400">{lpBalanceFormatted} LP</span>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        预计返回: {amount1} {token1.ticker} + {amount2} {token2.ticker}
      </div>

      <Button
        onClick={handleConfirm}
        className={`w-full py-4 rounded-2xl text-center font-medium ${
          isAmountEntered && !lpExceedsBalance && !isPendingWrite
            ? "bg-purple-600 hover:bg-purple-700"
            : "bg-gray-600 text-gray-400 cursor-not-allowed"
        }`}
        disabled={!isAmountEntered || lpExceedsBalance || isProcessStarted}
      >
        {getButtonText()}
      </Button>
    </div>
  );
};
