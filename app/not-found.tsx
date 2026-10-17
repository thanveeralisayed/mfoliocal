import Link from "next/link"
import { Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
        <span className="text-2xl font-black">404</span>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
        Page Not Found
      </h1>
      <p className="mt-3 text-sm text-muted-foreground max-w-md">
        The page you are looking for does not exist or may have been moved.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button asChild variant="default" size="sm" className="gap-2">
          <Link href="/">
            <Home className="size-4" />
            <span>Go to Home</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href="/home-loan">
            <ArrowLeft className="size-4" />
            <span>Home Loan Calculator</span>
          </Link>
        </Button>
      </div>
    </main>
  )
}
