import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import React from "react";
import tokenList from "@/tokenList.json";

interface SelectTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (token: any) => void;
}

export const SelectTokenDialog = ({ open, onOpenChange, onSelect }: SelectTokenDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl">选择代币</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-2 mt-4">
          {tokenList.map((token) => (
            <button
              key={token.address}
              className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-gray-800 transition-colors"
              onClick={() => {
                onSelect(token);
                onOpenChange(false);
              }}
            >
              <Image
                src={token.img}
                alt={token.ticker}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span>{token.ticker}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
