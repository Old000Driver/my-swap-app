import { useEffect } from "react";

type Props = {
  currentStep: number;
  onStepClick: (step: number) => void;
};

export const Steps = ({ currentStep, onStepClick }: Props) => {
  useEffect(() => {
    console.log("currentStep", currentStep);
  }, [currentStep]);
  return (
    <div className="w-1/3 bg-gray-900 rounded-xl p-6">
      <button className="flex items-center gap-4 text-left" onClick={() => onStepClick(1)}>
        <div
          className={`flex-shrink-0 w-8 h-8 ${
            currentStep === 1 ? "bg-white text-black" : "bg-gray-700 text-white"
          } rounded-full flex items-center justify-center font-bold`}
        >
          1
        </div>
        <div>
          <div className="text-sm text-gray-400">步骤 1</div>
          <div className="font-medium">选择代币对和杠杆用</div>
        </div>
      </button>

      <div className="w-px h-12 bg-gray-700 ml-4 mt-4 mb-4"></div>

      <div className="flex items-center gap-4">
        <div
          className={`flex-shrink-0 w-8 h-8 ${
            currentStep === 2 ? "bg-white text-black" : "bg-gray-700 text-white"
          } rounded-full flex items-center justify-center font-bold`}
          // onClick={() => onStepClick(2)}
        >
          2
        </div>
        <div>
          <div className="text-sm text-gray-400">步骤 2</div>
          <div className="font-medium">输入存款金额</div>
        </div>
      </div>
    </div>
  );
};
