"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "@/lib/api"
import {
  CreditCard,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle,
  Check,
  X,
  Sliders,
  DollarSign
} from "lucide-react"
import toast from "react-hot-toast"

// Types matching backend models
interface PaymentOption {
  reference: string;
  name: string;
  payment_type: "FIXED" | "PAYMENT_ON_DELIVERY" | "SPLIT_50_50" | "FLEXIBLE";
  min_deposit_percentage: string | number | null;
  interest_rate: string | number;
  description: string | null;
  is_active: boolean;
  user: string;
  created_at: string;
}

// Zod Schema matching backend validation rules
const paymentOptionSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  payment_type: z.enum(["FIXED", "PAYMENT_ON_DELIVERY", "SPLIT_50_50", "FLEXIBLE"]),
  min_deposit_percentage: z.union([z.number(), z.string(), z.null()]).optional(),
  interest_rate: z.union([z.number(), z.string()]).optional(),
  description: z.string().optional().or(z.literal("")),
  is_active: z.boolean(),
}).superRefine((data, ctx) => {
  if (data.payment_type === "FLEXIBLE") {
    if (data.min_deposit_percentage === null || data.min_deposit_percentage === undefined || data.min_deposit_percentage === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["min_deposit_percentage"],
        message: "Minimum deposit percentage is required for FLEXIBLE payment type.",
      });
    } else {
      const num = Number(data.min_deposit_percentage);
      if (isNaN(num) || num <= 0 || num > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["min_deposit_percentage"],
          message: "Value must be between 0 and 100.",
        });
      }
    }
  }
});

type PaymentOptionFormValues = z.infer<typeof paymentOptionSchema>

