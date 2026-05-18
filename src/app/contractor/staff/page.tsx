"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { 
  Users, 
  UserPlus, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  UserCheck, 
  Loader2, 
  X, 
  Check, 
  AlertCircle,
  FileText,
  BadgeInfo,
  Link,
  Unlink,
  Pencil,
  Trash2,
  Warehouse
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

// TypeScript Interfaces matching API response
interface Site {
  reference: string
  name: string
  address: string | null
  identity: string
}

interface Role {
  reference: string
  name: string
  identity: string
  is_head: boolean
}

interface EmploymentDetail {
  role: string
  company: string
  is_active: boolean
  identity: string
  created_at: string
}

interface MiniBranchSiteDetail {
  id: number
  name: string
  address: string | null
  reference: string
  identity: string
}

interface EmployeeUser {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  phone: string | null
  identification: string | null
  kra_pin: string | null
  location: string | null
  assigned_branch: string | null
  assigned_site: string | null
  assigned_site_details: MiniBranchSiteDetail | null
  employment: EmploymentDetail[]
}

// Zod Validation Schema for Employee Invitation
const inviteSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  identification: z.string().optional().or(z.literal("")),
  kra_pin: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  role: z.string().min(1, "Selecting a role is required"),
  site: z.string().optional().or(z.literal("")),
})

type InviteValues = z.infer<typeof inviteSchema>

