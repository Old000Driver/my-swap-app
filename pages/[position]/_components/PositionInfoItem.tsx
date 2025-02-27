import { Info } from "lucide-react";
import Image from "next/image";
import { ethers } from "ethers";

type PositionInfoItemProps = {
  pairAddress: string;
  pairName: string;
  pairToken0: string;
  pairToken1: string;
  lpBalance: bigint;
  reserves: [bigint, bigint];
  token0Decimals: number;
  token1Decimals: number;
};

export const PositionInfoItem = ({
  pairAddress,
  pairName,
  pairToken0,
  pairToken1,
  lpBalance,
  reserves,
  token0Decimals,
  token1Decimals,
}: PositionInfoItemProps) => {
  // 计算价值（基于储备量和假价格）
  const value = reserves
    ? (Number(ethers.formatUnits(reserves[0], token0Decimals)) +
        Number(ethers.formatUnits(reserves[1], token1Decimals))) *
      0.1 // 假价格 $0.1/单位
    : 0;
  const isAvailable =
    lpBalance &&
    lpBalance > BigInt(0) &&
    (reserves?.[0] > BigInt(0) || reserves?.[1] > BigInt(0));
  const status = isAvailable ? "In range" : "Unavailable";

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="relative w-10 h-10 mr-3">
            <div className="absolute left-0 top-0 w-8 h-8 bg-white rounded-full overflow-hidden flex items-center justify-center">
              <Image
                src={`https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png`} // 替换为实际图标路径
                alt={`${pairToken0} token`}
                width={32}
                height={32}
              />
            </div>
            <div className="absolute right-0 bottom-0 w-6 h-6 bg-white rounded-full overflow-hidden flex items-center justify-center border-2 border-gray-900">
              <Image
                src={`https://cdn.moralis.io/eth/0x514910771af9ca656af840dff83e8264ecf986ca.png`} // 替换为实际图标路径
                alt={`${pairToken1} token`}
                width={24}
                height={24}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-bold">{pairName}</span>
              <span className="ml-2 px-1.5 py-0.5 bg-gray-800 text-xs rounded text-gray-400">
                v2
              </span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
              <span
                className={isAvailable ? "text-green-500" : "text-gray-400"}
              >
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 p-4 border-t border-gray-800">
        <div>
          <div className="text-lg font-bold mb-1">${value.toFixed(2)}</div>
          <div className="text-sm text-gray-400">Position</div>
        </div>

        <div>
          <div className="flex items-center text-lg font-bold mb-1">
            -
            <Info className="w-4 h-4 ml-1 text-gray-500" />
          </div>
          <div className="text-sm text-gray-400">Fees</div>
        </div>

        <div className="col-span-3 text-right text-sm text-gray-400 mt-2">
          {status === "In range" && "Full range"}
        </div>
      </div>
    </div>
  );
};
