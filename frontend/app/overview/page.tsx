"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  TrendingUp, 
  Package, 
  Users, 
  FileText,
  ArrowRight,
  Zap,
  BookOpen,
} from "lucide-react"

export default function OverviewPage() {
  const stats = [
    {
      label: "Active Clients",
      value: "847",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      label: "Shipments Processed",
      value: "12,430",
      change: "+8.2%",
      icon: Package,
      color: "text-emerald-600"
    },
    {
      label: "System Health",
      value: "99.8%",
      change: "Optimal",
      icon: Activity,
      color: "text-amber-600"
    },
    {
      label: "Avg Response Time",
      value: "340ms",
      change: "-2.1%",
      icon: Zap,
      color: "text-purple-600"
    },
  ]

  const features = [
    {
      title: "Client Inbox",
      description: "Manage incoming client requests and shipment inquiries with real-time processing",
      href: "/agents/external",
      icon: Package,
      accent: "bg-blue-500/10 border-blue-500/30"
    },
    {
      title: "AI Agent",
      description: "Interact with our logistics AI for policy, Incoterms, and operational data queries",
      href: "/agents/internal",
      icon: Zap,
      accent: "bg-amber-500/10 border-amber-500/30"
    },
    {
      title: "Knowledge Base",
      description: "Browse comprehensive logistics data: Incoterms, CMR, FAQ, and company policies",
      href: "/knowledge-base",
      icon: BookOpen,
      accent: "bg-emerald-500/10 border-emerald-500/30"
    },
    {
      title: "Processes",
      description: "Monitor automated workflows and operational pipelines in real-time",
      href: "/processes",
      icon: Activity,
      accent: "bg-purple-500/10 border-purple-500/30"
    },
  ]

  const recentActivity = [
    { type: "request", message: "New client request: FOB vs CIF comparison", time: "2 mins ago" },
    { type: "success", message: "Processed 847 shipments today", time: "5 mins ago" },
    { type: "info", message: "CMR knowledge base updated", time: "1 hour ago" },
    { type: "request", message: "Pricing inquiry from NordRoute client", time: "3 hours ago" },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Logistics Operations Dashboard
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="mt-1 font-mono text-xs text-emerald-600">{stat.change}</p>
                    </div>
                    <div className={`rounded-lg bg-muted p-2 ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-3">
        {/* Features */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-3 overflow-hidden lg:col-span-2"
        >
          <div>
            <h2 className="font-bold text-foreground">Quick Access</h2>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Jump to key features
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Link key={feature.title} href={feature.href}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    className={`group h-full rounded-lg border ${feature.accent} p-4 transition-all`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium text-foreground">{feature.title}</p>
                        </div>
                        <p className="mt-1 line-clamp-2 font-mono text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-3 overflow-hidden"
        >
          <div>
            <h2 className="font-bold text-foreground">Recent Activity</h2>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Last 4 events
            </p>
          </div>
          <Card className="flex flex-1 flex-col overflow-hidden border-border">
            <CardContent className="flex-1 space-y-0 overflow-y-auto p-0">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="border-b border-border p-3 last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      activity.type === "success" ? "bg-emerald-500" :
                      activity.type === "request" ? "bg-blue-500" :
                      "bg-amber-500"
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-relaxed text-foreground line-clamp-2">
                        {activity.message}
                      </p>
                      <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3"
      >
        <div>
          <p className="text-sm font-medium text-foreground">Ready to get started?</p>
          <p className="font-mono text-xs text-muted-foreground">
            Head to the Inbox to manage client requests
          </p>
        </div>
        <Link href="/agents/external">
          <Button className="gap-2" size="sm">
            Go to Inbox
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
