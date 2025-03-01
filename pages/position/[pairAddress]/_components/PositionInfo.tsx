import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Lock } from "lucide-react";

export function PositionInfo() {
  return (
    <div className="min-h-screen w-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto p-4 border border-gray-700 rounded-3xl">
        {/* Header navigation */}
        <div className="flex items-center text-gray-400 mb-6">
          <span>你的头寸</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>0x6561...d229</span>
        </div>

        {/* Token pair info */}
        <div className="flex items-center mb-6">
          <div className="relative h-12 w-12 mr-3">
            <Image
              src="/placeholder.svg?height=48&width=48"
              alt="Token logo"
              width={48}
              height={48}
              className="rounded-full bg-gray-800"
            />
            <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold mr-2">LINK / WETH</h1>
              <Badge variant="outline" className="bg-gray-800 text-xs h-5">
                v2
              </Badge>
            </div>
            <div className="flex items-center mt-1">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
              <span className="text-sm text-gray-400">在区域内</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="outline"
            className="rounded-full bg-gray-900 border-gray-700 hover:bg-gray-800"
          >
            添加流动性
          </Button>
          {/* <Button className="rounded-full bg-white text-black hover:bg-gray-200">移除流动性</Button> */}
        </div>

        {/* Stats card */}
        <Card className="bg-gray-900 border-gray-800 p-6 text-white rounded-xl">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">当前头寸值</span>
              <span className="text-xl font-medium">US$425.79</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">你的资金池代币总数:</span>
              <div className="flex items-center">
                <span className="mr-2">1.82</span>
                <div className="bg-gray-800 rounded-full p-1">
                  <Image
                    src="/placeholder.svg?height=20&width=20"
                    alt="Token"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">已存入 LINK</span>
              <div className="flex items-center">
                <span className="mr-2">168.77</span>
                <div className="bg-gray-800 rounded-full p-1">
                  <Image
                    src="/placeholder.svg?height=20&width=20"
                    alt="LINK"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">已存入 WETH</span>
              <div className="flex items-center">
                <span className="mr-2">0.020</span>
                <div className="bg-gray-800 rounded-full p-1">
                  <Image
                    src="/placeholder.svg?height=20&width=20"
                    alt="WETH"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">资金池份额</span>
              <span>5.62%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
