import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"

export function useLayers() {
  return useQuery({
    queryKey: ["layers"],
    queryFn: async () => {
      const response = await api.get("/api/v1/layers/")
      return response.data.results
    },
  })
}

export function useSublayers(layerRef?: string) {
  return useQuery({
    queryKey: ["sublayers", layerRef],
    queryFn: async () => {
      const response = await api.get(`/api/v1/sublayers/?layer__reference=${layerRef}`)
      return response.data.results
    },
    enabled: !!layerRef,
  })
}

export function useSublayerItems(sublayerRef?: string) {
  return useQuery({
    queryKey: ["sublayeritems", sublayerRef],
    queryFn: async () => {
      const response = await api.get(`/api/v1/sublayeritems/?sublayer__reference=${sublayerRef}`)
      return response.data.results
    },
    enabled: !!sublayerRef,
  })
}

export function useBrackets(sublayerItemRef?: string) {
  return useQuery({
    queryKey: ["brackets", sublayerItemRef],
    queryFn: async () => {
      const response = await api.get(`/api/v1/brackets/?sublayeritem__reference=${sublayerItemRef}`)
      return response.data.results
    },
    enabled: !!sublayerItemRef,
  })
}

export function usePaymentOptions() {
  return useQuery({
    queryKey: ["paymentoptions"],
    queryFn: async () => {
      const response = await api.get("/api/v1/paymentoptions/")
      return response.data.results
    },
  })
}

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const response = await api.get("/api/v1/branches/")
      return response.data.results
    },
  })
}

export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const response = await api.get("/api/v1/sites/")
      return response.data.results
    },
  })
}
