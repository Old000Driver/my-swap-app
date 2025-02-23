"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Swap = () => {
  return (
    <div>
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
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400">
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
    </div>
  );
};
