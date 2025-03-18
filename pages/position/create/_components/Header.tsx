import {
  ArrowPathIcon,
} from "@/components/ui/icons";
import Link from "next/link";

type Props = {
  onReset: () => void;
};

export const Header = ({ onReset }: Props) => {
  return (
    <div className="border-red-500 mb-6">
      <div className="text-sm text-gray-400 mb-2">
        <Link href="/position" className="hover:text-gray-300">
          Your Positions
        </Link>
        <span className="mx-2">{">"}</span>
        <span>New Position</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">New Position</h1>

        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-full"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <div className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
