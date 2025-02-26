"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectTokenDialog } from "./SelectTokenDialog";
import { ReactElement, useEffect, useState } from "react";
import { ChevronDown, ArrowDown, Loader } from "lucide-react";
import { ethers, JsonRpcProvider } from "ethers";
import { erc20Abi } from "viem";

import { toast } from "sonner";

import { Pair, Route, Trade } from "@uniswap/v2-sdk";

import { pair_ABI, route02_ABI } from "@/resource";

import { config } from "@/wagmi";

import {
  ChainId,
  Token,
  CurrencyAmount,
  TradeType,
  Percent,
} from "@uniswap/sdk-core";

import {
  useWriteContract,
  useAccount,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";

import { Config } from "wagmi";

import { waitForTransactionReceipt } from "@wagmi/core";

import tokenList from "@/tokenList.json";

type prices = {
  tokenOnePrice: number;
  tokenTwoPrice: number;
  ratio: number;
};

type txDetail = {
  to: string | null;
  data: string | null;
  value: string | null;
};

type SwapProps = {
  slipValue: string;
};

type token = {
  address: string;
  ticker: string;
  img: string;
  decimals: number;
  name: string;
};

export const Swap = ({ slipValue }: SwapProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [tokenOneAmount, setTokenOneAmount] = useState("1"); // 用户想要支付的代币数量
  const [tokenTwoAmount, setTokenTwoAmount] = useState(""); // 用户将收到的代币数量

  const [tokenOne, setTokenOne] = useState<token | null>(tokenList[0]); // 用户支付的代币信息
  const [tokenTwo, setTokenTwo] = useState<token | null>(null); // 用户接收的代币信息

  const [slippage, setSlippage] = useState(Number(slipValue));

  const [txDetails, setTxDetails] = useState<txDetail>({
    // 存储交易详情
    to: null, // 交易目标地址
    data: null, // 交易数据
    value: null, // 交易金额
  });

  const [hash, setHash] = useState<string | undefined>(undefined);

  const {
    data: receipt,
    isLoading,
    isError,
  } = useWaitForTransactionReceipt({
    hash: hash as `0x${string}`,
  });

  const [prices, setPrices] = useState<prices | null>(null); // 存储代币价格信息
  const [isFetchingPrice, setIsFetchingPrice] = useState(false); // 查询报价的加载状态

  const ALCHEMY_RPC_SEPOLIA = process.env.NEXT_PUBLIC_SEPOLIA_RPC;

  const UNISWAP_ROUTER_ADDRESS = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";

  // 从props中获取钱包地址和连接状态
  const { address, isConnected } = useAccount();

  const { writeContract } = useWriteContract();

  const [tokenOneBalance, setTokenOneBalance] = useState<string | null>(null);
  const [tokenTwoBalance, setTokenTwoBalance] = useState<string | null>(null);

  const { data: balanceOne } = useBalance({
    address: address,
    token: tokenOne?.address as `0x${string}`,
    // query: {
    //   refetchInterval: 15000, // 每 15 秒轮询一次
    // },
  });

  const { data: balanceTwo } = useBalance({
    address: address,
    token: tokenTwo?.address as `0x${string}`,
    // query: {
    //   refetchInterval: 15000,
    // },
  });

  const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    if (balanceOne) {
      setTokenOneBalance(
        ethers.formatUnits(balanceOne.value, tokenOne?.decimals)
      );
    }
  }, [balanceOne]);

  useEffect(() => {
    if (balanceTwo) {
      setTokenTwoBalance(
        ethers.formatUnits(balanceTwo.value, tokenTwo?.decimals)
      );
    }
  }, [balanceTwo]);

  useEffect(() => {
    if (tokenOneAmount && tokenOneBalance) {
      setIsInsufficientBalance(
        Number(tokenOneAmount) > Number(tokenOneBalance)
      );
    }
  }, [tokenOneAmount, tokenOneBalance]);

  const handleSwapTokens = () => {
    if (tokenTwo === null || tokenOne === null) {
      toast.warning("Please select token first");
      return;
    }
    const tempToken = tokenOne;
    setTokenOne(tokenTwo);
    setTokenTwo(tempToken);

    fetchPrices(tokenTwo, tokenOne);
  };

  async function wrapETH(amount: string) {
    const WETH_ADDRESS = tokenList[1].address; // Sepolia WETH: 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14

    return new Promise<void>((resolve, reject) => {
      writeContract(
        {
          address: WETH_ADDRESS as `0x${string}`,
          abi: [
            {
              constant: false,
              inputs: [],
              name: "deposit",
              outputs: [],
              payable: true,
              stateMutability: "payable",
              type: "function",
            },
          ],
          functionName: "deposit",
          value: ethers.parseEther(amount), // 发送 ETH 作为 value
        },
        {
          onSuccess: async (hash) => {
            toast.success("Wrapping ETH to WETH: " + hash);
            const receipt = await waitForTransactionReceipt(config, { hash });
            console.log("Wrap ETH receipt:", receipt);
            resolve();
          },
          onError: (error) => {
            console.error("Wrap ETH failed:", error);
            toast.error(`Wrap ETH failed: ${error.message}`);
            reject(error);
          },
        }
      );
    });
  }

  async function unwrapWETH(amount: string) {
    const WETH_ADDRESS = tokenList[1].address; // Sepolia WETH: 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14

    return new Promise<void>((resolve, reject) => {
      writeContract(
        {
          address: WETH_ADDRESS as `0x${string}`,
          abi: [
            {
              constant: false,
              inputs: [{ name: "wad", type: "uint256" }],
              name: "withdraw",
              outputs: [],
              payable: false,
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "withdraw",
          args: [ethers.parseEther(amount)], // WETH 数量
        },
        {
          onSuccess: async (hash) => {
            toast.success("Unwrapping WETH to ETH: " + hash);
            const receipt = await waitForTransactionReceipt(config, { hash });
            console.log("Unwrap WETH receipt:", receipt);
            resolve();
          },
          onError: (error) => {
            console.error("Unwrap WETH failed:", error);
            toast.error(`Unwrap WETH failed: ${error.message}`);
            reject(error);
          },
        }
      );
    });
  }

  function changeAmount(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    // 空值允许
    if (value === "") {
      setTokenOneAmount("");
      setTokenTwoAmount("");
      return;
    }

    if (value && prices?.ratio) {
      setTokenTwoAmount((Number(value) * prices.ratio).toString());
    } else {
      setTokenTwoAmount("");
    }

    // 校验规则：
    // 1. 只允许数字和小数点
    // 2. 第一位不能是小数点
    // 3. 不允许多个小数点
    // 4. 小数位数不能超过18位
    const regex = /^\d*\.?\d{0,18}$/;

    if (regex.test(value)) {
      setTokenOneAmount(value);
      // fetchPrices(tokenOne, tokenTwo);
    }
  }

  async function fetchPrices(tokenOne: token, tokenTwo: token) {
    setIsFetchingPrice(true);
    try {
      // 如果 tokenOne 或 tokenTwo 没有地址（如 ETH），使用默认的 WETH 地址（tokenList[1]）
      const tokenOneAddress = !tokenOne.address
        ? tokenList[1].address
        : tokenOne.address;
      const tokenTwoAddress = !tokenTwo.address
        ? tokenList[1].address
        : tokenTwo.address;

      // 如果两个代币地址相同，直接设置 1:1 比例
      if (tokenOneAddress === tokenTwoAddress) {
        setPrices({
          tokenOnePrice: 1,
          tokenTwoPrice: 1,
          ratio: 1,
        });
        setTokenTwoAmount(tokenOneAmount);
        return;
      }

      // 创建 Token 对象
      const tokenOneToken = new Token(
        ChainId.SEPOLIA,
        tokenOneAddress,
        tokenOne.decimals
      );
      const tokenTwoToken = new Token(
        ChainId.SEPOLIA,
        tokenTwoAddress,
        tokenTwo.decimals
      );

      // 创建交易对和路由
      const pair = await createPair(tokenOneToken, tokenTwoToken);
      const route = new Route([pair], tokenOneToken, tokenTwoToken);

      // 获取价格比例：1 tokenOne = 多少 tokenTwo
      const exchangeRate = Number(route.midPrice.toSignificant(6));

      // 设置价格信息
      setPrices({
        tokenOnePrice: 1,
        tokenTwoPrice: exchangeRate,
        ratio: exchangeRate,
      });

      // 计算 tokenTwoAmount，仅当 tokenOneAmount 有效时执行
      if (tokenOneAmount && !isNaN(Number(tokenOneAmount))) {
        setTokenTwoAmount((Number(tokenOneAmount) * exchangeRate).toString());
      } else {
        setTokenTwoAmount("");
      }

      toast.success("价格更新成功");
    } catch (error: any) {
      console.error("获取价格失败:", error);
      setPrices(null);
      toast.error(`获取价格失败: ${error.message}`);
    } finally {
      setIsFetchingPrice(false);
    }
  }

  async function createPair(tokenOneToken: Token, tokenTwoToken: Token) {
    try {
      const provider = new JsonRpcProvider(ALCHEMY_RPC_SEPOLIA);
      const factoryAddress = "0xF62c03E08ada871A0bEb309762E260a7a6a880E6"; // Uniswap V2 工厂合约地址 (Sepolia)
      const factoryAbi = [
        "function getPair(address tokenA, address tokenB) external view returns (address pair)",
      ];
      const factoryContract = new ethers.Contract(
        factoryAddress,
        factoryAbi,
        provider
      );

      const tokenOneAddress = tokenOneToken.address;
      const tokenTwoAddress = tokenTwoToken.address;

      const pairAddress = await factoryContract.getPair(
        tokenOneAddress,
        tokenTwoAddress
      );
      console.log("获取到的交易对地址:", pairAddress);

      if (pairAddress === ethers.ZeroAddress) {
        throw new Error("交易对不存在");
      }

      const pairContract = new ethers.Contract(pairAddress, pair_ABI, provider);
      const reserves = await pairContract.getReserves();
      console.log("获取到的储备量:", reserves);

      const [reserve0, reserve1] = reserves;

      if (reserve0 === BigInt(0) && reserve1 === BigInt(0)) {
        throw new Error("流动性池为空");
      }

      // 判断 token0 和 token1 的顺序（地址大小）
      const token0Address =
        tokenOneAddress < tokenTwoAddress ? tokenOneAddress : tokenTwoAddress;
      const isTokenOneToken0 = tokenOneAddress === token0Address;

      // 根据顺序分配储备量
      const tokenOneReserve = isTokenOneToken0 ? reserve0 : reserve1;
      const tokenTwoReserve = isTokenOneToken0 ? reserve1 : reserve0;

      return new Pair(
        CurrencyAmount.fromRawAmount(tokenOneToken, tokenOneReserve.toString()),
        CurrencyAmount.fromRawAmount(tokenTwoToken, tokenTwoReserve.toString())
      );
    } catch (error) {
      console.error("创建代币对时出错:", error);
      throw error;
    }
  }

  async function approveToken(tokenAddress: string, amount: string) {
    if (!tokenOne) {
      toast.warning("No token selected for approval");
      return;
    }
    return new Promise<void>((resolve, reject) => {
      writeContract(
        {
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          args: [
            UNISWAP_ROUTER_ADDRESS,
            ethers.parseUnits(amount, tokenOne.decimals),
          ],
        },
        {
          onSuccess: async (hash) => {
            toast.success("Approval transaction sent: " + hash);
            const receipt = await waitForTransactionReceipt(config, { hash });
            console.log("Approval receipt:", receipt);
            resolve();
          },
          onError: (error) => {
            console.error("Approval failed:", error);
            toast.error(`Approval failed: ${error.message}`);
            reject(error);
          },
        }
      );
    });
  }

  async function fetchDexSwap() {
    if (!tokenOne || !tokenTwo) {
      toast.warning("Please select token first");
      return;
    }
    setIsSwapping(true);
    try {
      const WETH_ADDRESS = tokenList[1].address; // Sepolia WETH
      const isTokenOneETH = tokenOne.ticker === "ETH"; // tokenOne 是 ETH
      const isTokenTwoETH = tokenTwo.ticker === "ETH"; // tokenTwo 是 ETH
      const isTokenOneWETH = tokenOne.address === WETH_ADDRESS;
      const isTokenTwoWETH = tokenTwo.address === WETH_ADDRESS;
  
      // 情况 1: ETH 和 WETH 互换，直接调用 wrapETH 或 unwrapWETH
      if (isTokenOneETH && isTokenTwoWETH) {
        await wrapETH(tokenOneAmount);
        toast.success("ETH swapped to WETH directly");
        setTokenOneAmount("0");
        setTokenTwoAmount("0");
        setIsSwapping(false);
        return;
      }
      if (isTokenOneWETH && isTokenTwoETH) {
        await unwrapWETH(tokenOneAmount);
        toast.success("WETH swapped to ETH directly");
        setTokenOneAmount("0");
        setTokenTwoAmount("0");
        setIsSwapping(false);
        return;
      }
  
      // 情况 2: tokenOne 是 ETH，使用 swapExactETHForTokens
      if (isTokenOneETH) {
        const tokenTwoToken = new Token(
          ChainId.SEPOLIA,
          tokenTwo.address,
          tokenTwo.decimals
        );
        const wethToken = new Token(ChainId.SEPOLIA, WETH_ADDRESS, 18);
        const pair = await createPair(wethToken, tokenTwoToken);
        const route = new Route([pair], wethToken, tokenTwoToken);
  
        const amountIn = formatTokenAmount(tokenOneAmount, 18); // ETH decimals = 18
        const trade = new Trade(
          route,
          CurrencyAmount.fromRawAmount(wethToken, amountIn),
          TradeType.EXACT_INPUT
        );
  
        const slippageTolerance = new Percent(Math.floor(slippage * 100), "10000");
        const minAmount = trade.minimumAmountOut(slippageTolerance);
        const amountOutMin = formatTokenAmount(minAmount.toExact(), tokenTwo.decimals);
  
        const path = [WETH_ADDRESS, tokenTwo.address];
        const to = address;
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  
        writeContract(
          {
            address: UNISWAP_ROUTER_ADDRESS,
            abi: route02_ABI,
            functionName: "swapExactETHForTokens",
            args: [amountOutMin, path, to, deadline],
            value: ethers.parseEther(tokenOneAmount), // 直接发送 ETH
          },
          {
            onSuccess: async (hash) => {
              toast.success("Swap transaction sent: " + hash);
              const receipt = await waitForTransactionReceipt(config, { hash });
              console.log("Transaction receipt:", receipt);
              setTxDetails({
                to: receipt.to,
                data: receipt.data,
                value: receipt.value,
              });
  
              setTokenOneAmount("0");
              setTokenTwoAmount("0");
              setIsSwapping(false);
            },
            onError: (error) => {
              console.log("Swap error:", error);
              toast.error("Swap failed: " + error.message);
              setIsSwapping(false);
            },
          }
        );
      }
      // 情况 3: tokenTwo 是 ETH，使用 swapExactTokensForETH
      else if (isTokenTwoETH) {
        const tokenOneToken = new Token(
          ChainId.SEPOLIA,
          tokenOne.address,
          tokenOne.decimals
        );
        const wethToken = new Token(ChainId.SEPOLIA, WETH_ADDRESS, 18);
        const pair = await createPair(tokenOneToken, wethToken);
        const route = new Route([pair], tokenOneToken, wethToken);
  
        const amountIn = formatTokenAmount(tokenOneAmount, tokenOne.decimals);
        const trade = new Trade(
          route,
          CurrencyAmount.fromRawAmount(tokenOneToken, amountIn),
          TradeType.EXACT_INPUT
        );
  
        const slippageTolerance = new Percent(Math.floor(slippage * 100), "10000");
        const minAmount = trade.minimumAmountOut(slippageTolerance);
        const amountOutMin = formatTokenAmount(minAmount.toExact(), 18); // ETH decimals = 18
  
        const path = [tokenOne.address, WETH_ADDRESS];
        const to = address;
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  
        await approveToken(tokenOne.address, tokenOneAmount); // 等待授权完成
  
        writeContract(
          {
            address: UNISWAP_ROUTER_ADDRESS,
            abi: route02_ABI,
            functionName: "swapExactTokensForETH",
            args: [amountIn, amountOutMin, path, to, deadline],
          },
          {
            onSuccess: async (hash) => {
              toast.success("Swap transaction sent: " + hash);
              const receipt = await waitForTransactionReceipt(config, { hash });
              console.log("Transaction receipt:", receipt);
              setTxDetails({
                to: receipt.to,
                data: receipt.data,
                value: receipt.value,
              });
  
              setTokenOneAmount("0");
              setTokenTwoAmount("0");
              setIsSwapping(false);
            },
            onError: (error) => {
              console.log("Swap error:", error);
              toast.error("Swap failed: " + error.message);
              setIsSwapping(false);
            },
          }
        );
      }
      // 情况 4: 普通代币兑换，走 swapExactTokensForTokens
      else {
        const tokenOneToken = new Token(
          ChainId.SEPOLIA,
          tokenOne.address,
          tokenOne.decimals
        );
        const tokenTwoToken = new Token(
          ChainId.SEPOLIA,
          tokenTwo.address,
          tokenTwo.decimals
        );
  
        const pair = await createPair(tokenOneToken, tokenTwoToken);
        const route = new Route([pair], tokenOneToken, tokenTwoToken);
  
        const amountIn = formatTokenAmount(tokenOneAmount, tokenOne.decimals);
        const trade = new Trade(
          route,
          CurrencyAmount.fromRawAmount(tokenOneToken, amountIn),
          TradeType.EXACT_INPUT
        );
  
        const slippageTolerance = new Percent(Math.floor(slippage * 100), "10000");
        const minAmount = trade.minimumAmountOut(slippageTolerance);
        const amountOutMin = formatTokenAmount(minAmount.toExact(), tokenTwo.decimals);
  
        const path = [tokenOneToken.address, tokenTwo.address];
        const to = address;
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  
        await approveToken(tokenOne.address, tokenOneAmount); // 等待授权完成
  
        writeContract(
          {
            address: UNISWAP_ROUTER_ADDRESS,
            abi: route02_ABI,
            functionName: "swapExactTokensForTokens",
            args: [amountIn, amountOutMin, path, to, deadline],
          },
          {
            onSuccess: async (hash) => {
              toast.success("Swap transaction sent: " + hash);
              const receipt = await waitForTransactionReceipt(config, { hash });
              console.log("Transaction receipt:", receipt);
              setTxDetails({
                to: receipt.to,
                data: receipt.data,
                value: receipt.value,
              });
  
              setTokenOneAmount("0");
              setTokenTwoAmount("0");
              setIsSwapping(false);
            },
            onError: (error) => {
              console.log("Swap error:", error);
              toast.error("Swap failed: " + error.message);
              setIsSwapping(false);
            },
          }
        );
      }
    } catch (error: any) {
      console.error("交易失败:", error);
      toast.error("交易失败: " + error.message);
      setIsSwapping(false);
    }
  }

  const formatTokenAmount = (amount: string, decimals: number) => {
    const [integerPart, decimalPart = ""] = amount.split(".");

    let combined = integerPart + decimalPart;

    const paddingLength = decimals - decimalPart.length;

    if (paddingLength > 0) {
      combined = combined.padEnd(combined.length + paddingLength, "0");
    } else if (paddingLength < 0) {
      combined = combined.slice(0, combined.length + paddingLength);
    }

    combined = combined.replace(/^0+/, "");

    console.log("amount:" + amount + ", result:" + combined);

    return combined;
  };

  // useEffect(() => {
  //   fetchPrices(tokenList[0], tokenList[1]);
  // }, []);

  useEffect(() => {
    if (receipt) {
      console.log("Transaction receipt:", receipt);
      setTxDetails({
        to: receipt.to,
        data: receipt.data,
        value: receipt.value,
      });
    }
  }, [receipt]);

  useEffect(() => {
    if (tokenOne && tokenTwo) {
      fetchPrices(tokenOne, tokenTwo);
    }
  }, [tokenOne, tokenTwo]);

  return (
    <div>
      <div className="space-y-2">
        <div className="text-sm text-gray-400">You pay</div>
        <div className="flex items-center justify-between bg-gray-800 rounded-2xl p-4">
          <Input
            type="text"
            inputMode="decimal"
            value={tokenOneAmount}
            className={`border-0 bg-transparent text-2xl w-1/2 p-0 focus-visible:ring-0 ${
              isInsufficientBalance ? "text-red-500" : ""
            }`}
            onChange={changeAmount}
          />
          <div>
            <div className="flex items-center flex-col">
              <Button
                variant="ghost"
                className="hover:bg-gray-700  h-9 px-3 border border-gray-700 rounded-2xl"
                onClick={() => setPayDialogOpen(true)}
              >
                <div className="flex items-center">
                  <Image
                    src={tokenOne?.img || ""}
                    alt={tokenOne?.ticker || ""}
                    width={24}
                    height={24}
                    className="rounded-full mr-2"
                  />
                  <span>{tokenOne?.ticker}</span>
                  <span className="ml-2">
                    <ChevronDown />
                  </span>
                </div>
              </Button>
              <div
                className={`pt-2 text-sm ${
                  isInsufficientBalance ? "text-red-500" : "text-gray-400"
                }`}
              >
                {tokenOneBalance
                  ? `${Number(tokenOneBalance).toFixed(2)} ${tokenOne?.ticker}`
                  : ""}
              </div>
            </div>
          </div>
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
            value={tokenTwoAmount}
            className="border-0 bg-transparent text-2xl w-1/2 p-0 focus-visible:ring-0"
            disabled
          />
          {tokenTwo ? (
            <div>
              <Button
                variant="ghost"
                className="hover:bg-gray-700 h-9 px-3 border border-gray-700 rounded-2xl"
                onClick={() => setDialogOpen(true)}
              >
                <div className="flex items-center">
                  <Image
                    src={tokenTwo.img}
                    alt={tokenTwo.ticker}
                    width={24}
                    height={24}
                    className="rounded-full mr-2"
                  />
                  <span>{tokenTwo.ticker}</span>
                  <span className="ml-2">
                    <ChevronDown />
                  </span>
                </div>
              </Button>
              <div className="pt-2 text-sm text-gray-400">
                {tokenTwoBalance
                  ? `${Number(tokenTwoBalance).toFixed(2)} ${tokenTwo?.ticker}`
                  : ""}
              </div>
            </div>
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
        onSelect={setTokenTwo}
      />

      <SelectTokenDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        onSelect={setTokenOne}
      />

      <Button
        className="w-full bg-purple-600 hover:bg-purple-700 mt-4 py-6 text-lg flex items-center justify-center"
        onClick={fetchDexSwap}
        disabled={
          isFetchingPrice ||
          isInsufficientBalance ||
          !tokenOne ||
          !tokenTwo ||
          tokenOneAmount === "" ||
          tokenOneAmount === "0" ||
          isSwapping
        }
      >
        {isFetchingPrice ? (
          <>
            <Loader className="mr-2 animate-spin" />
            Searching Price...
          </>
        ) : isInsufficientBalance ? (
          "Insufficient Balance"
        ) : !tokenOne || !tokenTwo ? (
          "Select a Token"
        ) : tokenOneAmount === "" || tokenOneAmount === "0" ? (
          "Enter an amount"
        ) : isSwapping ? (
          <>
            <Loader className="mr-2 animate-spin" />
            Swapping...
          </>
        ) : (
          "Swap"
        )}
      </Button>
    </div>
  );
};
