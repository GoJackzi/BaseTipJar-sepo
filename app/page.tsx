import { TipJar } from "@/components/TipJar"
import { Sparkles } from "lucide-react"

export default function TipJarPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Festive background with gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 -z-10" />

      {/* Floating sparkles */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-20 left-[10%] w-2 h-2 bg-primary/30 rounded-full sparkle"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-40 right-[15%] w-3 h-3 bg-accent/40 rounded-full sparkle"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute top-60 left-[20%] w-2 h-2 bg-primary/20 rounded-full sparkle"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-40 right-[25%] w-3 h-3 bg-accent/30 rounded-full sparkle"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute bottom-60 left-[30%] w-2 h-2 bg-primary/40 rounded-full sparkle"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg float">
              <svg viewBox="0 0 111 111" fill="none" className="w-10 h-10 md:w-12 md:h-12">
                <path
                  d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">Support Builders on Base</h1>
            <p className="text-lg md:text-xl text-muted-foreground flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Send tips and receive NFT receipts
            </p>
          </div>
        </div>

        {/* Tip Jar Component */}
        <TipJar />

        {/* Footer */}
        <footer className="mt-12 text-center">
          <a
            href="https://base.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200 group"
          >
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <svg viewBox="0 0 111 111" fill="none" className="w-4 h-4">
                <path
                  d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="font-medium">Built on Base</span>
          </a>
        </footer>
      </main>
    </div>
  )
}
