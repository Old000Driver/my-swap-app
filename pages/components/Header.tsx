"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export const Header = () => {
  const router = useRouter();
  const [selected, setSelected] = useState("swap");

  useEffect(() => {
    if (router.pathname.includes("position")) {
      setSelected("pool");
    } else {
      setSelected("swap");
    }
  }, [router.pathname]);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center space-x-6">
        <Image
          src="https://www.rainbowkit.com/rainbow.svg"
          alt="Logo"
          width={24}
          height={24}
          className="rounded-full"
        />
        <div className="flex items-center space-x-4">
          <Button
            variant="link"
            className={`font-medium text-lg ${selected === "swap" ? "text-white" : "text-gray-400"}`}
            onClick={() => {
              setSelected("swap");
              router.push("/");
            }}
          >
            Swap
          </Button>
          <Button
            variant="link"
            className={`font-medium text-lg ${selected === "pool" ? "text-white" : "text-gray-400"}`}
            onClick={() => {
              setSelected("pool");
              router.push("/position");
            }}
          >
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
