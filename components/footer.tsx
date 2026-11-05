import Link from "next/link"
import { GithubIcon } from "@/components/github-icon"

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-card/40">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>CS2 Hub · feito pela comunidade. Não afiliado à Valve.</p>
        <div className="flex items-center gap-5">
        <Link href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
        <a
          href="https://github.com/devkoalaa"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-foreground transition-colors"
        >
          <GithubIcon className="w-4 h-4" />
          GitHub
        </a>
        </div>
      </div>
    </footer>
  )
}
