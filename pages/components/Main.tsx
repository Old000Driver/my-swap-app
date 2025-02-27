import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Swap } from "./Swap";
import { Send } from "./Send";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const Main = () => {
  const [showType, setShowType] = useState("swap");
  const [slippageValue, setSlippageValue] = useState("5.0");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSlippageChange = (value: string) => {
    console.log("Selected slippage value:", value);
    setSlippageValue(value);
  };

  return (
    <div className="max-w-lg mx-auto pt-8 px-4">
      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <Tabs defaultValue="swap" className="w-full">
            <TabsList className="bg-transparent border-b border-gray-800 w-full justify-start h-auto pb-2">
              <TabsTrigger
                value="swap"
                onClick={() => setShowType("swap")}
                className={`tab ${
                  showType === "swap"
                    ? "border-b-2 border-purple-700"
                    : "border-transparent"
                }`}
              >
                Swap
              </TabsTrigger>
              <TabsTrigger
                value="send"
                onClick={() => setShowType("send")}
                className={`tab ${
                  showType === "send"
                    ? "border-b-2 border-purple-700"
                    : "border-transparent"
                }`}
              >
                Send
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {showType === "swap" && isClient && (
            <Popover>
              <PopoverTrigger>
                <Button variant="ghost" size="icon" className="text-gray-400">
                  <Settings className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                side="bottom"
                className="w-56 bg-slate-900 text-white"
              >
                <div className="mb-2">滑点上限设置</div>
                <RadioGroup
                  defaultValue="5.0"
                  value={slippageValue}
                  onValueChange={handleSlippageChange}
                  className="[&>div>button]:text-white [&>div>button]:border-white [&>div>button]:bg-transparent [&>div>button[data-state=checked]]:bg-white [&>div>button[data-state=checked]]:border-white"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0.5" id="option-one" />
                    <Label htmlFor="option-one">0.5%</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2.5" id="option-two" />
                    <Label htmlFor="option-two">2.5%</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5.0" id="option-three" />
                    <Label htmlFor="option-three">5.0%</Label>
                  </div>
                </RadioGroup>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {showType === "swap" ? <Swap slipValue={slippageValue} /> : <Send />}

        {/* <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4 py-6 text-lg">
          {showType === "swap" ? "Swap" : "Send"}
        </Button> */}
      </div>
    </div>
  );
};
