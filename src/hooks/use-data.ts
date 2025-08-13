"use client"

import { useState, useEffect } from 'react'
import { Contract, Opportunity, Vendor, ContactLog } from '@/types'

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vendors')
      if (!response.ok) throw new Error('Failed to fetch vendors')
      const data = await response.json()
      setVendors(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  return { vendors, loading, error, refetch: fetchVendors }
}

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contracts')
      if (!response.ok) throw new Error('Failed to fetch contracts')
      const data = await response.json()
      setContracts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  return { contracts, loading, error, refetch: fetchContracts }
}

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/opportunities')
      if (!response.ok) throw new Error('Failed to fetch opportunities')
      const data = await response.json()
      setOpportunities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOpportunities()
  }, [])

  return { opportunities, loading, error, refetch: fetchOpportunities }
}

export function useContactLogs() {
  const [contactLogs, setContactLogs] = useState<ContactLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContactLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contact-logs')
      if (!response.ok) throw new Error('Failed to fetch contact logs')
      const data = await response.json()
      setContactLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContactLogs()
  }, [])

  return { contactLogs, loading, error, refetch: fetchContactLogs }
}