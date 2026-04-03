import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="font-heading text-8xl text-accent-gold mb-4">404</h1>
        <h2 className="font-elegant text-2xl text-text-primary mb-2">
          Página não encontrada
        </h2>
        <p className="text-text-secondary text-sm mb-8 max-w-md mx-auto">
          A página que você está procurando não existe ou foi removida.
        </p>
        <Link href="/">
          <Button variant="premium">Voltar ao Início</Button>
        </Link>
      </div>
    </div>
  );
}
