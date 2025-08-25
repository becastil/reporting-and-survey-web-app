'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const responseData = [
  { date: 'Jan 1', responses: 45 },
  { date: 'Jan 2', responses: 52 },
  { date: 'Jan 3', responses: 48 },
  { date: 'Jan 4', responses: 61 },
  { date: 'Jan 5', responses: 58 },
  { date: 'Jan 6', responses: 73 },
  { date: 'Jan 7', responses: 69 },
]

const satisfactionData = [
  { rating: 'Very Satisfied', value: 35, color: '#10b981' },
  { rating: 'Satisfied', value: 42, color: '#3b82f6' },
  { rating: 'Neutral', value: 15, color: '#f59e0b' },
  { rating: 'Dissatisfied', value: 6, color: '#ef4444' },
  { rating: 'Very Dissatisfied', value: 2, color: '#991b1b' },
]

const completionData = [
  { section: 'Demographics', completed: 95 },
  { section: 'Experience', completed: 87 },
  { section: 'Satisfaction', completed: 82 },
  { section: 'Feedback', completed: 73 },
  { section: 'Additional', completed: 61 },
]

export function SurveyStats() {
  return (
    <div className="space-y-6">
      {/* Response Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Response Trend</CardTitle>
          <CardDescription>Daily responses over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="responses" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Satisfaction Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Satisfaction Distribution</CardTitle>
            <CardDescription>Overall satisfaction ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={satisfactionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {satisfactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Section Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Section Completion Rates</CardTitle>
            <CardDescription>Percentage of users completing each section</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="section" type="category" />
                <Tooltip />
                <Bar dataKey="completed" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8:34</div>
            <p className="text-xs text-gray-600">minutes per response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Drop-off Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13%</div>
            <p className="text-xs text-gray-600">at question 5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              NPS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72</div>
            <p className="text-xs text-green-600">+8 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Response Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-gray-600">complete answers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}