export default function ContractorStaffPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [assigningEmployee, setAssigningEmployee] = useState<EmployeeUser | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeUser | null>(null)
  
  // Form Setup
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      identification: "",
      kra_pin: "",
      location: "",
      role: "",
      site: "",
    }
  })

  // Fetch Site Base Reference
  const { data: sitesData } = useQuery({
    queryKey: ["contractor-sites"],
    queryFn: async () => {
      const response = await api.get("/api/v1/sites/")
      return response.data.results || response.data
    }
  })

  // Fetch Roles
  const { data: rolesData } = useQuery({
    queryKey: ["contractor-roles"],
    queryFn: async () => {
      const response = await api.get("/api/v1/roles/")
      return response.data.results || response.data
    }
  })

  // Fetch Staff
  const { data: staffData, isLoading: isLoadingStaff } = useQuery({
    queryKey: ["contractor-staff"],
    queryFn: async () => {
      const response = await api.get("/api/v1/auth/add/employee/")
      return response.data.results || response.data
    }
  })

  // Create / Invite Mutation
  const inviteMutation = useMutation({
    mutationFn: async (data: InviteValues) => {
      // If editing, use PATCH
      if (editingEmployee) {
        const payload = { ...data }
        // Remove locked fields
        delete payload.username
        if (!payload.password) delete payload.password
        
        return api.patch(`/api/v1/auth/add/employee/${editingEmployee.username}/`, payload)
      }
      
      // If creating, use POST
      const payload: any = { ...data }
      if (!payload.site) delete payload.site
      if (!payload.password) delete payload.password
      
      return api.post("/api/v1/auth/add/employee/", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor-staff"] })
      toast.success(editingEmployee ? "Profile updated successfully!" : "Staff member invited successfully!")
      closeModal()
    },
    onError: (err: any) => {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.username?.[0] || err.response?.data?.non_field_errors?.[0] || "An error occurred."
      toast.error(msg)
    }
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (username: string) => {
      return api.delete(`/api/v1/auth/add/employee/${username}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor-staff"] })
      toast.success("Employee deactivated and removed.")
    },
    onError: () => {
      toast.error("Failed to deactivate employee.")
    }
  })

  // Assignment Mutations
  const assignMutation = useMutation({
    mutationFn: async ({ username, siteIdentity }: { username: string, siteIdentity: string }) => {
      return api.post("/api/v1/employees/assign/", {
        employee_username: username,
        site: siteIdentity
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor-staff"] })
      toast.success("Staff assigned to site successfully!")
      setAssigningEmployee(null)
    },
    onError: () => {
      toast.error("Failed to assign staff.")
    }
  })

  const unassignMutation = useMutation({
    mutationFn: async ({ username, siteIdentity }: { username: string, siteIdentity: string }) => {
      return api.post("/api/v1/employees/unassign/", {
        employee_username: username,
        site: siteIdentity
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor-staff"] })
      toast.success("Staff unassigned successfully!")
    },
    onError: () => {
      toast.error("Failed to unassign staff.")
    }
  })

  const openModalForInvite = () => {
    setEditingEmployee(null)
    reset({
      first_name: "", last_name: "", username: "", email: "", password: "",
      phone: "", identification: "", kra_pin: "", location: "", role: "", site: ""
    })
    setIsModalOpen(true)
  }

  const openModalForEdit = (employee: EmployeeUser) => {
    setEditingEmployee(employee)
    reset({
      first_name: employee.first_name,
      last_name: employee.last_name,
      username: employee.username,
      email: employee.email,
      phone: employee.phone || "",
      identification: employee.identification || "",
      kra_pin: employee.kra_pin || "",
      location: employee.location || "",
      role: employee.employment?.[0]?.role || "",
      site: employee.assigned_site_details?.identity || "",
      password: "" // Keep empty, only patch if typed
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingEmployee(null)
  }

  const onSubmit = (data: InviteValues) => {
    inviteMutation.mutate(data)
  }

  const handleDelete = (username: string) => {
    if (confirm(`Are you sure you want to deactivate and remove @${username}?`)) {
      deleteMutation.mutate(username)
    }
  }

  const staff = staffData || []
  const sites = sitesData || []
  const roles = rolesData || []

  return (
    <div className="p-4 sm:p-8 mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff & Team Cockpit</h1>
          <p className="text-slate-500 mt-1">Manage personnel, site allocations, and internal roles.</p>
        </div>
        <button
          onClick={openModalForInvite}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="w-5 h-5" />
          Invite Staff
        </button>
      </div>

      {/* Directory Grid */}
      {isLoadingStaff ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-jungle-600" />
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">No staff registered</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Invite construction workers, site managers, and accountants to collaborate.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Employee Details</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Security / ID</th>
                  <th className="px-6 py-4">Base Location (Site)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((member: EmployeeUser) => {
                  const employment = member.employment?.[0]
                  const roleName = roles.find((r: Role) => r.identity === employment?.role)?.name || "Staff"
                  const isHead = roles.find((r: Role) => r.identity === employment?.role)?.is_head
                  const site = member.assigned_site_details

                  return (
                    <tr key={member.username} className="hover:bg-slate-50/50 transition-colors group relative">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-jungle-50 text-jungle-700 font-black rounded-xl flex items-center justify-center shrink-0 border border-jungle-100/50">
                            {member.first_name?.[0] || member.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{member.first_name} {member.last_name}</span>
                              {isHead && (
                                <span className="inline-flex items-center justify-center bg-amber-100 text-amber-700 w-4 h-4 rounded-full" title="Department Head">
                                  <UserCheck className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">@{member.username}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                                {roleName}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Hover Action Suite */}
                        <div className="absolute left-6 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                          <button 
                            onClick={() => openModalForEdit(member)}
                            className="text-[10px] font-bold text-jungle-600 hover:text-jungle-700 flex items-center gap-1"
                          >
                            <Pencil className="w-3 h-3" /> Edit Profile
                          </button>
                          <span className="text-slate-300">|</span>
                          <button 
                            onClick={() => handleDelete(member.username)}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Deactivate Account
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs">{member.phone || "No phone"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <BadgeInfo className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-mono">{member.identification || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-mono">{member.kra_pin || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {site ? (
                          <div className="flex items-center gap-2 bg-jungle-50 text-jungle-700 px-3 py-1.5 rounded-lg border border-jungle-100 w-fit">
                            <Warehouse className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-bold">{site.name}</span>
                            <button
                              onClick={() => unassignMutation.mutate({ username: member.username, siteIdentity: site.identity })}
                              disabled={unassignMutation.isPending}
                              className="ml-2 p-1 hover:bg-jungle-100 rounded text-jungle-600 hover:text-red-600 transition-colors"
                              title="Unlink from Site"
                            >
                              <Unlink className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          assigningEmployee?.username === member.username ? (
                            <div className="flex items-center gap-2 w-fit">
                              <select
                                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-jungle-500 bg-slate-50"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    assignMutation.mutate({ username: member.username, siteIdentity: e.target.value })
                                  } else {
                                    setAssigningEmployee(null)
                                  }
                                }}
                                disabled={assignMutation.isPending}
                              >
                                <option value="">Select site...</option>
                                {sites.map((s: Site) => (
                                  <option key={s.identity} value={s.identity}>{s.name}</option>
                                ))}
                              </select>
                              <button 
                                onClick={() => setAssigningEmployee(null)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAssigningEmployee(member)}
                              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-jungle-600 border border-dashed border-slate-300 hover:border-jungle-300 hover:bg-jungle-50 px-3 py-1.5 rounded-lg transition-all"
                            >
                              <Link className="w-3 h-3" /> Assign Site
                            </button>
                          )
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {employment?.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Registration / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="font-black text-xl text-slate-900 flex items-center gap-2">
                  {editingEmployee ? <Pencil className="w-5 h-5 text-jungle-600" /> : <UserPlus className="w-5 h-5 text-jungle-600" />}
                  {editingEmployee ? "Edit Employee Profile" : "Register Employee"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {editingEmployee ? "Update profile or reset credentials." : "Generate secure credentials for a new team member."}
                </p>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Primary Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">First Name <span className="text-red-500">*</span></label>
                    <input
                      {...register("first_name")}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none"
                    />
                    {errors.first_name && <p className="text-[10px] text-red-500 ml-1">{errors.first_name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Last Name <span className="text-red-500">*</span></label>
                    <input
                      {...register("last_name")}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none"
                    />
                    {errors.last_name && <p className="text-[10px] text-red-500 ml-1">{errors.last_name.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Email Address <span className="text-red-500">*</span></label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none"
                  />
                  {errors.email && <p className="text-[10px] text-red-500 ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Contact Phone</label>
                  <input
                    {...register("phone")}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Security & Identity</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">National ID / Passport</label>
                    <input
                      {...register("identification")}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">KRA PIN</label>
                    <input
                      {...register("kra_pin")}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Physical Location</label>
                  <input
                    {...register("location")}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none"
                    placeholder="e.g. Nairobi, Kenya"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">System Access</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Corporate Role <span className="text-red-500">*</span></label>
                  <select
                    {...register("role")}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none"
                  >
                    <option value="">Select a role...</option>
                    {roles.map((role: Role) => (
                      <option key={role.identity} value={role.identity}>{role.name}</option>
                    ))}
                  </select>
                  {errors.role && <p className="text-[10px] text-red-500 ml-1">{errors.role.message}</p>}
                </div>

                {!editingEmployee && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Assign Base Site (Optional)</label>
                    <select
                      {...register("site")}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none"
                    >
                      <option value="">No branch allocation initially</option>
                      {sites.map((s: Site) => (
                        <option key={s.identity} value={s.identity}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="p-4 bg-jungle-50 rounded-2xl border border-jungle-100 space-y-3 mt-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-jungle-600" />
                    <p className="text-sm font-bold text-jungle-800">Login Credentials</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Username <span className="text-red-500">*</span></label>
                    <input
                      {...register("username")}
                      disabled={!!editingEmployee}
                      className={cn(
                        "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none",
                        editingEmployee && "opacity-50 cursor-not-allowed bg-slate-100"
                      )}
                    />
                    {errors.username && <p className="text-[10px] text-red-500 ml-1">{errors.username.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Temporary Password</label>
                    <input
                      {...register("password")}
                      type="password"
                      placeholder={editingEmployee ? "Leave blank to keep current password" : "••••••••"}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3 border-t border-slate-100 pb-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3.5 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="flex-1 px-4 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inviteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingEmployee ? "Save Changes" : "Register Employee"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
