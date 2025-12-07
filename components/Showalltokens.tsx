"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";

import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { AccountLayout, MintLayout } from "@solana/spl-token";

import {
    MPL_TOKEN_METADATA_PROGRAM_ID,
    getMetadataAccountDataSerializer
} from "@metaplex-foundation/mpl-token-metadata";
import { Card, CardHeader, CardTitle } from "./ui/card";

const METADATA_PROGRAM_ID = new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID);

interface TokenData {
    account: string;
    mint: string;
    name: string;
    symbol: string;
    uri: string;
    decimals: number;
    balance: string;
    supply: string;
}

export function ShowAllTokens() {
    const [useraddress, setUserAddress] = useState("");
    const [tokens, setTokens] = useState<TokenData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function getAllTokenData(ownerAddress: string) {
        if (!ownerAddress) {
            setError("Please enter a valid address.");
            return;
        }

        setLoading(true);
        setError("");
        setTokens([]);

        try {
            const connection = new Connection(clusterApiUrl("devnet"));
            const owner = new PublicKey(ownerAddress);

            const tokenAccounts = await connection.getTokenAccountsByOwner(owner, {
                programId: new PublicKey(
                    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                ),
            });

            console.log("Total token accounts:", tokenAccounts.value.length);

            const results: TokenData[] = [];

            for (const { pubkey, account } of tokenAccounts.value) {
                const accData = account.data;
                const tokenInfo = AccountLayout.decode(accData);

                const mintPubkey = new PublicKey(tokenInfo.mint);
                const rawAmount = tokenInfo.amount;
                // 1️⃣ FETCH MINT ACCOUNT DATA
                const mintAccount = await connection.getAccountInfo(mintPubkey);
                if (!mintAccount) {
                    continue;
                }

                const mintData = MintLayout.decode(mintAccount.data);
                const decimals = mintData.decimals;

                const supplyRaw = mintData.supply;
                const divisor = 10n ** BigInt(decimals);
                const supply = (Number(supplyRaw) / Number(divisor)).toLocaleString();

                const balance = (Number(rawAmount) / Number(divisor)).toFixed(decimals);

                // 2️⃣ FETCH METAPLEX METADATA PDA
                const [metadataPDA] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("metadata"),
                        METADATA_PROGRAM_ID.toBuffer(),
                        mintPubkey.toBuffer(),
                    ],
                    METADATA_PROGRAM_ID
                );

                const metadataAccount = await connection.getAccountInfo(metadataPDA);
                let name = "Unknown Token";
                let symbol = "UNK";
                let uri = "";

                if (metadataAccount) {
                    // 3️⃣ DECODE METADATA SAFELY
                    try {
                        const [metadata] = getMetadataAccountDataSerializer().deserialize(metadataAccount.data);

                        name = metadata.name.replace(/\0/g, '').trim();
                        symbol = metadata.symbol.replace(/\0/g, '').trim();
                        uri = metadata.uri.replace(/\0/g, '').trim();
                    } catch (err) {
                        console.error("Failed to decode metadata:", err);
                    }
                } else {
                    console.log("⚠ No metadata found for this mint.");
                }

                results.push({
                    account: pubkey.toBase58(),
                    mint: mintPubkey.toBase58(),
                    name,
                    symbol,
                    uri,
                    decimals,
                    balance,
                    supply
                });
            }

            setTokens(results);
        } catch (err) {
            setError("Failed to fetch token data. Check the address and try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between">
                    <Input
                        className="w-full max-w-md h-[50px]"
                        placeholder="Enter your Solana address"
                        value={useraddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                    />
                    <div className="text-gray-500">
                        the dev net solanA
                    </div>
                </div>
                <Button className="w-[150px] color-white"
                    onClick={() => getAllTokenData(useraddress)}
                    disabled={loading || !useraddress}
                >
                    {loading ? "Loading..." : "Get Tokens"}
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="text-center py-4">Fetching token data...</div>
            )}

            {!loading && tokens.length === 0 && !error && useraddress && (
                <div className="text-center py-4 text-gray-500">No tokens found.</div>
            )}

            {tokens.length > 0 && (
                <div className="grid gap-4">
                    {tokens.map((token, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle>{token.name} ({token.symbol})</CardTitle>
                            </CardHeader>
                            <div className="p-4">
                                <p><strong>Mint:</strong> {token.mint}</p>
                                <p><strong>Token Account:</strong> {token.account}</p>
                                <p><strong>Balance:</strong> {token.balance}</p>
                                <p><strong>Total Supply:</strong> {token.supply}</p>
                                <p><strong>Decimals:</strong> {token.decimals}</p>
                                {token.uri && <p><strong>Metadata URI:</strong> {token.uri}</p>}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}