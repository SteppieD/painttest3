'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { quoteFormSchema, type QuoteFormData } from '@/lib/validations/quote'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CustomerStep } from '@/components/quote-form/customer-step'
import { ProjectStep } from '@/components/quote-form/project-step'
import { SurfacesStep } from '@/components/quote-form/surfaces-step'
import { PaintStep } from '@/components/quote-form/paint-step'
import { ReviewStep } from '@/components/quote-form/review-step'

const steps = [
  { id: 'customer', title: 'Customer Info', description: 'Who is this quote for?' },
  { id: 'project', title: 'Project Details', description: 'What type of project?' },
  { id: 'surfaces', title: 'Surfaces', description: 'What needs to be painted?' },
  { id: 'paint', title: 'Paint Selection', description: 'Choose paint products' },
  { id: 'review', title: 'Review', description: 'Review and submit' },
]

export default function NewQuotePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      projectType: 'residential',
      surfaces: [],
      paintProducts: {},
      settings: {
        taxRate: 8.25,
        overheadPercent: 15,
        profitMargin: 30,
        laborRate: 45,
      },
    },
  })

  const nextStep = async () => {
    const fields = getFieldsForStep(currentStep)
    const isValid = await form.trigger(fields as (keyof QuoteFormData)[])
    
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create quote')
      }

      const quote = await response.json()
      router.push(`/dashboard/quotes/${quote.id}`)
    } catch (error) {
      console.error('Error creating quote:', error)
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false)
    }
  }

  function getFieldsForStep(step: number): string[] {
    switch (step) {
      case 0: return ['customer']
      case 1: return ['projectType', 'description']
      case 2: return ['surfaces']
      case 3: return ['paintProducts']
      default: return []
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Quote</h1>
        <p className="text-muted-foreground">
          Follow the steps below to create a professional painting quote
        </p>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-muted" />
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <button
                type="button"
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  index <= currentStep
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted bg-background text-muted-foreground'
                }`}
                onClick={() => index < currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
              >
                {index + 1}
              </button>
              <span className="mt-2 text-xs font-medium">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && <CustomerStep form={form} />}
            {currentStep === 1 && <ProjectStep form={form} />}
            {currentStep === 2 && <SurfacesStep form={form} />}
            {currentStep === 3 && <PaintStep form={form} />}
            {currentStep === 4 && <ReviewStep form={form} />}
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Quote...' : 'Create Quote'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}