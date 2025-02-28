import { ArrowPathIcon, Cog6ToothIcon, ChevronDownIcon } from "@/components/ui/icons"

import Link from "next/link"

export default function SwapInterface() {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section (Red Box in the image) */}
        <div className="border-red-500 mb-6">
          <div className="text-sm text-gray-400 mb-2">
            <Link href="/positions" className="hover:text-gray-300">
              你的头寸
            </Link>
            <span className="mx-2">{">"}</span>
            <span>新仓位</span>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">新仓位</h1>

            <div className="flex gap-2">
              <button className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-full">
                <ArrowPathIcon className="w-4 h-4" />
                <span>重置</span>
              </button>

              <button className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full">
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Left Side - Steps */}
          <div className="w-1/3 bg-gray-900 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-8">
              <div className="flex-shrink-0 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <div className="text-sm text-gray-400">步骤 1</div>
                <div className="font-medium">选择代币对和杠杆用</div>
              </div>
            </div>

            <div className="w-px h-12 bg-gray-700 ml-4"></div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <div className="text-sm text-gray-400">步骤 2</div>
                <div className="font-medium">输入存款金额</div>
              </div>
            </div>
          </div>

          {/* Right Side - Selection Interface */}
          <div className="w-2/3 bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-2">选择代币对</h2>
            <p className="text-gray-400 mb-6">选择你想要提供流动性的代币。你可以在所有支持的网络上选择代币。</p>

            <div className="flex gap-4 mb-8">
              <button className="flex items-center justify-between w-1/2 bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  <span>ETH</span>
                </div>
                <ChevronDownIcon className="w-5 h-5" />
              </button>

              <button className="flex items-center justify-between w-1/2 bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-800 rounded-full"></div>
                  <span>LINK</span>
                </div>
                <ChevronDownIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold mb-2">费用等级</h3>
              <p className="text-gray-400 mb-2">
                通过提供流动性赚取的金额。所有 v2 资金池收取 0.3% 的固定费用。如需更多选择，请在 v4 上提供流动性。
              </p>
            </div>

            <button className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-lg font-bold">继续</button>
          </div>
        </div>
      </div>
    </div>
  )
}

