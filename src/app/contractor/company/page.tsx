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
  vat_compliance: z.boolean(),
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

export default function ContractorCompanyPage() {
  const queryClient = useQueryClient()
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const { data: companyData, isLoading } = useQuery({
    queryKey: ["my-company"],
    queryFn: async () => {
      const response = await api.get("/api/v1/companies/my/")
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
      return api.patch(`/api/v1/companies/${companyData.reference}/`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-company"] })
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 3000)
    },
  })

  const onSubmit = (data: CompanyValues) => {
    const payload: any = { ...data }
    if (payload.email === "") payload.email = null
    if (payload.phone === "") payload.phone = null
    if (payload.registration_number === "") payload.registration_number = null
    if (payload.kra_pin === "") payload.kra_pin = null
    if (payload.vat_number === "") payload.vat_number = null

    mutation.mutate(payload)
  }

  if (isLoading || !companyData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin text-jungle-600" />
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
    <div className="p-4 mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Profile</h1>
        <p className="text-slate-500 mt-1">Manage your contractor entity and compliance status.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-jungle-600" />
                Company Details
              </h3>
            </div>
            
            <div className="p-8 space-y-6">
              {updateSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5" />
                  Business profile updated successfully!
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Legal Entity Name</label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/10 transition-all outline-none"
                  placeholder="Apex Construction Ltd"
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
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/10 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register("phone")}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/10 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Headquarters / Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    {...register("address")}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/10 transition-all outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-jungle-600" />
                Legal & Tax Compliance
              </h3>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Company Reg. No.</label>
                  <input
                    {...register("registration_number")}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/10 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">KRA PIN</label>
                  <input
                    {...register("kra_pin")}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/10 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">VAT Registration</p>
                    <p className="text-xs text-slate-500">Enable if the company is VAT compliant.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      {...register("vat_compliance")}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-jungle-600"></div>
                  </label>
                </div>

                {vatCompliance && (
                  <div className="pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">VAT Certificate Number</label>
                    <input
                      {...register("vat_number")}
                      className="w-full mt-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/10 transition-all outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Update Contractor Profile
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
