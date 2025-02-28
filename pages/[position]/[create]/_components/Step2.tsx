import { useState, useEffect } from "react";
import { LockIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAccount, useWriteContract, useReadContract, useBalance } from "wagmi";
import { parseUnits } from "ethers";
import tokenPairs from "@/pairAddressList.json";
import { ethers } from "ethers";
import { route02_ABI, pair_ABI } from "@/resource.js";

type Token = {
  address: string;
  img: string;
  ticker: string;
};

export const Step2 = ({ token1, token2, onEdit }: { token1: Token; token2: Token; onEdit: () => void }) => {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const routerAddress = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";

  const [token1Amount, setToken1Amount] = useState<string>("");
  const [token2Amount, setToken2Amount] = useState<string>("");

  const isToken1ETH = token1.ticker === "ETH" || token1.address === "0x0000000000000000000000000000000000000000";
  const isToken2ETH = token2.ticker === "ETH" || token2.address === "0x0000000000000000000000000000000000000000";

  const { data: token1Balance } = useBalance({
    address,
    token: isToken1ETH ? undefined : (token1.address as `0x${string}`),
  });
  const { data: token2Balance } = useBalance({
    address,
    token: isToken2ETH ? undefined : (token2.address as `0x${string}`),
  });

  const pairAddress = "0x6561cF90FDE56d6ADCcAa818C9bee07E0668d229";
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
    ? Number(ethers.formatUnits(token1Balance.value, token1Balance.decimals)).toFixed(2)
    : "0.00";
  const token2BalanceValue = token2Balance
    ? Number(ethers.formatUnits(token2Balance.value, token2Balance.decimals)).toFixed(2)
    : "0.00";

  const token1ExceedsBalance = token1Amount !== "" && Number(token1Amount) > Number(token1BalanceValue);
  const token2ExceedsBalance = token2Amount !== "" && Number(token2Amount) > Number(token2BalanceValue);

  const handleMaxToken1 = () => setToken1Amount(token1BalanceValue);
  const handleMaxToken2 = () => setToken2Amount(token2BalanceValue);

  const isAmountEntered = token1Amount !== "" || token2Amount !== "";
  const hasBalanceError = token1ExceedsBalance || token2ExceedsBalance;

  // 输入验证函数
  const validateAndFormatInput = (value: string): string => {
    // 移除前导零（除非是小数）
    let cleanedValue = value.replace(/^0+(?=\d)/, '');
    
    // 只允许数字和小数点
    cleanedValue = cleanedValue.replace(/[^0-9.]/g, '');
    
    // 确保只有一个 decimal point
    const parts = cleanedValue.split('.');
    if (parts.length > 2) {
      cleanedValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // 限制小数位数为6位
    if (parts[1]) {
      cleanedValue = parts[0] + '.' + parts[1].slice(0, 6);
    }
    
    // 如果是空字符串或只有小数点，返回空字符串
    if (cleanedValue === '' || cleanedValue === '.') {
      return '';
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

  const handleAddLiquidity = async () => {
    if (!token1Amount || !token2Amount || !address || hasBalanceError) return;

    const amount1 = parseUnits(token1Amount, token1Balance?.decimals || 18);
    const amount2 = parseUnits(token2Amount, token2Balance?.decimals || 18);
    const deadline = Math.floor(Date.now() / 1000) + 30 * 60;

    if (!isToken1ETH) {
      await writeContract({
        address: token1.address as `0x${string}`,
        abi: ["function approve(address spender, uint256 amount) returns (bool)"],
        functionName: "approve",
        args: [routerAddress, amount1],
      });
    }
    if (!isToken2ETH) {
      await writeContract({
        address: token2.address as `0x${string}`,
        abi: ["function approve(address spender, uint256 amount) returns (bool)"],
        functionName: "approve",
        args: [routerAddress, amount2],
      });
    }

    if (isToken1ETH || isToken2ETH) {
      await writeContract({
        address: routerAddress,
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
        address: routerAddress,
        abi: route02_ABI,
        functionName: "addLiquidity",
        args: [token1.address, token2.address, amount1, amount2, 0, 0, address, deadline],
      });
    }
  };

  const buttonText = hasBalanceError
    ? `${token1ExceedsBalance ? token1.ticker : ""}${
        token1ExceedsBalance && token2ExceedsBalance ? " 和 " : ""
      }${token2ExceedsBalance ? token2.ticker : ""} 余额不足`
    : isAmountEntered
    ? "确认"
    : "输入金额";

  return (
    <div className="flex justify-center items-center bg-gray-900 rounded-xl text-white p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="border border-gray-800 rounded-full p-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src={token1.img} width={24} height={24} alt="" />
            <span className="font-bold">{`${token1.ticker}/${token2.ticker}`}</span>
            <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full">v2</span>
            <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full">0.3%</span>
          </div>
          <Button variant="link" className="text-blue-500" onClick={onEdit}>
            编辑
          </Button>
        </div>

        <div className="border border-gray-800 rounded-3xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">存入代币</h2>
            <p className="text-sm text-gray-400">指定你的流动性资产页面的代币金额。</p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="flex justify-between">
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
              <span className="text-gray-400">{token1BalanceValue} {token1.ticker}</span>
              <button onClick={handleMaxToken1} className="ml-2 text-purple-500 hover:text-purple-400">
                最高
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="flex justify-between">
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
              <span className="text-gray-400">{token2BalanceValue} {token2.ticker}</span>
              <button onClick={handleMaxToken2} className="ml-2 text-purple-500 hover:text-purple-400">
                最高
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            1 {token1.ticker} = {rate.toFixed(6)} {token2.ticker} (30 minutes)
          </div>

          <Button
            onClick={handleAddLiquidity}
            className={`w-full py-4 rounded-2xl text-center font-medium ${
              isAmountEntered && !hasBalanceError
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!isAmountEntered || hasBalanceError}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};