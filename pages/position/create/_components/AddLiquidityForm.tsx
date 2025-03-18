import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useBalance,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "ethers";
import { ethers } from "ethers";
import { route02_ABI, pair_ABI } from "@/resource.js";
import { useRouter } from "next/navigation";

export type Token = {
  address: string;
  img: string;
  ticker: string;
};

type AddLiquidityFormProps = {
  token1: Token;
  token2: Token;
  pairAddress: string;
  routerAddress: string;
  onTransactionStatusChange?: (isActive: boolean) => void; // 新增回调
};

export const AddLiquidityForm = ({
  token1,
  token2,
  pairAddress,
  routerAddress,
  onTransactionStatusChange=()=>{},
}: AddLiquidityFormProps) => {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const router = useRouter();

  const [token1Amount, setToken1Amount] = useState<string>("");
  const [token2Amount, setToken2Amount] = useState<string>("");

  const isToken1ETH =
    token1.ticker === "ETH" ||
    token1.address === "0x0000000000000000000000000000000000000000";
  const isToken2ETH =
    token2.ticker === "ETH" ||
    token2.address === "0x0000000000000000000000000000000000000000";

  const { data: token1Balance } = useBalance({
    address,
    token: isToken1ETH ? undefined : (token1.address as `0x${string}`),
  });
  const { data: token2Balance } = useBalance({
    address,
    token: isToken2ETH ? undefined : (token2.address as `0x${string}`),
  });

  type Reserves = [bigint, bigint, number];
  const { data: reserves } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: pair_ABI,
    functionName: "getReserves",
  }) as { data: Reserves | undefined };

  const rate = reserves
    ? Number(ethers.formatUnits(reserves[isToken1ETH ? 0 : 1], 18)) /
      Number(ethers.formatUnits(reserves[isToken1ETH ? 1 : 0], 18))
    : 8455.12;

  const token1BalanceValue = token1Balance
    ? Number(
        ethers.formatUnits(token1Balance.value, token1Balance.decimals)
      ).toFixed(2)
    : "0.00";
  const token2BalanceValue = token2Balance
    ? Number(
        ethers.formatUnits(token2Balance.value, token2Balance.decimals)
      ).toFixed(2)
    : "0.00";

  const token1ExceedsBalance =
    token1Amount !== "" && Number(token1Amount) > Number(token1BalanceValue);
  const token2ExceedsBalance =
    token2Amount !== "" && Number(token2Amount) > Number(token2BalanceValue);

  const isAmountEntered = token1Amount !== "" || token2Amount !== "";
  const hasBalanceError = token1ExceedsBalance || token2ExceedsBalance;

  const validateAndFormatInput = (value: string): string => {
    let cleanedValue = value.replace(/^0+(?=\d)/, "");
    cleanedValue = cleanedValue.replace(/[^0-9.]/g, "");
    const parts = cleanedValue.split(".");
    if (parts.length > 2) {
      cleanedValue = parts[0] + "." + parts.slice(1).join("");
    }
    if (parts[1]) {
      cleanedValue = parts[0] + "." + parts[1].slice(0, 6);
    }
    if (cleanedValue === "" || cleanedValue === ".") {
      return "";
    }
    return cleanedValue;
  };

  const calculateToken2 = (value: string) => {
    const validatedValue = validateAndFormatInput(value);
    setToken1Amount(validatedValue);
    if (validatedValue && !isNaN(Number(validatedValue)) && rate) {
      setToken2Amount((Number(validatedValue) * rate).toFixed(6));
    }
  };

  const calculateToken1 = (value: string) => {
    const validatedValue = validateAndFormatInput(value);
    setToken2Amount(validatedValue);
    if (validatedValue && !isNaN(Number(validatedValue)) && rate) {
      setToken1Amount((Number(validatedValue) / rate).toFixed(6));
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      router.push("/position");
    }
  }, [isConfirmed, router]);

  useEffect(() => {
    if (onTransactionStatusChange) {
      onTransactionStatusChange(isPending || isConfirming);
    }
  }, [isPending, isConfirming, onTransactionStatusChange]);

  const handleAddLiquidity = async () => {
    if (!token1Amount || !token2Amount || !address || hasBalanceError) return;

    const amount1 = parseUnits(token1Amount, token1Balance?.decimals || 18);
    const amount2 = parseUnits(token2Amount, token2Balance?.decimals || 18);
    const deadline = Math.floor(Date.now() / 1000) + 30 * 60;

    try {
      if (!isToken1ETH) {
        await writeContract({
          address: token1.address as `0x${string}`,
          abi: [
            "function approve(address spender, uint256 amount) returns (bool)",
          ],
          functionName: "approve",
          args: [routerAddress, amount1],
        });
      }
      if (!isToken2ETH) {
        await writeContract({
          address: token2.address as `0x${string}`,
          abi: [
            "function approve(address spender, uint256 amount) returns (bool)",
          ],
          functionName: "approve",
          args: [routerAddress, amount2],
        });
      }

      if (isToken1ETH || isToken2ETH) {
        await writeContract({
          address: routerAddress as `0x${string}`,
          abi: route02_ABI,
          functionName: "addLiquidityETH",
          args: [
            isToken1ETH ? token2.address : token1.address,
            isToken1ETH ? amount2 : amount1,
            0,
            0,
            address,
            deadline,
          ],
          value: isToken1ETH ? amount1 : amount2,
        });
      } else {
        await writeContract({
          address: routerAddress as `0x${string}`,
          abi: route02_ABI,
          functionName: "addLiquidity",
          args: [
            token1.address,
            token2.address,
            amount1,
            amount2,
            0,
            0,
            address,
            deadline,
          ],
        });
      }
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const buttonText = !isConnected
    ? "Connect Wallet"
    : isPending || isConfirming
    ? "Creating position..."
    : hasBalanceError
    ? `${token1ExceedsBalance ? token1.ticker : ""}${
        token1ExceedsBalance && token2ExceedsBalance ? " and " : ""
      }${token2ExceedsBalance ? token2.ticker : ""} insufficient balance`
    : isAmountEntered
    ? "Confirm"
    : "Enter amount";

  return (
    <div className="border border-gray-800 rounded-3xl p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Deposit Tokens</h2>
        <p className="text-sm text-gray-400">
          Specify the token amounts for your liquidity position.
        </p>
      </div>

      <div className="bg-gray-800 rounded-2xl p-4">
        <div className="flex justify-between pr-2">
          <input
            value={token1Amount}
            onChange={(e) => calculateToken2(e.target.value)}
            onBlur={() => calculateToken2(token1Amount)}
            placeholder="0"
            className={`bg-transparent text-3xl outline-none w-full ${
              token1ExceedsBalance ? "text-red-500" : ""
            }`}
          />
          <div className="flex items-center space-x-2">
            <Image src={token1.img} alt="" width={24} height={24} />
            <span className="font-bold">{token1.ticker}</span>
          </div>
        </div>
        <div className="flex justify-end mt-2 text-sm">
          <span className="text-gray-400">
            {token1BalanceValue} {token1.ticker}
          </span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-4">
        <div className="flex justify-between pr-2">
          <input
            value={token2Amount}
            onChange={(e) => calculateToken1(e.target.value)}
            onBlur={() => calculateToken1(token2Amount)}
            placeholder="0"
            className={`bg-transparent text-3xl outline-none w-full appearance-none ${
              token2ExceedsBalance ? "text-red-500" : ""
            }`}
          />
          <div className="flex items-center space-x-2">
            <Image src={token2.img} alt="" width={24} height={24} />
            <span className="font-bold">{token2.ticker}</span>
          </div>
        </div>
        <div className="flex justify-end mt-2 text-sm">
          <span className="text-gray-400">
            {token2BalanceValue} {token2.ticker}
          </span>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        1 {token1.ticker} = {rate.toFixed(6)} {token2.ticker} (30 minutes)
      </div>

      <Button
        onClick={handleAddLiquidity}
        className={`w-full py-4 rounded-2xl text-center font-medium ${
          isConnected &&
          isAmountEntered &&
          !hasBalanceError &&
          !isPending &&
          !isConfirming
            ? "bg-purple-600 hover:bg-purple-700"
            : "bg-gray-600 text-gray-400 cursor-not-allowed"
        }`}
        disabled={
          !isConnected ||
          !isAmountEntered ||
          hasBalanceError ||
          isPending ||
          isConfirming
        }
      >
        {buttonText}
      </Button>
    </div>
  );
};
