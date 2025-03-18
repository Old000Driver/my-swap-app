import { ChevronDown, Plus } from "lucide-react";
import { PositionInfoItem } from "./PositionInfoItem";
import { useAccount, useReadContract } from "wagmi";
import tokenPairs from "@/pairAddressList.json"; // 导入你的 Token Pair 列表
import { factory_ABI, pair_ABI } from "@/resource";
import { useRouter } from "next/router";

export function Position() {
  const { address } = useAccount(); // 获取用户地址

  const route = useRouter();

  // 过滤用户参与的池子（检查 LP 余额）
  const userPositions = tokenPairs
    .map((pair) => {
      const { pairAddress } = pair;
      const { data: lpBalance } = useReadContract({
        address: pairAddress as `0x$`,
        abi: pair_ABI,
        functionName: "balanceOf",
        args: [address], // 默认地址
      });
      const { data: reserves } = useReadContract({
        address: pairAddress as `0x${string}`,
        abi: pair_ABI,
        functionName: "getReserves",
      });

      console.log("address",address,lpBalance);

      // 确保 lpBalance 和 reserves 存在且有效
      if (
        lpBalance &&
        reserves &&
        typeof lpBalance === "bigint" &&
        lpBalance > BigInt(0)
      ) {
        return { ...pair, lpBalance, reserves, hasPosition: true };
      }
      return { ...pair, hasPosition: false };
    })
    .filter(Boolean); // 过滤空值

  return (
    <div className=" text-white p-6">
      <div className="max-w-2xl mx-auto p-4 border border-gray-700 rounded-3xl">
        <h1 className="text-2xl font-bold mb-6">Your positions</h1>
        <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-700 pb-4">
          <button
            className="flex items-center bg-black border border-gray-700 rounded-full px-4 py-2 hover:bg-gray-900 transition-colors"
            onClick={() => route.push("/position/create")}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>New</span>
          </button>
        </div>
        {userPositions.length > 0 ? (
          userPositions.map(
            (position, index) =>
              position && (
                <PositionInfoItem
                  key={index}
                  pairAddress={position.pairAddress}
                  pairName={position.pairName}
                  pairToken0={position.pairToken0}
                  pairToken1={position.pairToken1}
                  // @ts-ignore
                  lpBalance={position.lpBalance}
                  // @ts-ignore
                  reserves={position.reserves}
                  token0Decimals={position.pairToken0Decimals}
                  token1Decimals={position.pairToken1Decimals}
                  hasPosition={position.hasPosition}
                />
              )
          )
        ) : (
          <div className="text-gray-400">No positions found.</div>
        )}
      </div>
    </div>
  );
}
