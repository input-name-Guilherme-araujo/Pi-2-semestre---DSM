import { Link } from "react-router-dom"

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl">AnimaList</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A plataforma definitiva para descobrir, avaliar e organizar suas animações favoritas.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Explorar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explorar" className="text-muted-foreground hover:text-foreground transition-colors">
                  Todas as Animações
                </Link>
              </li>
              <li>
                <Link to="/lancamentos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Lançamentos
                </Link>
              </li>
              <li>
                <Link to="/generos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Gêneros
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Conta</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/perfil" className="text-muted-foreground hover:text-foreground transition-colors">
                  Meu Perfil
                </Link>
              </li>
              <li>
                <Link to="/minha-lista" className="text-muted-foreground hover:text-foreground transition-colors">
                  Minha Lista
                </Link>
              </li>
              <li>
                <Link to="/avaliacoes" className="text-muted-foreground hover:text-foreground transition-colors">
                  Minhas Avaliações
                </Link>
              </li>
              <li>
                <Link to="/minhas-avaliacoes" className="text-muted-foreground hover:text-foreground transition-colors">
                  Minhas Avaliações
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/ajuda" className="text-muted-foreground hover:text-foreground transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 AnimaList. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
