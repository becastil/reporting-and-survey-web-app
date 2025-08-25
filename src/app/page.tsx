'use client'

import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, FileSpreadsheet, Database, Shield, Zap, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Modern Survey & Reporting Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transform your data collection and analysis workflow with interactive dashboards, 
            real-time insights, and seamless CSV reporting.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/survey">
              <Button size="lg" className="group">
                Launch Survey Module
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/reporting">
              <Button size="lg" variant="outline" className="group">
                Launch Reporting Module
                <BarChart3 className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Survey Module */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Survey Module</CardTitle>
                </div>
                <CardDescription>
                  Dynamic web surveys with intelligent data collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                    <span className="text-sm text-gray-600">
                      Drag-and-drop survey builder with multiple question types
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                    <span className="text-sm text-gray-600">
                      Real-time response aggregation and analytics
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                    <span className="text-sm text-gray-600">
                      Interactive dashboards with 20-40 customizable charts
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                    <span className="text-sm text-gray-600">
                      Advanced filtering, comparison, and drill-down capabilities
                    </span>
                  </li>
                </ul>
                <Link href="/survey" className="block mt-6">
                  <Button className="w-full">
                    Get Started with Surveys
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reporting Module */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Reporting Module</CardTitle>
                </div>
                <CardDescription>
                  Flexible CSV-based reporting with powerful visualizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                    <span className="text-sm text-gray-600">
                      Download and populate CSV templates for easy data import
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                    <span className="text-sm text-gray-600">
                      Automatic validation, normalization, and aggregation
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                    <span className="text-sm text-gray-600">
                      Generate interactive dashboards from uploaded data
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                    <span className="text-sm text-gray-600">
                      Export dashboards and reports to PDF for sharing
                    </span>
                  </li>
                </ul>
                <Link href="/reporting" className="block mt-6">
                  <Button className="w-full" variant="outline">
                    Get Started with Reporting
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-purple-100 rounded-full w-fit mb-2">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Real-time data processing and instant dashboard updates for immediate insights
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-orange-100 rounded-full w-fit mb-2">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Enterprise Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Bank-level encryption, role-based access control, and complete audit trails
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-indigo-100 rounded-full w-fit mb-2">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">Collaboration Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Share dashboards, export reports, and collaborate with your team seamlessly
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Data Workflow?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Start collecting insights and generating reports in minutes, not hours.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" variant="secondary">
                View Demo
                <Database className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Admin Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}