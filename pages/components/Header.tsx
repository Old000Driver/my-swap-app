"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Header = () => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
      <div className="flex items-center space-x-6">
        <Image
          src="https://www.rainbowkit.com/rainbow.svg"
          alt="Logo"
          width={24}
          height={24}
          className="rounded-full"
        />
        <div className="flex items-center space-x-4">
          <Button variant="link" className="text-white font-medium">
            Swap
          </Button>
          <Button variant="link" className="text-gray-400 font-medium">
            Pool
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <ConnectButton />
      </div>
    </div>
  );
};
