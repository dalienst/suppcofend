"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, BadgeCheck, XCircle, ArrowRight, Zap } from "lucide-react"
import api from "@/lib/api"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function VerifyEmailPage() {
  const { uidb64, token } = useParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verify = async () => {
      try {
        await api.patch(`/api/v1/auth/verify-email/${uidb64}/${token}/`)
        setStatus("success")
      } catch (err: any) {
        console.error("Verification error:", err)
        setStatus("error")
        setMessage(err.response?.data?.message || "Invalid or expired verification link.")
      }
    }

    if (uidb64 && token) {
      verify()
    }
  }, [uidb64, token])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-200 text-center space-y-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
          <span className="text-xl font-bold tracking-tight text-slate-900">SUPPCO</span>
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Verifying Account...</h1>
            <p className="text-slate-500">Please wait while we activate your account.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-jungle-100 text-jungle-600 rounded-full flex items-center justify-center mx-auto scale-110">
              <BadgeCheck className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900">Email Verified!</h1>
              <p className="text-slate-500">
                Your account is now active. You can sign in to access the marketplace.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-slate-900/20"
            >
              Sign In to Your Account <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900">Verification Failed</h1>
              <p className="text-slate-500">{message}</p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-900 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
