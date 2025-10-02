import { ModeToggle } from "./ui/theme-button";


export function Topbar(){
    return(
    <div>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border rounded-lg px-7">
          <div className="text-xl font-bold">
            Wallet
          </div>
          <div>
            <ModeToggle/>   
          </div>
        </header>
    </div>
    )
}   