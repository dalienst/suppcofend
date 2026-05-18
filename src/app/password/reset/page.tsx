"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, ArrowRight, Zap, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"
import Link from "next/link"
import { useRouter } from "next/navigation"

const schema = z.object({
  email: z.string().email("Invalid email address"),
})

export default function RequestResetPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSent, setIsSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true)
    setError("")
    try {
      await api.post("/api/v1/auth/password/reset/", data)
      setIsSent(true)
    } catch (err: any) {
      setError(err.response?.data?.email?.[0] || "Account with this email does not exist.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-200 text-center space-y-8">
          <div className="w-20 h-20 bg-suppblue-50 text-suppblue-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900">Check Your Email</h1>
            <p className="text-slate-500">
              We've sent a 6-digit verification code to your email. Use it to reset your password.
            </p>
          </div>
          <button
            onClick={() => router.push("/password/new")}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
          >
            Enter Reset Code <ArrowRight className="w-4 h-4" />
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
            <span className="text-xl font-bold tracking-tight text-slate-900">SUPPCO</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Reset Password</h1>
          <p className="text-slate-500 mt-2">Enter your email to receive a reset code.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register("email")}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                placeholder="name@company.com"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email.message as string}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
          </button>

          <div className="text-center pt-4 border-t border-slate-100">
            <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
