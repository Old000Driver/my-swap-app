import { ethers } from "ethers";
import { toast } from "sonner";
import { Pair, Route, Trade } from "@uniswap/v2-sdk";
import { ChainId, Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import { JsonRpcProvider } from "ethers";
import { waitForTransactionReceipt } from "@wagmi/core";
import { route02_ABI } from "@/resource";
import { config } from "@/wagmi";

const UNISWAP_ROUTER_ADDRESS = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
const ALCHEMY_RPC_SEPOLIA = process.env.NEXT_PUBLIC_SEPOLIA_RPC;

type TokenType = {
  address: string;
  ticker: string;
  decimals: number;
};

// 工具函数：创建 Pair
async function createPair(tokenOne: Token, tokenTwo: Token): Promise<Pair> {
  const provider = new JsonRpcProvider(ALCHEMY_RPC_SEPOLIA);
  const factoryAddress = "0xF62c03E08ada871A0bEb309762E260a7a6a880E6";
  const factoryAbi = [
    "function getPair(address tokenA, address tokenB) external view returns (address pair)",
  ];
  const pair_ABI = [
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
  ];

  const factoryContract = new ethers.Contract(factoryAddress, factoryAbi, provider);
  const pairAddress = await factoryContract.getPair(tokenOne.address, tokenTwo.address);

  if (pairAddress === ethers.ZeroAddress) {
    throw new Error("交易对不存在");
  }

  const pairContract = new ethers.Contract(pairAddress, pair_ABI, provider);
  const reserves = await pairContract.getReserves();
  const [reserve0, reserve1] = reserves;

  if (reserve0 === BigInt(0) && reserve1 === BigInt(0)) {
    throw new Error("流动性池为空");
  }

  const token0Address = tokenOne.address < tokenTwo.address ? tokenOne.address : tokenTwo.address;
  const isTokenOneToken0 = tokenOne.address === token0Address;
  const tokenOneReserve = isTokenOneToken0 ? reserve0 : reserve1;
  const tokenTwoReserve = isTokenOneToken0 ? reserve1 : reserve0;

  return new Pair(
    CurrencyAmount.fromRawAmount(tokenOne, tokenOneReserve.toString()),
    CurrencyAmount.fromRawAmount(tokenTwo, tokenTwoReserve.toString())
  );
}

// 工具函数：格式化代币数量
function formatTokenAmount(amount: string, decimals: number): string {
  const [integerPart, decimalPart = ""] = amount.split(".");
  let combined = integerPart + decimalPart;
  const paddingLength = decimals - decimalPart.length;

  if (paddingLength > 0) {
    combined = combined.padEnd(combined.length + paddingLength, "0");
  } else if (paddingLength < 0) {
    combined = combined.slice(0, combined.length + paddingLength);
  }

  return combined.replace(/^0+/, "");
}

// ETH → WETH
export async function swapETHToWETH(
  amount: string,
  writeContract: (config: any, callbacks: any) => void,
  setTokenOneAmount: (value: string) => void,
  setTokenTwoAmount: (value: string) => void,
  setIsSwapping: (value: boolean) => void,
  WETH_ADDRESS: string
) {
  await new Promise<void>((resolve, reject) => {
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
        value: ethers.parseEther(amount),
      },
      {
        onSuccess: async (hash: string) => {
          toast.success("Wrapping ETH to WETH: " + hash);
          await waitForTransactionReceipt(config, { hash });
          resolve();
        },
        onError: (error: Error) => {
          toast.error(`Wrap ETH failed: ${error.message}`);
          reject(error);
        },
      }
    );
  });
  toast.success("ETH swapped to WETH directly");
  setTokenOneAmount("0");
  setTokenTwoAmount("0");
  setIsSwapping(false);
}

// WETH → ETH
export async function swapWETHToETH(
  amount: string,
  writeContract: (config: any, callbacks: any) => void,
  setTokenOneAmount: (value: string) => void,
  setTokenTwoAmount: (value: string) => void,
  setIsSwapping: (value: boolean) => void,
  WETH_ADDRESS: string
) {
  await new Promise<void>((resolve, reject) => {
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
        args: [ethers.parseEther(amount)],
      },
      {
        onSuccess: async (hash: string) => {
          toast.success("Unwrapping WETH to ETH: " + hash);
          await waitForTransactionReceipt(config, { hash });
          resolve();
        },
        onError: (error: Error) => {
          toast.error(`Unwrap WETH failed: ${error.message}`);
          reject(error);
        },
      }
    );
  });
  toast.success("WETH swapped to ETH directly");
  setTokenOneAmount("0");
  setTokenTwoAmount("0");
  setIsSwapping(false);
}

