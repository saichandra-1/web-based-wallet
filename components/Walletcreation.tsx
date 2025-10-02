"use client"

import { useEffect, useState } from "react";
import { Walletselection } from "./Walletselection";
import { Generatewallet } from "./Generatewallet";


export function Walletcreation(){
    const [wallettype,setwallettype] =useState<number>()
    const [show,setshow]=useState(true);
   
    return(
<div>
    {show &&
        <Walletselection setwallettype={setwallettype} setshow={setshow} />
    }
    {!show &&
        <Generatewallet wallettype={wallettype} />
    }
</div>
    )
}