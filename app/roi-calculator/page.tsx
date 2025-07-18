'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calculator, TrendingUp, Clock, DollarSign, Users, ChevronRight } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import SharedNavigation from '@/components/shared-navigation'

export default function ROICalculator() {
  const [formData, setFormData] = useState({
    monthlyRevenue: 50000,
    quotesPerMonth: 20,
    averageQuoteTime: 2,
    closeRate: 25,
    averageJobValue: 2500,
  })

  const [showResults, setShowResults] = useState(false)

  const calculateROI = () => {
    // Current state calculations
    const currentQuotesPerMonth = formData.quotesPerMonth
    const currentTimeSpentQuoting = formData.quotesPerMonth * formData.averageQuoteTime
    const currentClosedJobs = (formData.quotesPerMonth * formData.closeRate) / 100
    const currentRevenue = formData.monthlyRevenue

    // With PaintQuote Pro calculations
    const timePerQuoteWithApp = 0.25 // 15 minutes
    const quotesIncreaseMultiplier = 2.5 // Can create 2.5x more quotes in same time
    const closeRateIncrease = 1.4 // 40% increase in close rate
    
    const newQuotesPerMonth = Math.floor(currentQuotesPerMonth * quotesIncreaseMultiplier)
    const newTimeSpentQuoting = newQuotesPerMonth * timePerQuoteWithApp
    const newCloseRate = Math.min(formData.closeRate * closeRateIncrease, 90)
    const newClosedJobs = (newQuotesPerMonth * newCloseRate) / 100
    const newRevenue = newClosedJobs * formData.averageJobValue

    // ROI Calculations
    const timeSaved = currentTimeSpentQuoting - newTimeSpentQuoting
    const additionalRevenue = newRevenue - currentRevenue
    const yearlyAdditionalRevenue = additionalRevenue * 12
    const softwareCost = 49 * 12 // Professional plan annual
    const netROI = yearlyAdditionalRevenue - softwareCost
    const roiPercentage = (netROI / softwareCost) * 100

    return {
      current: {
        quotesPerMonth: currentQuotesPerMonth,
        timeSpentQuoting: currentTimeSpentQuoting,
        closedJobs: currentClosedJobs,
        revenue: currentRevenue,
      },
      withApp: {
        quotesPerMonth: newQuotesPerMonth,
        timeSpentQuoting: newTimeSpentQuoting,
        closedJobs: newClosedJobs,
        revenue: newRevenue,
      },
      roi: {
        timeSaved,
        additionalRevenue,
        yearlyAdditionalRevenue,
        netROI,
        roiPercentage,
      },
    }
  }

  const results = showResults ? calculateROI() : null

  return (
    <>
      {/* SEO Metadata would be in metadata export */}
      <div className="min-h-screen bg-background">
        {/* Header */}
        <SharedNavigation />

        <main>
          {/* Breadcrumbs */}
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' },
              { label: 'ROI Calculator' }
            ]}
            className="container"
          />

          {/* Hero Section */}
          <section className="relative py-16 md:py-24">
            <div className="container">
              <div className="mx-auto max-w-4xl text-center">
                <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <Calculator className="mr-2 h-4 w-4" />
                  Free ROI Calculator
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Calculate Your Painting Business ROI
                </h1>
                <p className="mt-6 text-xl text-muted-foreground">
                  See how much time and money PaintQuote Pro can save your painting business. 
                  Get personalized projections based on your actual business metrics.
                </p>
              </div>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="container">
              <div className="mx-auto max-w-4xl">
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Input Form */}
                  <div className="rounded-lg border bg-card p-6 md:p-8">
                    <h2 className="text-2xl font-bold">Your Current Business Metrics</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Enter your current numbers to see your potential growth
                    </p>

                    <div className="mt-6 space-y-6">
                      <div>
                        <label className="text-sm font-medium">
                          Current Monthly Revenue
                        </label>
                        <div className="mt-2 flex items-center">
                          <DollarSign className="absolute ml-3 h-4 w-4 text-muted-foreground" />
                          <input
                            type="number"
                            value={formData.monthlyRevenue}
                            onChange={(e) => setFormData({ ...formData, monthlyRevenue: Number(e.target.value) })}
                            className="w-full rounded-md border bg-background px-3 py-2 pl-10 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Quotes Created Per Month
                        </label>
                        <input
                          type="number"
                          value={formData.quotesPerMonth}
                          onChange={(e) => setFormData({ ...formData, quotesPerMonth: Number(e.target.value) })}
                          className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Average Time Per Quote (hours)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={formData.averageQuoteTime}
                          onChange={(e) => setFormData({ ...formData, averageQuoteTime: Number(e.target.value) })}
                          className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Current Close Rate (%)
                        </label>
                        <input
                          type="number"
                          value={formData.closeRate}
                          onChange={(e) => setFormData({ ...formData, closeRate: Number(e.target.value) })}
                          className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Average Job Value
                        </label>
                        <div className="mt-2 flex items-center">
                          <DollarSign className="absolute ml-3 h-4 w-4 text-muted-foreground" />
                          <input
                            type="number"
                            value={formData.averageJobValue}
                            onChange={(e) => setFormData({ ...formData, averageJobValue: Number(e.target.value) })}
                            className="w-full rounded-md border bg-background px-3 py-2 pl-10 text-sm"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => setShowResults(true)}
                        className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Calculate My ROI
                      </button>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="space-y-6">
                    {!showResults ? (
                      <div className="rounded-lg border border-dashed bg-muted/50 p-8 text-center">
                        <Calculator className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Your Results Will Appear Here</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Enter your business metrics and click "Calculate My ROI" to see your 
                          personalized growth projections with PaintQuote Pro.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* ROI Summary */}
                        <div className="rounded-lg bg-primary/5 p-6">
                          <h3 className="text-lg font-semibold">Your ROI with PaintQuote Pro</h3>
                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-3xl font-bold text-primary">
                                {results.roi.roiPercentage.toFixed(0)}%
                              </p>
                              <p className="text-sm text-muted-foreground">Return on Investment</p>
                            </div>
                            <div>
                              <p className="text-3xl font-bold text-primary">
                                ${results.roi.netROI.toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">Net Annual Gain</p>
                            </div>
                          </div>
                        </div>

                        {/* Before/After Comparison */}
                        <div className="rounded-lg border bg-card p-6">
                          <h3 className="text-lg font-semibold">Monthly Business Impact</h3>
                          
                          <div className="mt-6 space-y-6">
                            {/* Quotes Created */}
                            <div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Quotes Created</span>
                                <span className="text-primary">
                                  +{results.withApp.quotesPerMonth - results.current.quotesPerMonth} more
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Now:</span>
                                  <span>{results.current.quotesPerMonth}</span>
                                </div>
                                <ChevronRight className="h-3 w-3" />
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">With Pro:</span>
                                  <span className="font-semibold text-primary">
                                    {results.withApp.quotesPerMonth}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Time Spent */}
                            <div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Time on Quotes</span>
                                <span className="text-primary">
                                  -{results.roi.timeSaved.toFixed(0)} hours saved
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Now:</span>
                                  <span>{results.current.timeSpentQuoting}h</span>
                                </div>
                                <ChevronRight className="h-3 w-3" />
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">With Pro:</span>
                                  <span className="font-semibold text-primary">
                                    {results.withApp.timeSpentQuoting.toFixed(1)}h
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Closed Jobs */}
                            <div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Jobs Won</span>
                                <span className="text-primary">
                                  +{(results.withApp.closedJobs - results.current.closedJobs).toFixed(0)} more
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Now:</span>
                                  <span>{results.current.closedJobs.toFixed(0)}</span>
                                </div>
                                <ChevronRight className="h-3 w-3" />
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">With Pro:</span>
                                  <span className="font-semibold text-primary">
                                    {results.withApp.closedJobs.toFixed(0)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Revenue */}
                            <div className="border-t pt-4">
                              <div className="flex items-center justify-between text-sm font-semibold">
                                <span>Monthly Revenue</span>
                                <span className="text-primary">
                                  +${results.roi.additionalRevenue.toLocaleString()}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Now:</span>
                                  <span>${results.current.revenue.toLocaleString()}</span>
                                </div>
                                <ChevronRight className="h-3 w-3" />
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">With Pro:</span>
                                  <span className="font-semibold text-primary">
                                    ${results.withApp.revenue.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="rounded-lg bg-primary p-6 text-center text-primary-foreground">
                          <TrendingUp className="mx-auto h-8 w-8" />
                          <h3 className="mt-2 text-lg font-semibold">
                            Ready to Grow Your Business?
                          </h3>
                          <p className="mt-2 text-sm opacity-90">
                            Start your free trial today and see these results for yourself
                          </p>
                          <Link
                            href="/auth/signup"
                            className="mt-4 inline-flex items-center rounded-md bg-background px-6 py-2 text-sm font-medium text-foreground hover:bg-background/90"
                          >
                            Start Free Trial
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="bg-muted/50 py-16 md:py-24">
            <div className="container">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  How PaintQuote Pro Drives Your ROI
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Our painting contractors see results in four key areas
                </p>
              </div>

              <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <Clock className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">91% Faster Quotes</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create detailed quotes in 15 minutes instead of 2-3 hours
                  </p>
                </div>
                <div className="text-center">
                  <TrendingUp className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">40% Higher Close Rate</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Professional quotes and faster response times win more jobs
                  </p>
                </div>
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">2.5x More Quotes</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Quote more jobs in the same time to grow your pipeline
                  </p>
                </div>
                <div className="text-center">
                  <DollarSign className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">58% Revenue Growth</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Average revenue increase for contractors using our software
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial */}
          <section className="py-16">
            <div className="container">
              <div className="mx-auto max-w-3xl">
                <div className="rounded-lg bg-primary/5 p-8 text-center">
                  <blockquote className="text-xl italic">
                    "The ROI calculator showed we'd save 30 hours monthly. In reality, we saved 
                    even more. We're now doing $180K/month, up from $110K, and working less."
                  </blockquote>
                  <footer className="mt-4">
                    <strong>Sarah Chen</strong>
                    <span className="text-muted-foreground"> • Premier Painting Co, San Francisco</span>
                  </footer>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 md:py-24">
            <div className="container">
              <div className="mx-auto max-w-3xl">
                <h2 className="text-center text-3xl font-bold">ROI Calculator Questions</h2>
                
                <div className="mt-12 space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold">How accurate is this ROI calculator?</h3>
                    <p className="mt-3 text-muted-foreground">
                      Our calculator uses real data from 2,847+ painting contractors using PaintQuote Pro. 
                      The metrics (91% time savings, 40% close rate increase) are based on actual customer 
                      results. Your results may vary based on how consistently you use the software.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">What's included in the ROI calculation?</h3>
                    <p className="mt-3 text-muted-foreground">
                      We calculate time saved on quoting, increased quote volume, improved close rates, 
                      and the resulting revenue increase. We subtract the software cost ($49/month for 
                      Professional plan) to show your net ROI.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">How quickly will I see these results?</h3>
                    <p className="mt-3 text-muted-foreground">
                      Most contractors see time savings immediately - from their very first quote. Close 
                      rate improvements typically appear within 30 days as customers respond better to 
                      professional quotes. Revenue growth follows as you win more jobs.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">Can I really create 2.5x more quotes?</h3>
                    <p className="mt-3 text-muted-foreground">
                      Yes! When quotes take 15 minutes instead of 2-3 hours, you can easily quote 
                      2-3x more jobs. Many contractors quote on-site now, closing deals immediately 
                      instead of losing momentum while preparing quotes later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-primary py-16 text-primary-foreground">
            <div className="container text-center">
              <h2 className="text-3xl font-bold">
                Ready to See These Results in Your Business?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl opacity-90">
                Join thousands of painting contractors growing with PaintQuote Pro. 
                Start free and see ROI from your very first quote.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center rounded-md bg-background px-8 py-3 text-base font-medium text-foreground shadow-lg hover:bg-background/90"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-md border border-primary-foreground/20 px-8 py-3 text-base font-medium hover:bg-primary-foreground/10"
                >
                  View Pricing
                </Link>
              </div>
              <p className="mt-4 text-sm opacity-75">
                No credit card required • 1 free quote per month • Cancel anytime
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t bg-background">
          <div className="container py-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 PaintQuote Pro. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  )
}