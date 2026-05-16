"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  BadgeCheck, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Camera,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Invalid phone number"),
  identification: z.string().min(1, "ID/Passport is required"),
  kra_pin: z.string().min(1, "KRA PIN is required"),
  location: z.string().min(1, "Location is required"),
})

type ProfileValues = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const userId = (session?.user as any)?.id

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) return null
      const response = await api.get(`/api/v1/auth/${userId}/`)
      return response.data
    },
    enabled: !!userId,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        identification: profile.identification || "",
        kra_pin: profile.kra_pin || "",
        location: profile.location || "",
      })
    }
  }, [profile, reset])

  const mutation = useMutation({
    mutationFn: async (data: ProfileValues) => {
      return api.patch(`/api/v1/auth/${userId}/`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] })
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 3000)
    },
  })

  const onSubmit = (data: ProfileValues) => {
    mutation.mutate(data)
  }

  if (!session) return null

  const isSupplier = (session?.user as any)?.is_supplier
  const themeColor = isSupplier ? "suppblue" : "jungle"

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your professional profile and account security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-1">
          <button className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
            `bg-${themeColor}-50 text-${themeColor}-700`
          )}>
            <User className="w-4 h-4" />
            Profile Information
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all">
            <Shield className="w-4 h-4" />
            Security
          </button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center gap-6">
              <div className="relative group">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden border-2 border-white shadow-md">
                  <User className="w-10 h-10" />
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-lg shadow-lg border border-slate-100 text-slate-500 hover:text-slate-900 transition-all">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Profile Photo</h3>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {updateSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Profile updated successfully!
                </div>
              )}

              {mutation.isError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  Failed to update profile. Please try again.
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">First Name</label>
                  <input
                    {...register("first_name")}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                    placeholder="John"
                  />
                  {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
                  <input
                    {...register("last_name")}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                    placeholder="Doe"
                  />
                  {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <div className="relative opacity-60">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={session.user?.email || ""}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 ml-1">Email cannot be changed. Contact support for assistance.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register("phone")}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                    placeholder="+254 700 000 000"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">ID/Passport No.</label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register("identification")}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">KRA PIN</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register("kra_pin")}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Primary Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register("location")}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={mutation.isPending}
                className={cn(
                  "px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg",
                  isSupplier 
                    ? "bg-suppblue-700 hover:bg-suppblue-800 shadow-suppblue-700/20" 
                    : "bg-jungle-700 hover:bg-jungle-800 shadow-jungle-700/20",
                  "disabled:opacity-50"
                )}
              >
                {mutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
