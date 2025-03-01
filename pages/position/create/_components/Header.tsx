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

type Props = {
  onReset: () => void;
};

export const Header = ({ onReset }: Props) => {
  return (
    <div className="border-red-500 mb-6">
      <div className="text-sm text-gray-400 mb-2">
        <Link href="/position" className="hover:text-gray-300">
          你的头寸
        </Link>
        <span className="mx-2">{">"}</span>
        <span>新仓位</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">新仓位</h1>

        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-full"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>重置</span>
          </button>

          <button className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full">
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
