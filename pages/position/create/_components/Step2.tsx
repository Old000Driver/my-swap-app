import Image from "next/image";
import { Button } from "@/components/ui/button";
import AddLiquidityForm from "./AddLiquidityForm";
import { routerAddress } from "@/resource";

type Token = {
  address: string;
  img: string;
  ticker: string;
};

export const Step2 = ({
  token1 = { address: "", img: "", ticker: "" },
  token2 = { address: "", img: "", ticker: "" },
  onEdit,
}: {
  token1: Token;
  token2: Token;
  onEdit: () => void;
}) => {
  const pairAddress = "0x6561cF90FDE56d6ADCcAa818C9bee07E0668d229";

  return (
    <div className="flex justify-center items-center bg-gray-900 rounded-xl text-white p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="border border-gray-800 rounded-full p-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src={token1.img} width={24} height={24} alt="" />
            <span className="font-bold">{`${token1.ticker}/${token2.ticker}`}</span>
            <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full">
              v2
            </span>
            <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full">
              0.3%
            </span>
          </div>
          <Button variant="link" className="text-blue-500" onClick={onEdit}>
            编辑
          </Button>
        </div>

        <AddLiquidityForm
          token1={token1}
          token2={token2}
          pairAddress={pairAddress}
          routerAddress={routerAddress}
        />
      </div>
    </div>
  );
};

export default Step2;
