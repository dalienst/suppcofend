"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  BadgeCheck, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  Coins,
  Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  registration_number: z.string().optional().or(z.literal("")),
  kra_pin: z.string().optional().or(z.literal("")),
  vat_compliance: z.preprocess((val) => !!val, z.boolean()),
  vat_number: z.string().optional().or(z.literal("")),
  currency: z.string().optional().or(z.literal("")),
  fiscal_year: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.vat_compliance && !data.vat_number) {
    return false;
  }
  return true;
}, {
  message: "VAT number is required if VAT compliant",
  path: ["vat_number"],
});

type CompanyValues = z.infer<typeof companySchema>

export default function SupplierCompanyPage() {
  const queryClient = useQueryClient()
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const { data: companyData, isLoading } = useQuery({
    queryKey: ["my-company"],
    queryFn: async () => {
      const response = await api.get("/api/v1/companies/my/")
      console.log("Fetched company data:", response.data)
      return response.data
    }
  })

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CompanyValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      registration_number: "",
      kra_pin: "",
      vat_compliance: false,
      vat_number: "",
      currency: "KES",
      fiscal_year: ""
    }
  })

  const vatCompliance = watch("vat_compliance")

  useEffect(() => {
    if (companyData) {
      reset({
        name: companyData.name || "",
        email: companyData.email || "",
        phone: companyData.phone || "",
        address: companyData.address || "",
        registration_number: companyData.registration_number || "",
        kra_pin: companyData.kra_pin || "",
        vat_compliance: companyData.vat_compliance || false,
        vat_number: companyData.vat_number || "",
        currency: companyData.currency || "",
        fiscal_year: companyData.fiscal_year || "",
      })
    }
  }, [companyData, reset])

  const mutation = useMutation({
    mutationFn: async (data: CompanyValues) => {
      const url = `/api/v1/companies/${companyData.reference}/`
      console.log("Patching to URL:", url)
      console.log("Data being sent:", data)
      return api.patch(url, data)
    },
    onSuccess: (response) => {
      console.log("Update success response:", response.data)
      queryClient.invalidateQueries({ queryKey: ["my-company"] })
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 3000)
    },
    onError: (error: any) => {
      console.error("Update failed!")
      console.error("Error status:", error.response?.status)
      console.error("Error details:", error.response?.data)
    }
  })

  const onSubmit = (data: CompanyValues) => {
    mutation.mutate(data)
  }

  if (isLoading || !companyData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin text-suppblue-600" />
        ) : (
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-slate-500 font-medium">Business profile not found.</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Profile</h1>
        <p className="text-slate-500 mt-1">Update your company's operational and compliance details.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Essential Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-suppblue-600" />
                General Information
              </h3>
            </div>
            
            <div className="p-8 space-y-6">
              {updateSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5" />
                  Company details updated successfully!
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Legal Company Name</label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 transition-all outline-none"
                  placeholder="Acme Industrial Ltd"
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Business Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register("email")}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 transition-all outline-none"
                      placeholder="office@company.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Primary Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register("phone")}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 transition-all outline-none"
                      placeholder="+254 700 000 000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Physical Address / Headquarters</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    {...register("address")}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 transition-all outline-none resize-none"
                    placeholder="123 Supply Ave, Industrial Area, Nairobi"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-suppblue-600" />
                Compliance & Registration
              </h3>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Registration Number</label>
                  <input
                    {...register("registration_number")}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 transition-all outline-none"
                    placeholder="PVT-XXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">KRA PIN</label>
                  <input
                    {...register("kra_pin")}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 transition-all outline-none"
                    placeholder="P0XXXXXXXX"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">VAT Compliance</p>
                    <p className="text-xs text-slate-500">Enable if your business is VAT registered.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      {...register("vat_compliance")}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-suppblue-600"></div>
                  </label>
                </div>

                {vatCompliance && (
                  <div className="pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">VAT Number</label>
                    <input
                      {...register("vat_number")}
                      className="w-full mt-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 transition-all outline-none"
                      placeholder="VAT-XXXXXX"
                    />
                    {errors.vat_number && <p className="text-xs text-red-500 mt-1">{errors.vat_number.message}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Meta */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Operations</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Default Currency</label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    {...register("currency")}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-suppblue-500/10"
                  >
                    <option value="KES">Kenyan Shilling (KES)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Fiscal Year End</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register("fiscal_year")}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-suppblue-500/10"
                    placeholder="December"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Update Business Profile
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-4 h-4" />
              <p className="text-xs font-bold">Verification Pending</p>
            </div>
            <p className="text-[10px] text-amber-600 leading-relaxed">
              Updates to legal information may require administrative review before appearing on public marketplace listings.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
