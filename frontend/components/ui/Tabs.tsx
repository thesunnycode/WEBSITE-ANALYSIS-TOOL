"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
  tabs?: {
    label: string
    value: string
    content: React.ReactNode
  }[]
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
  children?: React.ReactNode
}

export function Tabs({ tabs, defaultValue, onChange, className, children }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || tabs?.[0]?.value)

  const handleTabClick = (value: string) => {
    setActiveTab(value)
    onChange?.(value)
  }

  if (children) {
    return <div className={cn('w-full', className)}>{children}</div>
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex space-x-1 rounded-lg bg-muted p-1">
        {tabs?.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              activeTab === tab.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs?.find((tab) => tab.value === activeTab)?.content}
      </div>
    </div>
  )
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div className={cn("flex space-x-1 rounded-lg bg-muted p-1", className)}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  className?: string
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}

export function TabsTrigger({ value, className, children, active, onClick }: TabsTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  className?: string
  children: React.ReactNode
  active?: boolean
}

export function TabsContent({ value, className, children, active }: TabsContentProps) {
  if (!active) return null
  return (
    <div className={cn("mt-4", className)}>
      {children}
    </div>
  )
}

export default Tabs 