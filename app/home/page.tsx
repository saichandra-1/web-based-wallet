import { Topbar } from "@/components/Topbar";
import { Walletcreation } from "@/components/Walletcreation";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 p-4 min-h-[92vh]">
      <div>
        <Topbar/>
      </div>
      <div>
        <Walletcreation/>
      </div>
    </div>
  );
}