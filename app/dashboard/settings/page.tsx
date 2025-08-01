'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Trash2, Palette, Upload, Building2, Phone, Mail, Globe } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ChargeRates {
  // Interior
  walls: number
  ceilings: number
  baseboards: number
  crownMolding: number
  doors: number
  windows: number
  // Exterior
  exteriorWalls: number
  fascia: number
  soffits: number
  exteriorDoors: number
  exteriorWindows: number
}

interface PaintProduct {
  id: string
  name: string
  manufacturer: string
  type: 'wall' | 'ceiling' | 'trim' | 'primer' | 'specialty'
  costPerGallon: number
  retailPrice: number
  coveragePerGallon: number
  isPreferred: boolean
}

interface LaborSettings {
  hourlyRate: number
  overheadMultiplier: number
  productivityRates: {
    walls: number // sq ft per hour
    ceilings: number
    baseboards: number // linear ft per hour
    doors: number // units per hour
    windows: number
  }
}

interface CompanySettings {
  // Company info
  companyName: string
  email: string
  phone: string
  address: string
  logoUrl: string
  website: string
  license: string
  
  // Financial settings
  taxRate: number
  taxLabel: string
  taxOnMaterialsOnly: boolean
  overheadPercent: number
  profitMargin: number
  
  // Default rates and settings
  defaultPaintCoverage: number
  defaultLaborPercentage: number
  defaultSundriesPercentage: number
  
  // Detailed rates
  chargeRates: ChargeRates
  laborSettings: LaborSettings
  paintProducts: PaintProduct[]
}

