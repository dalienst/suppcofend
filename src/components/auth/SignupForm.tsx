"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, Lock, User, Phone, MapPin, BadgeCheck, FileText, ArrowRight, Eye, EyeOff } from "lucide-react"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Invalid phone number"),
  identification: z.string().min(1, "ID/Passport is required"),
  kra_pin: z.string().min(1, "KRA PIN is required"),
  location: z.string().min(1, "Location is required"),
})

type SignupFormValues = z.infer<typeof signupSchema>

interface SignupFormProps {
  role: "supplier" | "contractor"
}

export function SignupForm({ role }: SignupFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true)
    setError("")
    try {
      await api.post(`/api/v1/auth/signup/${role}/`, data)
      setSuccess(true)
    } catch (err: any) {
      console.error("Signup error:", err)
      const msg = err.response?.data ? Object.values(err.response.data).flat().join(" ") : "An error occurred during signup."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const themeColor = role === "contractor" ? "jungle" : "suppblue"

  if (success) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className={cn("w-20 h-20 mx-auto rounded-full flex items-center justify-center", `bg-${themeColor}-100 text-${themeColor}-600`)}>
          <BadgeCheck className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Verify Your Email</h2>
        <p className="text-slate-500 max-w-sm mx-auto">
          We've sent a verification link to your email. Please check your inbox and click the link to activate your account.
        </p>
        <Link
          href="/login"
          className={cn("inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all", `bg-${themeColor}-700 hover:bg-${themeColor}-800 shadow-lg shadow-${themeColor}-700/20`)}
        >
          Go to Login <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest px-1">Identity</h3>

          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register("email")}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
                placeholder="Email Address"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <input
              {...register("first_name")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              placeholder="First Name"
            />
            {errors.first_name && <p className="text-xs text-red-500 ml-1">{errors.first_name.message}</p>}
          </div>

          <div className="space-y-2">
            <input
              {...register("last_name")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              placeholder="Last Name"
            />
            {errors.last_name && <p className="text-xs text-red-500 ml-1">{errors.last_name.message}</p>}
          </div>
        </div>

        {/* Business Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest px-1">Compliance & Reach</h3>

          <div className="space-y-2">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register("phone")}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
                placeholder="Phone Number"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register("identification")}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
                placeholder="National ID / Passport No."
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register("kra_pin")}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
                placeholder="KRA PIN"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register("location")}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
                placeholder="Business Location / City"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "w-full py-4 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg",
          role === "contractor"
            ? "bg-jungle-700 hover:bg-jungle-800 shadow-jungle-700/20"
            : "bg-suppblue-700 hover:bg-suppblue-800 shadow-suppblue-700/20",
          "disabled:opacity-50"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Complete Registration
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-slate-900 hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  )
}
