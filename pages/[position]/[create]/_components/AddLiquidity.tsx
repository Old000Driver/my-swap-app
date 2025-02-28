import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowPathIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
} from "@/components/ui/icons";
import Link from "next/link";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "ethers";
import tokenPairs from "@/pairAddressList.json"; // 导入你的 Token Pair 列表
import { ethers } from "ethers";
import { route02_ABI, pair_ABI } from "@/resource.js";
import { Header } from "./Header";
import { Steps } from "./steps";
import { Step1 } from "./Step1";
import { Step2 } from "./Step2";

export function AddLiquidity() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const routerAddress = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3"; // UniswapV2Router02 on Sepolia

  const [token0Amount, setToken0Amount] = useState("");
  const [token1Amount, setToken1Amount] = useState("");
  const [token0, setToken0] = useState("ETH"); // 默认 ETH
  const [token1, setToken1] = useState("LINK");
  const [deadlineMinutes, setDeadlineMinutes] = useState(30); // 默认 30 分钟
  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = () => {
    setCurrentStep(2);
  };

  const handleReset = () => {
    setCurrentStep(1);
  };

  // 假设使用 WETH 替代 ETH
  const selectedPair = tokenPairs.find(
    (pair) => pair.pairToken0 === "WETH" && pair.pairToken1 === "LINK"
  );
  const pairAddress =
    selectedPair?.pairAddress || "0x6561cF90FDE56d6ADCcAa818C9bee07E0668d229";
  const token0Address =
    token0 === "ETH"
      ? "0x0000000000000000000000000000000000000000"
      : selectedPair?.pairToken0Address;
  const token1Address = selectedPair?.pairToken1Address;

  // 定义 getReserves 的返回值类型
  type Reserves = [bigint, bigint, number]; // [reserve0, reserve1, blockTimestampLast]

  const { data: reserves } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: pair_ABI, // 已填写
    functionName: "getReserves",
  }) as { data: Reserves | undefined }; // 类型断言

  // 汇率计算（简化版，需调整）
  const rate = reserves
    ? Number(
        ethers.formatUnits(reserves[1], selectedPair?.pairToken1Decimals || 18)
      ) /
      Number(
        ethers.formatUnits(reserves[0], selectedPair?.pairToken0Decimals || 18)
      )
    : 8455.12; // 假定汇率

  const handleAddLiquidity = async () => {
    if (!token0Amount || !token1Amount || !address) return;

    const amount0 = parseUnits(token0Amount, 18); // ETH/WETH decimals
    const amount1 = parseUnits(
      token1Amount,
      selectedPair?.pairToken1Decimals || 18
    ); // LINK decimals
    const deadline = Math.floor(Date.now() / 1000) + deadlineMinutes * 60; // 当前时间 + 分钟数转为秒

    // 批准 LINK 给 Router
    await writeContract({
      address: token1Address as `0x${string}`,
      abi: ["function transfer(address to, uint amount) returns (bool)"], // 替换为完整 ERC20ABI
      functionName: "approve",
      args: [routerAddress, amount1],
    });

    // 添加流动性
    await writeContract({
      address: routerAddress,
      abi: route02_ABI, // 已填写
      functionName: "addLiquidityETH",
      args: [token1Address, amount1, 0, 0, address, deadline], // 添加 deadline
      value: amount0, // ETH 作为 value
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <Header onReset={handleReset} />
        {/* Main Content */}
        <div className="flex gap-6">
          {/* Left Side - Steps */}
          <Steps currentStep={currentStep} />

          {/* Right Side - Selection Interface */}
          {currentStep === 1 ? <Step1 onNext={handleNextStep} /> : <Step2 />}
        </div>
      </div>
    </div>
  );
}
