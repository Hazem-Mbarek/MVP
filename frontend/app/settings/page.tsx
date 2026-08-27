"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Settings, Bell, Lock, Zap, Users, Shield } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3"
      >
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-md px-3 text-sm">
              <ChevronLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="text-base font-semibold">Settings</h1>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">System & Configuration</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-12">
        {/* Left Panel - Settings Menu */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="overflow-y-auto lg:col-span-3"
        >
          <Card className="flex h-full flex-col overflow-hidden rounded border-border">
            <CardHeader className="shrink-0 border-b border-border p-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-500" />
                <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Categories
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {[
                { id: "general", name: "General", icon: Settings },
                { id: "notifications", name: "Notifications", icon: Bell },
                { id: "security", name: "Security", icon: Lock },
                { id: "agents", name: "Agents", icon: Zap },
                { id: "team", name: "Team", icon: Users },
                { id: "advanced", name: "Advanced", icon: Shield },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={
                    item.id === activeTab
                      ? "w-full border-b border-border border-l-2 border-l-blue-500 bg-blue-500/10 px-3 py-3 text-left transition-colors hover:bg-blue-500/15"
                      : "w-full border-b border-border px-3 py-3 text-left transition-colors hover:bg-muted/50"
                  }
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Center Panel - Settings Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="overflow-y-auto lg:col-span-5"
        >
          {saved && (
            <Alert className="mb-4 border-emerald-500/30 bg-emerald-500/10">
              <AlertDescription className="text-emerald-600 font-mono text-[10px] uppercase">
                ✓ Settings saved successfully
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {activeTab === "general" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      General Settings
                    </CardTitle>
                    <CardDescription>Basic system configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="system-name">Fleet Name</Label>
                      <Input id="system-name" defaultValue="LogHub - Logistics Operations" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="organization">Company Name</Label>
                      <Input id="organization" defaultValue="LogHub Transportation Inc." className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Service Region Timezone</Label>
                      <Input id="timezone" defaultValue="EST" className="mt-2" />
                    </div>
                    <div>
                      <Label>Theme Preference</Label>
                      <div className="mt-2 flex gap-2">
                        <Badge className="bg-blue-500">Dark (Current)</Badge>
                        <Badge variant="outline">Light</Badge>
                      </div>
                    </div>
                    <Button onClick={handleSave} className="w-full">Save Changes</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>Configure alert settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { name: "Shipment Alerts", desc: "Notify on shipment status changes" },
                        { name: "Delivery Updates", desc: "Real-time delivery notifications" },
                        { name: "Maintenance Reminders", desc: "Fleet maintenance & service alerts" },
                        { name: "System Updates", desc: "LogHub system and app notifications" },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center justify-between p-3 rounded border border-border">
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          <Badge className="bg-emerald-500">Enabled</Badge>
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleSave} className="w-full">Save Preferences</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Authentication and access control</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <div className="mt-2">
                        <Badge className="bg-emerald-500">Enabled</Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Session Timeout (minutes)</Label>
                      <Input defaultValue="45" type="number" className="mt-2" />
                    </div>
                    <div>
                      <Label>Access Control</Label>
                      <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                        <p>✓ Role-based access control</p>
                        <p>✓ Driver & dispatcher permissions</p>
                        <p>✓ Manager approval required</p>
                      </div>
                    </div>
                    <div>
                      <Label>API Keys</Label>
                      <div className="mt-2 rounded border border-border p-2 font-mono text-xs text-muted-foreground">
                        sk-••••••••••••••••••••
                      </div>
                    </div>
                    <Button onClick={handleSave} className="w-full">Save Security Settings</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "agents" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Agent Configuration
                    </CardTitle>
                    <CardDescription>Configure agent behaviors and parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { name: "Route Planner", status: "Active", confidence: "98%" },
                        { name: "Tracking System", status: "Active", confidence: "99%" },
                        { name: "Delivery Manager", status: "Active", confidence: "96%" },
                        { name: "Fleet Monitor", status: "Active", confidence: "97%" },
                      ].map((agent) => (
                        <div key={agent.name} className="flex items-center justify-between p-3 rounded border border-border">
                          <div>
                            <p className="font-medium text-sm">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">Confidence: {agent.confidence}</p>
                          </div>
                          <Badge className="bg-emerald-500">{agent.status}</Badge>
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleSave} className="w-full">Save Agent Settings</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "team" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Management
                    </CardTitle>
                    <CardDescription>Manage team members and permissions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      {[
                        { name: "John Martinez", role: "Fleet Manager", status: "Active" },
                        { name: "Sarah Chen", role: "Dispatcher", status: "Active" },
                        { name: "Mike Johnson", role: "Driver", status: "Inactive" },
                      ].map((member) => (
                        <div key={member.name} className="flex items-center justify-between p-3 rounded border border-border">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                          <Badge variant={member.status === "Active" ? "default" : "secondary"}>
                            {member.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline">Add Team Member</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "advanced" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Advanced Settings
                    </CardTitle>
                    <CardDescription>Advanced system configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="log-level">Event Log Level</Label>
                      <Input id="log-level" defaultValue="INFO" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="retention">Shipment Data Retention (days)</Label>
                      <Input id="retention" defaultValue="365" type="number" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="batch-size">Batch Import Size</Label>
                      <Input id="batch-size" defaultValue="500" type="number" className="mt-2" />
                    </div>
                    <Alert className="border-amber-500/30 bg-amber-500/10">
                      <AlertDescription className="text-amber-600 text-xs">
                        Changing advanced settings may impact system performance. Use with caution.
                      </AlertDescription>
                    </Alert>
                    <Button onClick={handleSave} className="w-full">Save Advanced Settings</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Panel - System Info */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full min-h-[400px] lg:col-span-4"
        >
          <Card className="flex h-full flex-col overflow-hidden rounded border-border bg-zinc-950">
            <CardHeader className="shrink-0 border-b border-zinc-800 px-3 py-2">
              <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                System Information
              </span>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-3">
              <div className="space-y-4 font-mono text-[10px]">
                <div>
                  <span className="text-zinc-500">VERSION</span>
                  <p className="mt-1 text-blue-400">v1.0.0</p>
                </div>
                <div>
                  <span className="text-zinc-500">STATUS</span>
                  <p className="mt-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-emerald-400">OPERATIONAL</span>
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500">UPTIME</span>
                  <p className="mt-1 text-blue-400">98 days, 14 hours</p>
                </div>
                <div>
                  <span className="text-zinc-500">OPERATIONAL HUBS</span>
                  <p className="mt-1 text-emerald-400">12/12</p>
                </div>
                <div>
                  <span className="text-zinc-500">ACTIVE SHIPMENTS</span>
                  <p className="mt-1 text-blue-400">347</p>
                </div>
                <div>
                  <span className="text-zinc-500">FLEET VEHICLES</span>
                  <p className="mt-1 text-blue-400">84 / 84</p>
                </div>
                <div className="border-t border-zinc-800 pt-4">
                  <span className="text-zinc-500">LAST SYNC</span>
                  <p className="mt-1 text-amber-400">30 seconds ago</p>
                </div>
                <div>
                  <span className="text-zinc-500">DATABASE</span>
                  <p className="mt-1 text-emerald-400">Connected</p>
                </div>
                <div>
                  <span className="text-zinc-500">API ENDPOINTS</span>
                  <p className="mt-1 text-emerald-400">12/12 Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
