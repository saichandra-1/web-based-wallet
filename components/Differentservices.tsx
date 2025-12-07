
"use client";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useRouter } from 'next/navigation';

export function Differentservices() {
    const router = useRouter();
    return (
        <div>
            <Button onClick={() => { router.push("/getalltokens") }}>
                Get all your tokens
            </Button>
        </div>
    )
}