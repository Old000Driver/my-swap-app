import { Search, Settings } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "./components/header";

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <Header />

      {/* Main Content */}
      <main className="max-w-lg mx-auto pt-8 px-4">
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <Tabs defaultValue="swap" className="w-full">
              <TabsList className="bg-transparent border-b border-gray-800 w-full justify-start h-auto pb-2">
                <TabsTrigger
                  value="swap"
                  className="data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none"
                >
                  Swap
                </TabsTrigger>
                <TabsTrigger
                  value="limit"
                  className="data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none"
                >
                  Limit
                </TabsTrigger>
                <TabsTrigger
                  value="send"
                  className="data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none"
                >
                  Send
                </TabsTrigger>
                <TabsTrigger
                  value="buy"
                  className="data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none"
                >
                  Buy
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-400">You pay</div>
            <div className="flex items-center justify-between bg-gray-800 rounded-2xl p-4">
              <Input
                type="text"
                value="0"
                className="border-0 bg-transparent text-2xl w-1/2 p-0 focus-visible:ring-0"
              />
              <Button variant="ghost" className="hover:bg-gray-700">
                <div className="flex items-center">
                  <Image
                    src="/placeholder.svg"
                    alt="ETH"
                    width={24}
                    height={24}
                    className="rounded-full mr-2"
                  />
                  <span>ETH</span>
                </div>
              </Button>
            </div>
          </div>

          <div className="relative my-2">
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 p-1 rounded-lg border border-gray-800">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400"
              >
                ↓
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-400">You receive</div>
            <div className="flex items-center justify-between bg-gray-800 rounded-2xl p-4">
              <Input
                type="text"
                value="0"
                className="border-0 bg-transparent text-2xl w-1/2 p-0 focus-visible:ring-0"
              />
              <Button className="bg-purple-600 hover:bg-purple-700">
                Select token
              </Button>
            </div>
          </div>

          <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4 py-6 text-lg">
            Connect wallet
          </Button>

          <div className="text-center mt-3 text-sm text-gray-400">
            Unicorns available in{" "}
            <span className="text-purple-400">English</span>
          </div>
        </div>
      </main>
    </div>
  );
}
