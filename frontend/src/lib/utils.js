import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const formatRating = (rating) => {
  const num = parseFloat(rating)

  if (isNaN(num)) {
    return "0.0"
  }

  return num.toFixed(1)
}

export const getStatusColor = (status) => {
  const colors = {
    "Em exibição": "bg-green-100 text-green-800",
    Finalizado: "bg-blue-100 text-blue-800",
    Cancelado: "bg-red-100 text-red-800",
    Anunciado: "bg-yellow-100 text-yellow-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

export const getListStatusColor = (status) => {
  const colors = {
    assistido: "bg-green-100 text-green-800",
    desejado: "bg-blue-100 text-blue-800",
    assistindo: "bg-yellow-100 text-yellow-800",
    pausado: "bg-orange-100 text-orange-800",
    abandonado: "bg-red-100 text-red-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}
