"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Lock, KeyRound, ArrowRight, Zap, CheckCircle2, Eye, EyeOff } from "lucide-react"
import api from "@/lib/api"
import Link from "next/link"
import { useRouter } from "next/navigation"

const schema = z.object({
  code: z.string().length(6, "Code must be exactly 6 characters"),
  password: z.string().min(5, "Password must be at least 5 characters"),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
})

export default function NewPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setError("")
    try {
      await api.post("/api/v1/auth/password/new/", {
        code: data.code,
        password: data.password
      })
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || "Invalid or expired code.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-200 text-center space-y-8">
          <div className="w-20 h-20 bg-jungle-50 text-jungle-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900">Password Updated!</h1>
            <p className="text-slate-500">
              Your password has been reset successfully. You can now sign in with your new credentials.
            </p>
          </div>
          <button 
            onClick={() => router.push("/login")}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
          >
            Go to Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-200 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span className="text-xl font-black tracking-tight text-slate-900">SUPPCO</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Create New Password</h1>
          <p className="text-slate-500 mt-2">Enter the 6-digit code sent to your email.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Reset Code */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Verification Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register("code")}
                maxLength={6}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-[0.5em] focus:ring-2 focus:ring-slate-900/10 transition-all"
                placeholder="000000"
              />
            </div>
            {errors.code && <p className="text-xs text-red-500">{errors.code.message as string}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message as string}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("confirm_password")}
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                placeholder="••••••••"
              />
            </div>
            {errors.confirm_password && <p className="text-xs text-red-500">{errors.confirm_password.message as string}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
