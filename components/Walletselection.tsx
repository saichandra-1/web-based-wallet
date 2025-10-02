


// import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";

export function Walletselection({setwallettype,setshow}:{setwallettype:(type:number)=>void; setshow:(show:boolean)=>void}){

    return(
        <div>
    <h1 className="text-xl font-medium">Slect type of wallet you want to generate </h1>
    <div className="flex justify-center items-center w-full h-screen ">
        <div className="flex justify-between gap-10">
                <Card className="w-96 max-w-sm  h-80">
            <div className="flex justify-center items-center w-full h-full">
                <div className="bg-gray text-white p-4 rounded-lg text-center">
                    <Button className="py-16 px-10 rounded-full" onClick={()=>{setwallettype(501);setshow(false);
                    toast.success("Solana wallet selected");}}
                        >
                        <div className="text-base">
                           Solana
                        </div>
                    </Button>
                </div>
            </div>
                </Card>
                <Card className="w-96 max-w-sm h-80">
            <div className="flex justify-center items-center w-full h-full">
                <div className="bg-gray text-white p-4 rounded-lg text-center">
                    <Button className="py-16 px-7 rounded-full" onClick={()=>{setwallettype(60);setshow(false);
                        toast.success("Ethereum wallet selected");
                    }}>
                        <div className="text-base">
                           Ethereum
                        </div>
                    </Button>
                </div>
            </div>
                </Card>
        </div>
    </div>
</div>
    )
}