const defaultSettings: CompanySettings = {
  // Company info
  companyName: 'Demo Painting Company',
  email: 'demo@paintingcompany.com',
  phone: '(555) 123-4567',
  address: '',
  logoUrl: '',
  website: '',
  license: '',
  
  // Financial settings
  taxRate: 8.25,
  taxLabel: 'Sales Tax',
  taxOnMaterialsOnly: false,
  overheadPercent: 15,
  profitMargin: 30,
  
  // Default rates and settings
  defaultPaintCoverage: 350,
  defaultLaborPercentage: 30,
  defaultSundriesPercentage: 12,
  chargeRates: {
    // Interior (per sq ft unless noted)
    walls: 3.50,
    ceilings: 4.00,
    baseboards: 2.50, // per linear foot
    crownMolding: 5.00, // per linear foot
    doors: 125.00, // per unit
    windows: 75.00, // per unit
    // Exterior
    exteriorWalls: 4.50, // per sq ft
    fascia: 6.00, // per linear foot
    soffits: 5.00, // per sq ft
    exteriorDoors: 150.00, // per unit
    exteriorWindows: 100.00, // per unit
  },
  laborSettings: {
    hourlyRate: 45,
    overheadMultiplier: 1.35, // covers workers comp, insurance, etc
    productivityRates: {
      walls: 150, // sq ft per hour
      ceilings: 100,
      baseboards: 60, // linear ft per hour
      doors: 2, // doors per hour
      windows: 3, // windows per hour
    }
  },
  paintProducts: [
    {
      id: '1',
      name: 'Regal Select Interior',
      manufacturer: 'Benjamin Moore',
      type: 'wall',
      costPerGallon: 42.99,
      retailPrice: 65.99,
      coveragePerGallon: 350,
      isPreferred: true
    },
    {
      id: '2',
      name: 'Ultra Spec Ceiling',
      manufacturer: 'Benjamin Moore',
      type: 'ceiling',
      costPerGallon: 28.99,
      retailPrice: 44.99,
      coveragePerGallon: 400,
      isPreferred: true
    },
    {
      id: '3',
      name: 'Advance Interior Paint',
      manufacturer: 'Benjamin Moore',
      type: 'trim',
      costPerGallon: 54.99,
      retailPrice: 79.99,
      coveragePerGallon: 350,
      isPreferred: true
    }
  ]
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [newPaint, setNewPaint] = useState<Partial<PaintProduct>>({
    type: 'wall',
    coveragePerGallon: 350
  })

  useEffect(() => {
    // Load settings from API
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateChargeRate = (key: keyof ChargeRates, value: string) => {
    const numValue = parseFloat(value) || 0
    setSettings(prev => ({
      ...prev,
      chargeRates: {
        ...prev.chargeRates,
        [key]: numValue
      }
    }))
  }

  const updateLaborSettings = (field: string, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setSettings(prev => ({
        ...prev,
        laborSettings: {
          ...prev.laborSettings,
          [parent]: {
            ...prev.laborSettings[parent as keyof typeof prev.laborSettings],
            [child]: numValue
          }
        }
      }))
    } else {
      setSettings(prev => ({
        ...prev,
        laborSettings: {
          ...prev.laborSettings,
          [field]: numValue
        }
      }))
    }
  }

  const addPaintProduct = () => {
    if (!newPaint.name || !newPaint.manufacturer || !newPaint.costPerGallon) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields for the paint product.',
        variant: 'destructive',
      })
      return
    }

    const product: PaintProduct = {
      id: Date.now().toString(),
      name: newPaint.name,
      manufacturer: newPaint.manufacturer,
      type: newPaint.type || 'wall',
      costPerGallon: newPaint.costPerGallon,
      retailPrice: newPaint.retailPrice || newPaint.costPerGallon * 1.5,
      coveragePerGallon: newPaint.coveragePerGallon || 350,
      isPreferred: false
    }

    setSettings(prev => ({
      ...prev,
      paintProducts: [...prev.paintProducts, product]
    }))

    setNewPaint({ type: 'wall', coveragePerGallon: 350 })
  }

  const removePaintProduct = (id: string) => {
    setSettings(prev => ({
      ...prev,
      paintProducts: prev.paintProducts.filter(p => p.id !== id)
    }))
  }

  const togglePreferredPaint = (id: string) => {
    setSettings(prev => ({
      ...prev,
      paintProducts: prev.paintProducts.map(p => 
        p.id === id ? { ...p, isPreferred: !p.isPreferred } : p
      )
    }))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your company settings, rates, and paint products
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="labor">Labor</TabsTrigger>
          <TabsTrigger value="interior">Interior</TabsTrigger>
          <TabsTrigger value="exterior">Exterior</TabsTrigger>
          <TabsTrigger value="paints">Paints</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Your company information and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div>
                <Label>Company Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Company logo" className="h-20 w-20 rounded-lg object-cover" />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              {/* Company Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="license">License Number</Label>
                  <Input
                    id="license"
                    placeholder="e.g., CA-123456"
                    value={settings.license}
                    onChange={(e) => setSettings({ ...settings, license: e.target.value })}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-medium mb-3">Contact Information</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-10"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        type="url"
                        className="pl-10"
                        placeholder="https://www.example.com"
                        value={settings.website}
                        onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Business Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St, City, State 12345"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>Configure tax calculations for quotes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="taxLabel">Tax Label</Label>
                  <Input
                    id="taxLabel"
                    placeholder="e.g., Sales Tax, GST, VAT"
                    value={settings.taxLabel}
                    onChange={(e) => setSettings({ ...settings, taxLabel: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="taxOnMaterials"
                  checked={settings.taxOnMaterialsOnly}
                  onCheckedChange={(checked) => setSettings({ ...settings, taxOnMaterialsOnly: checked })}
                />
                <Label htmlFor="taxOnMaterials">Apply tax to materials only (not labor)</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profit & Overhead</CardTitle>
              <CardDescription>Default margins and markups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="overhead">Overhead (%)</Label>
                  <Input
                    id="overhead"
                    type="number"
                    step="0.01"
                    value={settings.overheadPercent}
                    onChange={(e) => setSettings({ ...settings, overheadPercent: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Covers business operating expenses</p>
                </div>
                <div>
                  <Label htmlFor="profit">Profit Margin (%)</Label>
                  <Input
                    id="profit"
                    type="number"
                    step="0.01"
                    value={settings.profitMargin}
                    onChange={(e) => setSettings({ ...settings, profitMargin: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your target profit on each job</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Calculation Settings</CardTitle>
              <CardDescription>Standard values used in quotes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="paintCoverage">Paint Coverage (sq ft/gallon)</Label>
                  <Input
                    id="paintCoverage"
                    type="number"
                    value={settings.defaultPaintCoverage}
                    onChange={(e) => setSettings({ ...settings, defaultPaintCoverage: parseInt(e.target.value) || 350 })}
                  />
                </div>
                <div>
                  <Label htmlFor="laborPercentage">Labor % of Total</Label>
                  <Input
                    id="laborPercentage"
                    type="number"
                    value={settings.defaultLaborPercentage}
                    onChange={(e) => setSettings({ ...settings, defaultLaborPercentage: parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div>
                  <Label htmlFor="sundriesPercentage">Sundries/Supplies %</Label>
                  <Input
                    id="sundriesPercentage"
                    type="number"
                    value={settings.defaultSundriesPercentage}
                    onChange={(e) => setSettings({ ...settings, defaultSundriesPercentage: parseInt(e.target.value) || 12 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Labor Rates & Productivity</CardTitle>
              <CardDescription>Configure your labor costs and productivity standards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="hourlyRate">Base Hourly Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="hourlyRate"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={settings.laborSettings.hourlyRate}
                      onChange={(e) => updateLaborSettings('hourlyRate', e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">What you pay your painters per hour</p>
                </div>
                <div>
                  <Label htmlFor="overheadMultiplier">Overhead Multiplier</Label>
                  <Input
                    id="overheadMultiplier"
                    type="number"
                    step="0.01"
                    value={settings.laborSettings.overheadMultiplier}
                    onChange={(e) => updateLaborSettings('overheadMultiplier', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Covers insurance, workers comp, etc (typically 1.3-1.5)</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Productivity Rates</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="wallProductivity">Walls (sq ft/hour)</Label>
                    <Input
                      id="wallProductivity"
                      type="number"
                      value={settings.laborSettings.productivityRates.walls}
                      onChange={(e) => updateLaborSettings('productivityRates.walls', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ceilingProductivity">Ceilings (sq ft/hour)</Label>
                    <Input
                      id="ceilingProductivity"
                      type="number"
                      value={settings.laborSettings.productivityRates.ceilings}
                      onChange={(e) => updateLaborSettings('productivityRates.ceilings', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="baseboardProductivity">Baseboards (linear ft/hour)</Label>
                    <Input
                      id="baseboardProductivity"
                      type="number"
                      value={settings.laborSettings.productivityRates.baseboards}
                      onChange={(e) => updateLaborSettings('productivityRates.baseboards', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="doorProductivity">Doors (units/hour)</Label>
                    <Input
                      id="doorProductivity"
                      type="number"
                      step="0.1"
                      value={settings.laborSettings.productivityRates.doors}
                      onChange={(e) => updateLaborSettings('productivityRates.doors', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="windowProductivity">Windows (units/hour)</Label>
                    <Input
                      id="windowProductivity"
                      type="number"
                      step="0.1"
                      value={settings.laborSettings.productivityRates.windows}
                      onChange={(e) => updateLaborSettings('productivityRates.windows', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interior Charge Rates</CardTitle>
              <CardDescription>
                Set your charge rates for interior surfaces. These are your total charges to customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="walls">Walls (per sq ft)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="walls"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={settings.chargeRates.walls}
                      onChange={(e) => updateChargeRate('walls', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="ceilings">Ceilings (per sq ft)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="ceilings"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={settings.chargeRates.ceilings}
                      onChange={(e) => updateChargeRate('ceilings', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="baseboards">Baseboards (per linear ft)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="baseboards"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={settings.chargeRates.baseboards}
                      onChange={(e) => updateChargeRate('baseboards', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="crownMolding">Crown Molding (per linear ft)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="crownMolding"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={settings.chargeRates.crownMolding}
                      onChange={(e) => updateChargeRate('crownMolding', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="doors">Doors & Door Jams (per unit)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="doors"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={settings.chargeRates.doors}
                      onChange={(e) => updateChargeRate('doors', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="windows">Windows (per unit)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="windows"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={settings.chargeRates.windows}
                      onChange={(e) => updateChargeRate('windows', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exterior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exterior Charge Rates</CardTitle>
              <CardDescription>
                Set your charge rates for exterior surfaces. These are your total charges to customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="exteriorWalls">Exterior Walls (per sq ft)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="exteriorWalls"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={settings.chargeRates.exteriorWalls}
                      onChange={(e) => updateChargeRate('exteriorWalls', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="fascia">Fascia Boards (per linear ft)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="fascia"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={settings.chargeRates.fascia}
                      onChange={(e) => updateChargeRate('fascia', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="soffits">Soffits (per sq ft)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="soffits"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={settings.chargeRates.soffits}
                      onChange={(e) => updateChargeRate('soffits', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="exteriorDoors">Exterior Doors (per unit)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="exteriorDoors"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={settings.chargeRates.exteriorDoors}
                      onChange={(e) => updateChargeRate('exteriorDoors', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="exteriorWindows">Exterior Windows (per unit)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="exteriorWindows"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={settings.chargeRates.exteriorWindows}
                      onChange={(e) => updateChargeRate('exteriorWindows', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paint Products Library</CardTitle>
              <CardDescription>
                Manage your commonly used paint products and their costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new paint form */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Add New Paint Product
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="paintName">Product Name</Label>
                    <Input
                      id="paintName"
                      placeholder="e.g., Regal Select Interior"
                      value={newPaint.name || ''}
                      onChange={(e) => setNewPaint({ ...newPaint, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      placeholder="e.g., Benjamin Moore"
                      value={newPaint.manufacturer || ''}
                      onChange={(e) => setNewPaint({ ...newPaint, manufacturer: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paintType">Type</Label>
                    <Select
                      value={newPaint.type}
                      onValueChange={(value) => setNewPaint({ ...newPaint, type: value as PaintProduct['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wall">Wall Paint</SelectItem>
                        <SelectItem value="ceiling">Ceiling Paint</SelectItem>
                        <SelectItem value="trim">Trim Paint</SelectItem>
                        <SelectItem value="primer">Primer</SelectItem>
                        <SelectItem value="specialty">Specialty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="coverage">Coverage (sq ft/gallon)</Label>
                    <Input
                      id="coverage"
                      type="number"
                      value={newPaint.coveragePerGallon || 350}
                      onChange={(e) => setNewPaint({ ...newPaint, coveragePerGallon: parseFloat(e.target.value) || 350 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="costPerGallon">Your Cost per Gallon</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                      <Input
                        id="costPerGallon"
                        type="number"
                        step="0.01"
                        className="pl-8"
                        placeholder="0.00"
                        value={newPaint.costPerGallon || ''}
                        onChange={(e) => setNewPaint({ ...newPaint, costPerGallon: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="retailPrice">Retail Price per Gallon</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                      <Input
                        id="retailPrice"
                        type="number"
                        step="0.01"
                        className="pl-8"
                        placeholder="0.00"
                        value={newPaint.retailPrice || ''}
                        onChange={(e) => setNewPaint({ ...newPaint, retailPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={addPaintProduct} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Paint Product
                </Button>
              </div>

              {/* Paint products list */}
              <div className="space-y-2">
                <h4 className="font-medium">Your Paint Products</h4>
                {settings.paintProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No paint products added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {settings.paintProducts.map((paint) => (
                      <div key={paint.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{paint.name}</span>
                            {paint.isPreferred && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Preferred</span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {paint.manufacturer} • {paint.type} • ${paint.costPerGallon}/gal • {paint.coveragePerGallon} sq ft/gal
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePreferredPaint(paint.id)}
                          >
                            {paint.isPreferred ? 'Unmark' : 'Mark'} Preferred
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePaintProduct(paint.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={isLoading} size="lg">
          {isLoading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  )
}