export default function PaymentOptionsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOption, setEditingOption] = useState<PaymentOption | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetching options
  const { data: options, isLoading, error } = useQuery<PaymentOption[]>({
    queryKey: ["paymentoptions"],
    queryFn: async () => {
      const response = await api.get("/api/v1/paymentoptions/")
      return response.data.results
    }
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<PaymentOptionFormValues>({
    resolver: zodResolver(paymentOptionSchema),
    defaultValues: {
      payment_type: "FIXED",
      interest_rate: 0,
      min_deposit_percentage: null,
      is_active: true,
      description: ""
    }
  })

  const selectedPaymentType = watch("payment_type")

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post("/api/v1/paymentoptions/", data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentoptions"] })
      toast.success("Payment policy created successfully!")
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.non_field_errors?.[0] || "Failed to create payment option."
      setErrorMessage(msg)
      toast.error(msg)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ reference, data }: { reference: string, data: any }) => {
      return api.patch(`/api/v1/paymentoptions/${reference}/`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentoptions"] })
      toast.success("Payment policy updated successfully!")
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.non_field_errors?.[0] || "Failed to update payment option."
      setErrorMessage(msg)
      toast.error(msg)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (reference: string) => {
      return api.delete(`/api/v1/paymentoptions/${reference}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentoptions"] })
      toast.success("Payment policy deleted successfully!")
    },
    onError: (err: any) => {
      toast.error("Failed to delete payment policy.")
    }
  })

  const openCreateModal = () => {
    setEditingOption(null)
    setErrorMessage(null)
    reset({
      name: "",
      payment_type: "FIXED",
      interest_rate: 0,
      min_deposit_percentage: null,
      is_active: true,
      description: ""
    })
    setIsModalOpen(true)
  }

  const openEditModal = (option: PaymentOption) => {
    setEditingOption(option)
    setErrorMessage(null)
    reset({
      name: option.name,
      payment_type: option.payment_type,
      interest_rate: Number(option.interest_rate),
      min_deposit_percentage: option.min_deposit_percentage ? Number(option.min_deposit_percentage) : null,
      is_active: option.is_active,
      description: option.description || ""
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingOption(null)
    setErrorMessage(null)
  }

  const onSubmit = (data: PaymentOptionFormValues) => {
    setErrorMessage(null)
    const payload = {
      name: data.name,
      payment_type: data.payment_type,
      description: data.description,
      is_active: data.is_active,
      min_deposit_percentage: data.payment_type === "FLEXIBLE" && data.min_deposit_percentage !== "" && data.min_deposit_percentage !== null
        ? Number(data.min_deposit_percentage)
        : null,
      interest_rate: data.interest_rate !== "" && data.interest_rate !== undefined
        ? Number(data.interest_rate)
        : 0
    }
    if (editingOption) {
      updateMutation.mutate({ reference: editingOption.reference, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleDelete = (reference: string) => {
    if (confirm("Are you sure you want to delete this payment option?")) {
      deleteMutation.mutate(reference)
    }
  }

  return (
    <div className="p-4 container mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-suppblue-600" />
            Payment Options
          </h1>
          <p className="text-slate-500 mt-1">Configure credit policies, flexible installments, and direct payment methods for your inventory catalog.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-suppblue-600 hover:bg-suppblue-700 text-white font-semibold px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-suppblue-600/20 transition-all"
        >
          <Plus className="w-5 h-5" /> Add Payment Option
        </button>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-suppblue-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Failed to load payment options. Please try again.</span>
        </div>
      ) : !options || options.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <CreditCard className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900 text-lg">No Payment Options</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Create customized payment policies to list on your products so contractors know your transaction terms.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="text-sm font-semibold text-white bg-suppblue-600 hover:bg-suppblue-700 px-4 py-2.5 rounded-xl transition-all"
          >
            Create Your First Policy
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">Policy Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Min Deposit</th>
                  <th className="px-6 py-4 text-right">Interest Rate</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {options.map((option) => (
                  <tr key={option.reference} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{option.name}</p>
                        {option.description && (
                          <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">{option.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 font-mono">
                        {option.payment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {option.min_deposit_percentage ? `${Number(option.min_deposit_percentage).toFixed(0)}%` : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {Number(option.interest_rate) > 0 ? `${Number(option.interest_rate).toFixed(1)}%` : "0.0%"}
                    </td>
                    <td className="px-6 py-4">
                      {option.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(option)}
                          className="p-2 text-slate-600 hover:text-suppblue-600 hover:bg-suppblue-50 rounded-lg transition-colors"
                          title="Edit Policy"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(option.reference)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Policy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingOption ? "Edit Payment Policy" : "New Payment Policy"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto flex-1">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Policy Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Policy Name</label>
                <input
                  {...register("name")}
                  placeholder="e.g. 50% Upfront, Balance on Delivery"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none"
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              {/* Payment Type Choice */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Payment Structure</label>
                <select
                  {...register("payment_type")}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none"
                >
                  <option value="FIXED">FIXED (100% Upfront)</option>
                  <option value="PAYMENT_ON_DELIVERY">PAYMENT ON DELIVERY</option>
                  <option value="SPLIT_50_50">SPLIT 50/50</option>
                  <option value="FLEXIBLE">FLEXIBLE (Installments)</option>
                </select>
                {errors.payment_type && <p className="text-xs text-red-500">{errors.payment_type.message}</p>}
              </div>

              {/* Flexible Configuration Details */}
              {selectedPaymentType === "FLEXIBLE" && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Min Deposit (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("min_deposit_percentage")}
                      placeholder="e.g. 20"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none"
                    />
                    {errors.min_deposit_percentage && <p className="text-xs text-red-500">{errors.min_deposit_percentage.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("interest_rate")}
                      placeholder="e.g. 5"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none"
                    />
                    {errors.interest_rate && <p className="text-xs text-red-500">{errors.interest_rate.message}</p>}
                  </div>
                </div>
              )}

              {/* Policy Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Description (Optional)</label>
                <textarea
                  {...register("description")}
                  placeholder="Summarize the credit conditions or installment criteria..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none resize-none"
                />
              </div>

              {/* Is Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Is Policy Active?</p>
                  <p className="text-xs text-slate-500 mt-0.5">Inactive policies cannot be selected for new products.</p>
                </div>
                <input
                  type="checkbox"
                  {...register("is_active")}
                  className="w-5 h-5 rounded border-slate-300 text-suppblue-600 focus:ring-suppblue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 bg-suppblue-600 hover:bg-suppblue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingOption ? "Save Changes" : "Create Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
