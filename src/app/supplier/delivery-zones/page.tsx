"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "@/lib/api"
import {
  MapPin,
  Truck,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle,
  Check,
  X,
  Clock,
  Coins
} from "lucide-react"
import toast from "react-hot-toast"

// TypeScript Interface matching API response
interface DeliveryZone {
  reference: string
  id: string
  company: string
  city: string
  fee: string | number
  estimated_days: number
  is_active: boolean
  created_at: string
}

// Zod Validation Schema matching backend rules
const deliveryZoneSchema = z.object({
  city: z.string().min(2, "City name must be at least 2 characters"),
  fee: z.union([z.number(), z.string()]).refine(val => Number(val) >= 0, {
    message: "Fee must be a positive number"
  }),
  estimated_days: z.union([z.number(), z.string()]).refine(val => Number(val) >= 1, {
    message: "Estimated delivery time must be at least 1 day"
  }),
  is_active: z.boolean()
})

type DeliveryZoneFormValues = z.infer<typeof deliveryZoneSchema>

export default function DeliveryZonesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch Delivery Zones
  const { data: zones, isLoading, error } = useQuery<DeliveryZone[]>({
    queryKey: ["delivery-zones"],
    queryFn: async () => {
      const response = await api.get("/api/v1/delivery/zones/")
      return response.data.results || response.data
    }
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DeliveryZoneFormValues>({
    resolver: zodResolver(deliveryZoneSchema),
    defaultValues: {
      city: "",
      fee: 0,
      estimated_days: 2,
      is_active: true
    }
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post("/api/v1/delivery/zones/", data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-zones"] })
      toast.success("Delivery zone configured successfully!")
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.city?.[0] ||
        "Failed to create delivery zone."
      setErrorMessage(msg)
      toast.error(msg)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ reference, data }: { reference: string; data: any }) => {
      return api.patch(`/api/v1/delivery/zones/${reference}/`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-zones"] })
      toast.success("Delivery zone updated successfully!")
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.city?.[0] ||
        "Failed to update delivery zone."
      setErrorMessage(msg)
      toast.error(msg)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (reference: string) => {
      return api.delete(`/api/v1/delivery/zones/${reference}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-zones"] })
      toast.success("Delivery zone deleted successfully!")
    },
    onError: (err: any) => {
      toast.error("Failed to delete delivery zone.")
    }
  })

  const openCreateModal = () => {
    setEditingZone(null)
    setErrorMessage(null)
    reset({
      city: "",
      fee: 0,
      estimated_days: 2,
      is_active: true
    })
    setIsModalOpen(true)
  }

  const openEditModal = (zone: DeliveryZone) => {
    setEditingZone(zone)
    setErrorMessage(null)
    reset({
      city: zone.city,
      fee: Number(zone.fee),
      estimated_days: Number(zone.estimated_days),
      is_active: zone.is_active
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingZone(null)
    setErrorMessage(null)
  }

  const onSubmit = (data: DeliveryZoneFormValues) => {
    setErrorMessage(null)
    const payload = {
      city: data.city,
      fee: Number(data.fee),
      estimated_days: Number(data.estimated_days),
      is_active: data.is_active
    }

    if (editingZone) {
      updateMutation.mutate({ reference: editingZone.reference, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="p-4 sm:p-8 container mx-auto space-y-8 pb-24">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-suppblue-600 shrink-0" />
            Regional Shipping Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Define target shipping hubs, estimated lead times, and associated delivery fees.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-suppblue-600 hover:bg-suppblue-700 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all shadow-md shadow-suppblue-700/10 self-start sm:self-auto hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Shipping Zone
        </button>
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-suppblue-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="font-semibold text-red-950">Failed to load delivery settings</h3>
          <p className="text-xs text-red-700">Please ensure backend migrations are applied and retry.</p>
        </div>
      ) : !zones || zones.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-16 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-suppblue-50 text-suppblue-600 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">No shipping zones configured</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              You haven't defined any regional hubs. Contractors checking out will only be able to perform self-pickup until you add active zones.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            + Configure First Shipping Zone
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone: DeliveryZone) => (
            <div
              key={zone.reference}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all relative flex flex-col justify-between overflow-hidden group"
            >
              {/* Top Accent Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-suppblue-500 to-sky-400 opacity-80" />

              <div className="space-y-4">
                {/* Header Information */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-suppblue-50 text-suppblue-650 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-snug">{zone.city}</h3>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 border uppercase tracking-wider ${zone.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                      >
                        {zone.is_active ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Drawer */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(zone)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-suppblue-700 transition-colors"
                      title="Edit Zone Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete shipping zone for ${zone.city}?`)) {
                          deleteMutation.mutate(zone.reference)
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Zone Policy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Core Specifications */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-slate-400" /> Shipping Fee
                    </span>
                    <p className="text-base font-bold text-slate-900 font-mono">
                      KES {Number(zone.fee).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Transit Time
                    </span>
                    <p className="text-sm font-bold text-slate-700">
                      {zone.estimated_days} {zone.estimated_days === 1 ? "Business Day" : "Business Days"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-xl text-slate-900">
                  {editingZone ? "Edit Shipping Zone" : "Configure Shipping Zone"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust shipping fee profiles and logistics transit times.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-650 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-650">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* City Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Destination City / Region Hub *</label>
                <input
                  type="text"
                  placeholder="e.g. Nairobi, Mombasa, Nakuru"
                  {...register("city")}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-suppblue-500/10 focus:border-suppblue-500 transition-all font-semibold"
                />
                {errors.city && <p className="text-[10px] text-red-500 font-semibold">{errors.city.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Shipping Fee Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Shipping Fee (KES) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("fee", { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-suppblue-500/10 focus:border-suppblue-500 transition-all font-mono font-bold"
                  />
                  {errors.fee && <p className="text-[10px] text-red-500 font-semibold">{errors.fee.message}</p>}
                </div>

                {/* Estimated Lead Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Lead Time (Days) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="2"
                    {...register("estimated_days", { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-suppblue-500/10 focus:border-suppblue-500 transition-all font-semibold"
                  />
                  {errors.estimated_days && (
                    <p className="text-[10px] text-red-500 font-semibold">{errors.estimated_days.message}</p>
                  )}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div>
                  <label className="text-xs font-semibold text-slate-900">Active Status</label>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle whether shipping option is visible at checkout.</p>
                </div>
                <input
                  type="checkbox"
                  {...register("is_active")}
                  className="w-5 h-5 rounded border-slate-350 text-suppblue-600 focus:ring-suppblue-500 cursor-pointer"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-3 bg-suppblue-600 hover:bg-suppblue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-md shadow-suppblue-700/10"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingZone ? (
                    "Save Changes"
                  ) : (
                    "Add Zone"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
