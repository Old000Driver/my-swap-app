"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { SelectTokenDialog } from "./SelectTokenDialog";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ethers } from "ethers";
import { parseEther, parseUnits } from "ethers";

export function Send() {
  const [isHovered, setIsHovered] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amountError, setAmountError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const [selectedToken, setSelectedToken] = useState({
    img: "https://token-icons.s3.amazonaws.com/eth.png",
    ticker: "ETH",
    balance: 1.91,
    address: null,
    decimals: 18,
  });

  const { address, isConnected } = useAccount();

  const { data: balance, refetch } = useBalance({
    address: address,
    token: selectedToken.address
      ? (selectedToken.address as `0x${string}`)
      : undefined,
  });

  useEffect(() => {
    if (balance && selectedToken) {
      const formattedBalance = Number(
        ethers.formatUnits(balance.value, selectedToken.decimals)
      );
      setSelectedToken((prev) => ({
        ...prev,
        balance: formattedBalance,
      }));
    }
  }, [balance, selectedToken.decimals]);

  const handleTokenSelect = (token: any) => {
    setSelectedToken({
      ...token,
      balance: 0,
    });
    setDialogOpen(false);
    refetch();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^\d*\.?\d*$/;

    if (value === "" || regex.test(value)) {
      setAmount(value);
      if (value !== "" && Number(value) > selectedToken.balance) {
        setAmountError(`余额不足`);
      } else {
        setAmountError("");
      }
    }
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipient(value);

    if (value === "") {
      setAddressError("");
    } else if (!ethers.isAddress(value)) {
      setAddressError("invalid recipient");
    } else {
      setAddressError("");
    }
  };

  // 发送原生代币 (ETH)
  const { sendTransaction, isPending: isEthPending } = useSendTransaction({
    mutation: {
      onSuccess: (hash) => {
        setTxHash(hash);
      },
      onError: (error) => {
        console.error("ETH Transaction Error:", error);
        setAmountError("Transaction failed");
      },
    },
  });

  // 发送 ERC20 代币 (WETH, LINK 等)
  const {
    writeContract,
    isPending: isTokenPending,
    data: tokenTxHash,
  } = useWriteContract();

  // 等待交易确认
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: (txHash || tokenTxHash) as `0x${string}`, // 支持两种交易类型的 hash
    });

  const handleSend = async () => {
    if (!amount || !recipient || amountError || addressError) return;

    const amountInUnits = selectedToken.address
      ? parseUnits(amount, selectedToken.decimals) // ERC20 (WETH, LINK)
      : parseEther(amount); // ETH

    try {
      if (!selectedToken.address) {
        // 发送 ETH
        sendTransaction({
          to: recipient as `0x${string}`,
          value: amountInUnits,
        });
      } else {
        // 发送 ERC20 代币 (WETH 或 LINK)
        writeContract({
          address: selectedToken.address as `0x${string}`,
          abi: ["function transfer(address to, uint amount) returns (bool)"],
          functionName: "transfer",
          args: [recipient, amountInUnits],
        });
      }
    } catch (error) {
      console.error("Send Error:", error);
      setAmountError("Failed to send transaction");
    }
  };

  // 更新交易 hash（对于 ERC20 代币）
  useEffect(() => {
    if (tokenTxHash) {
      setTxHash(tokenTxHash);
    }
  }, [tokenTxHash]);

  // 在 useEffect 中监听交易确认并重置状态
  useEffect(() => {
    if (isConfirmed) {
      // 交易确认后重置表单
      setAmount("");
      setRecipient("");
      setAmountError("");
      setAddressError("");
      setTxHash(undefined); // 清除交易 hash
    }
  }, [isConfirmed]);

  const getButtonProps = () => {
    const isAmountValid = amount !== "" && !amountError;
    const isAddressValid = recipient !== "" && !addressError;
  
    if (!amount) return { text: "Enter an amount", disabled: true };
    if (!recipient) return { text: "Enter address", disabled: true };
    if (addressError) return { text: "Invalid recipient", disabled: true };
    if (amountError) return { text: "Insufficient balance", disabled: true };
    if (isEthPending || isTokenPending) return { text: "Sending...", disabled: true };
    if (isConfirming) return { text: "Confirming...", disabled: true };
    // 移除 isConfirmed 条件，让状态重置后恢复正常
    return { text: "Send", disabled: false, isValid: true };
  };

  const buttonProps = getButtonProps();

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-400 mb-4">You are sending</div>
      <Card className="border-none bg-gray-800">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <Input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="bg-transparent border-none text-white text-center !text-5xl font-medium p-0 h-auto focus:ring-0"
            />
            {amountError && (
              <div className="text-red-500 text-[12px] mt-2">{amountError}</div>
            )}
          </div>
          <div className="border-t border-black my-4"></div>
          <Button
            variant="ghost"
            size="icon"
            className={`bg-gray-800 rounded-lg flex items-center justify-between border-gray-700 w-full h-16 ${
              isHovered ? "hover:bg-gray-800" : ""
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setDialogOpen(true)}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#627EEA] flex items-center justify-center">
                <Image
                  src={selectedToken.img}
                  alt={selectedToken.ticker}
                  width={24}
                  height={24}
                  className={`rounded-full ${isHovered ? "opacity-50" : ""}`}
                />
              </div>
              <div>
                <div
                  className={`font-medium text-left text-[14px] ${
                    isHovered ? "text-gray-500" : "text-white"
                  }`}
                >
                  {selectedToken.ticker}
                </div>
                <div
                  className={`text-sm text-left text-[12px] ${
                    isHovered ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Balance: {selectedToken.balance.toFixed(2)}
                </div>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 ${
                isHovered ? "text-gray-500" : "text-gray-400"
              }`}
            />
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none bg-gray-800">
        <CardContent className="p-4">
          <div className="text-sm text-[#5D6785] mb-2">To</div>
          <Input
            value={recipient}
            onChange={handleRecipientChange}
            className="bg-gray-800 border border-[#1A2235] text-white h-12 focus:border-gray-400 focus:ring-0 text-left"
            placeholder="wallet address"
          />
          {addressError && (
            <div className="text-red-500 text-[12px] mt-2">{addressError}</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none bg-gray-800">
        <CardContent className="p-4">
          <Button
            disabled={buttonProps.disabled}
            onClick={buttonProps.isValid ? handleSend : undefined}
            className={`w-full h-12 border border-[#1A2235] ${
              buttonProps.isValid
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-800 text-[#5D6785] hover:bg-[#1A2235]"
            }`}
          >
            {buttonProps.text}
          </Button>
          {txHash && (
            <div className="text-center text-gray-400 text-[12px] mt-2">
              Tx: {txHash.slice(0, 6)}...{txHash.slice(-4)}
            </div>
          )}
        </CardContent>
      </Card>

      <SelectTokenDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={handleTokenSelect}
      />
    </div>
  );
}
