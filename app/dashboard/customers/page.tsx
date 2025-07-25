import { db } from '@/lib/database/adapter'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, Mail, MapPin, FileText } from 'lucide-react'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface AuthPayload {
  userId: number
  companyId: number
  email: string
  role: string
}

async function getCustomers(companyId: number) {
  // Get customers with their quote statistics
  const customers = await db.getAll(
    `SELECT 
      c.*,
      COUNT(q.id) as total_quotes,
      SUM(CASE WHEN q.status = 'accepted' THEN 1 ELSE 0 END) as accepted_quotes,
      SUM(CASE WHEN q.status = 'accepted' THEN q.total_amount ELSE 0 END) as total_revenue
    FROM customers c
    LEFT JOIN quotes q ON c.id = q.customer_id
    WHERE c.company_id = ?
    GROUP BY c.id
    ORDER BY c.created_at DESC`,
    [companyId]
  )

  // Get recent quotes for each customer
  const customerIds = customers?.map(c => c.id) || []
  const recentQuotes = customerIds.length > 0 ? await db.getAll(
    `SELECT id, quote_number, status, total_amount, created_at, customer_id
     FROM quotes
     WHERE customer_id IN (${customerIds.map(() => '?').join(',')})
     ORDER BY created_at DESC`,
    customerIds
  ) : []

  // Group quotes by customer
  const quotesByCustomer = recentQuotes?.reduce((acc: any, quote: any) => {
    if (!acc[quote.customer_id]) acc[quote.customer_id] = []
    acc[quote.customer_id].push(quote)
    return acc
  }, {}) || {}

  // Calculate stats for each customer
  return customers?.map((customer) => {
    const quotes = quotesByCustomer[customer.id] || []
    const acceptedQuotes = quotes.filter((q: any) => q.status === 'accepted')
    const totalRevenue = Number(customer.total_revenue) || 0
    
    return {
      ...customer,
      totalQuotes: Number(customer.total_quotes) || 0,
      acceptedQuotes: Number(customer.accepted_quotes) || 0,
      totalRevenue,
      lastQuoteDate: quotes[0]?.created_at || customer.created_at,
    }
  })
}

export default async function CustomersPage() {
  const token = cookies().get('auth-token')?.value
  if (!token) return null
  
  const user = jwt.verify(token, JWT_SECRET) as AuthPayload
  const customers = await getCustomers(user.companyId)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer relationships and quote history
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.reduce((sum, c) => sum + c.totalQuotes, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${customers.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Link 
                      href={`/dashboard/customers/${customer.id}`}
                      className="text-lg font-medium hover:underline"
                    >
                      {customer.name}
                    </Link>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {customer.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {customer.address}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2 justify-end">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{customer.totalQuotes} quotes</span>
                    </div>
                    {customer.totalRevenue > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        ${customer.totalRevenue.toLocaleString()} revenue
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Last quote: {new Date(customer.lastQuoteDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {customer.quotes.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Recent quotes:</div>
                    <div className="flex gap-2 flex-wrap">
                      {customer.quotes.slice(0, 3).map((quote) => (
                        <Link
                          key={quote.id}
                          href={`/dashboard/quotes/${quote.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs hover:bg-muted/80"
                        >
                          {quote.quoteNumber}
                          <span className={`
                            inline-block w-2 h-2 rounded-full
                            ${quote.status === 'accepted' ? 'bg-green-500' : 
                              quote.status === 'sent' ? 'bg-blue-500' : 
                              quote.status === 'rejected' ? 'bg-red-500' : 
                              'bg-gray-400'}
                          `} />
                        </Link>
                      ))}
                      {customer.quotes.length > 3 && (
                        <Link
                          href={`/dashboard/customers/${customer.id}`}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground"
                        >
                          +{customer.quotes.length - 3} more
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}