// ETH → 代币
export async function swapETHToToken(
  tokenOneAmount: string,
  tokenTwo: TokenType,
  slippage: number,
  address: string,
  writeContract: (config: any, callbacks: any) => void,
  setTxDetails: (details: { to: string | null; data: string | null; value: string | null }) => void,
  setTokenOneAmount: (value: string) => void,
  setTokenTwoAmount: (value: string) => void,
  setIsSwapping: (value: boolean) => void,
  WETH_ADDRESS: string
) {
  const tokenTwoToken = new Token(ChainId.SEPOLIA, tokenTwo.address, tokenTwo.decimals);
  const wethToken = new Token(ChainId.SEPOLIA, WETH_ADDRESS, 18);
  const pair = await createPair(wethToken, tokenTwoToken);
  const route = new Route([pair], wethToken, tokenTwoToken);

  const amountIn = formatTokenAmount(tokenOneAmount, 18);
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

  await new Promise<void>((resolve, reject) => {
    writeContract(
      {
        address: UNISWAP_ROUTER_ADDRESS,
        abi: route02_ABI,
        functionName: "swapExactETHForTokens",
        args: [amountOutMin, path, to, deadline],
        value: ethers.parseEther(tokenOneAmount),
      },
      {
        onSuccess: async (hash: string) => {
          toast.success("Swap transaction sent: " + hash);
          const receipt = await waitForTransactionReceipt(config, { hash });
          setTxDetails({
            to: receipt.to,
            data: receipt.data,
            value: receipt.value,
          });
          resolve();
        },
        onError: (error: Error) => {
          toast.error("Swap failed: " + error.message);
          reject(error);
        },
      }
    );
  });

  setTokenOneAmount("0");
  setTokenTwoAmount("0");
  setIsSwapping(false);
}

// 代币 → ETH
export async function swapTokenToETH(
  tokenOne: TokenType,
  tokenOneAmount: string,
  slippage: number,
  address: string,
  writeContract: (config: any, callbacks: any) => void,
  setTxDetails: (details: { to: string | null; data: string | null; value: string | null }) => void,
  setTokenOneAmount: (value: string) => void,
  setTokenTwoAmount: (value: string) => void,
  setIsSwapping: (value: boolean) => void,
  WETH_ADDRESS: string
) {
  const tokenOneToken = new Token(ChainId.SEPOLIA, tokenOne.address, tokenOne.decimals);
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
  const amountOutMin = formatTokenAmount(minAmount.toExact(), 18);

  const path = [tokenOne.address, WETH_ADDRESS];
  const to = address;
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  await new Promise<void>((resolve, reject) => {
    writeContract(
      {
        address: tokenOne.address as `0x${string}`,
        abi: [
          {
            constant: false,
            inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
            name: "approve",
            outputs: [{ name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "approve",
        args: [UNISWAP_ROUTER_ADDRESS, ethers.parseUnits(tokenOneAmount, tokenOne.decimals)],
      },
      {
        onSuccess: async (hash: string) => {
          toast.success("Approval transaction sent: " + hash);
          await waitForTransactionReceipt(config, { hash });
          resolve();
        },
        onError: (error: Error) => {
          toast.error(`Approval failed: ${error.message}`);
          reject(error);
        },
      }
    );
  });

  await new Promise<void>((resolve, reject) => {
    writeContract(
      {
        address: UNISWAP_ROUTER_ADDRESS,
        abi: route02_ABI,
        functionName: "swapExactTokensForETH",
        args: [amountIn, amountOutMin, path, to, deadline],
      },
      {
        onSuccess: async (hash: string) => {
          toast.success("Swap transaction sent: " + hash);
          const receipt = await waitForTransactionReceipt(config, { hash });
          setTxDetails({
            to: receipt.to,
            data: receipt.data,
            value: receipt.value,
          });
          resolve();
        },
        onError: (error: Error) => {
          toast.error("Swap failed: " + error.message);
          reject(error);
        },
      }
    );
  });

  setTokenOneAmount("0");
  setTokenTwoAmount("0");
  setIsSwapping(false);
}

// 代币 → 代币
export async function swapTokenToToken(
  tokenOne: TokenType,
  tokenTwo: TokenType,
  tokenOneAmount: string,
  slippage: number,
  address: string,
  writeContract: (config: any, callbacks: any) => void,
  setTxDetails: (details: { to: string | null; data: string | null; value: string | null }) => void,
  setTokenOneAmount: (value: string) => void,
  setTokenTwoAmount: (value: string) => void,
  setIsSwapping: (value: boolean) => void
) {
  const tokenOneToken = new Token(ChainId.SEPOLIA, tokenOne.address, tokenOne.decimals);
  const tokenTwoToken = new Token(ChainId.SEPOLIA, tokenTwo.address, tokenTwo.decimals);
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

  const path = [tokenOne.address, tokenTwo.address];
  const to = address;
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  await new Promise<void>((resolve, reject) => {
    writeContract(
      {
        address: tokenOne.address as `0x${string}`,
        abi: [
          "function approve(address spender, uint256 amount) public returns (bool)"
        ],
        functionName: "approve",
        args: [UNISWAP_ROUTER_ADDRESS, ethers.parseUnits(tokenOneAmount, tokenOne.decimals)],
      },
      {
        onSuccess: async (hash: string) => {
          toast.success("Approval transaction sent: " + hash);
          await waitForTransactionReceipt(config, { hash });
          resolve();
        },
        onError: (error: Error) => {
          toast.error(`Approval failed: ${error.message}`);
          reject(error);
        },
      }
    );
  });

  await new Promise<void>((resolve, reject) => {
    writeContract(
      {
        address: UNISWAP_ROUTER_ADDRESS,
        abi: route02_ABI,
        functionName: "swapExactTokensForTokens",
        args: [amountIn, amountOutMin, path, to, deadline],
      },
      {
        onSuccess: async (hash: string) => {
          toast.success("Swap transaction sent: " + hash);
          const receipt = await waitForTransactionReceipt(config, { hash });
          setTxDetails({
            to: receipt.to,
            data: receipt.data,
            value: receipt.value,
          });
          resolve();
        },
        onError: (error: Error) => {
          toast.error("Swap failed: " + error.message);
          reject(error);
        },
      }
    );
  });

  setTokenOneAmount("0");
  setTokenTwoAmount("0");
  setIsSwapping(false);
}