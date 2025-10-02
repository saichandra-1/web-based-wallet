"use client"
import { useEffect, useState, useCallback } from "react"
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";


export function Generatewallet({wallettype}:{wallettype:number}){
    const [mnemonicWords, setMnemonicWords] = useState<string[]>(
    Array(12).fill(" "));
    const [count, setCount] = useState(0);
    const [clearVersion, setClearVersion] = useState(0);

    const generatewallet = useCallback(() => {
        const mnemonic = generateMnemonic();
        // const seed = mnemonicToSeedSync(mnemonic);
        // const path = `m/44'/${wallettype}'/0'/0'`; 
        // const derivedSeed = derivePath(path, seed.toString("hex")).key;
        // const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
        const words = mnemonic.split(" ");
        setMnemonicWords(words);
        localStorage.setItem("mnemonics", JSON.stringify(words));
    }, []);

    useEffect(()=>{
        generatewallet();

    },[generatewallet])



    return(
    <div>
        <div>
            <div className="py-3 text-2xl font-semibold">{wallettype==60?"Ethereum Wallet":"Solana Wallet"}</div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                    {/* <span className="inline-block h-4 w-4">≡</span> */}
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-primary text-primary-foreground shadow hover:bg-primary/90" onClick={()=>{
                        setCount(count+1);
                    }}>
                        <div className="text-sm">Add Wallet</div>
                    </Button>
                    <Button className="bg-destructive text-destructive-foreground shadow hover:bg-destructive/90" onClick={()=>{
                        setCount(0);
                        setClearVersion(clearVersion+1);
                        toast.success("Cleared all wallets");
                    }}>
                        <div className="text-sm">Clear Wallets</div>
                    </Button>
                </div>
            </div>
            <Card className="p-5 flex flex-col gap-4" onClick={()=>{
                navigator.clipboard.writeText(mnemonicWords.join(" "));
                toast.success("Copied to clipboard");
            }}>
                <div className="">
                    Your Secret Phrase
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center w-full items-center mx-auto my-8">
                    {mnemonicWords.map((word, index) => (
                <p key={index} className="md:text-lg bg-foreground/5 hover:bg-foreground/10 transition-all duration-300 rounded-lg p-4">
                    {word}
                  </p>))}
                </div>
            </Card>
        </div>
        <div className="py-3" />
        <Generatewalletforadd wallettype={wallettype} mnemonicWords={mnemonicWords} count={count} clearVersion={clearVersion} />
   </div>
    )
}


export function Generatewalletforadd({ wallettype, mnemonicWords, count, clearVersion }:{ wallettype:number; mnemonicWords:string[]; count:number; clearVersion:number }){
    const [walletspubkey,setWalletspubkey] = useState<string[]>([]);
    const [walletsprivkey,setWalletsprivkey] = useState<string[]>([]);
    const [showSecret,setShowSecret] = useState<boolean[]>([]);

    useEffect(() => {
        if (count === 0) return; // Don't generate on initial render
        const mnemonic = mnemonicWords.join(" ");
        const seed = mnemonicToSeedSync(mnemonic);
        const path = `m/44'/${wallettype}'/${count}'/0'`;
        const derivedSeed = derivePath(path, seed.toString("hex")).key;
        const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);
        const secret = Buffer.from(keyPair.secretKey).toString('hex');
        const pubkey = Buffer.from(keyPair.publicKey).toString('hex');
        
        setWalletspubkey(prev => {
            const newArray = [...prev, pubkey];
            localStorage.setItem("walletspubkey", JSON.stringify(newArray));
            return newArray;
        });
        setWalletsprivkey(prev => {
            const newArray = [...prev, secret];
            localStorage.setItem("walletsprivkey", JSON.stringify(newArray));
            return newArray;
        });
        setShowSecret(prev => [...prev, false]);
    }, [count, mnemonicWords, wallettype]);

    useEffect(()=>{
        setWalletspubkey([]);
        setWalletsprivkey([]);
        setShowSecret([]);
        localStorage.setItem("walletspubkey", JSON.stringify([]));
        localStorage.setItem("walletsprivkey", JSON.stringify([]));
    },[clearVersion]);

    return(
        <div className="flex flex-col gap-6">
            {walletspubkey.map((pubkey,index)=>{
                const publicKey58 = bs58.encode(Buffer.from(pubkey, 'hex'));
                const secretHex = walletsprivkey[index];
                const secret58 = secretHex ? bs58.encode(Buffer.from(secretHex, 'hex')) : "";
                const isShown = showSecret[index] === true;
                return (
                    <Card key={index} className="p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="text-xl font-semibold">Wallet {index+1}</div>
                            <button
                                className="text-red-500 hover:text-red-600"
                                onClick={()=>{
                                    const nextPub = walletspubkey.filter((_,i)=>i!==index);
                                    const nextPriv = walletsprivkey.filter((_,i)=>i!==index);
                                    const nextShow = showSecret.filter((_,i)=>i!==index);
                                    setWalletspubkey(nextPub);
                                    setWalletsprivkey(nextPriv);
                                    setShowSecret(nextShow);
                                    localStorage.setItem("walletspubkey", JSON.stringify(nextPub));
                                    localStorage.setItem("walletsprivkey", JSON.stringify(nextPriv));
                                }}
                                aria-label="Delete wallet"
                            >
                                🗑️
                            </button>
                        </div>
                        <div className="flex items-center justify-between gap-4 rounded-lg bg-foreground/5 p-4">
                            <div className="flex-1">
                                <div className="text-sm text-muted-foreground">Public Key</div>
                                <button
                                    className="text-left w-full truncate hover:underline"
                                    onClick={()=>{
                                        navigator.clipboard.writeText(publicKey58);
                                        toast.success("Public key copied");
                                    }}
                                >
                                    {publicKey58}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 rounded-lg bg-foreground/5 p-4">
                            <div className="flex-1">
                                <div className="text-sm text-muted-foreground">Private Key</div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="text-left flex-1 truncate hover:underline"
                                        onClick={()=>{
                                            if (!secret58) return;
                                            navigator.clipboard.writeText(secret58);
                                            toast.success("Private key copied");
                                        }}
                                    >
                                        {isShown ? (secret58 || "") : "••••••••••••••••••••••••••••••••"}
                                    </button>
                                    <Button
                                        className="bg-foreground/10 text-foreground hover:bg-foreground/20"
                                        onClick={()=>{
                                            const next = [...showSecret];
                                            next[index] = !isShown;
                                            setShowSecret(next);
                                        }}
                                    >
                                        {isShown ? "🙈" : "👁️"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
             })}
        </div>
    )
}