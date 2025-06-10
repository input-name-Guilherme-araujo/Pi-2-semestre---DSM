import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { Header } from "./components/Layout/Header"
import { Footer } from "./components/Layout/Footer"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Home } from "./pages/Home"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Explorar } from "./pages/Explorar"
import { AnimeDetalhes } from "./pages/AnimeDetalhes"
import { MinhaLista } from "./pages/MinhaLista"
import { MinhasAvaliacoes } from "./pages/MinhasAvaliacoes"
import { Perfil } from "./pages/Perfil"
import { AdminDashboard } from "./pages/Admin/Dashboard"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/explorar" element={<Explorar />} />
              <Route path="/anime/:id" element={<AnimeDetalhes />} />
              <Route path="/minha-lista" element={<MinhaLista />} />
              <Route path="/minhas-avaliacoes" element={<MinhasAvaliacoes />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/lancamentos" element={<Explorar />} />
              <Route path="/buscar" element={<Explorar />} />
              
              {/* ADICIONAR: Rota protegida para Dashboard Admin */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
