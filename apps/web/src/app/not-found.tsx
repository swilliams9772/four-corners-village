import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-purple-600">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h1 className="mb-2 text-4xl font-bold">Lost in the village.</h1>
      <p className="mb-8 max-w-md text-slate-400">
        That page doesn't exist or has wandered off. Let's get you back.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="brand">
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/tv">Vintage TV</Link>
        </Button>
      </div>
    </div>
  );
}
