'Client Side Only'
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bell, MapPin, Mic, Send, AlertTriangle, ShieldCheck, Truck } from 'lucide-react'

// Coordinates center for Jaipur, Rajasthan, India
const DEFAULT_LAT = 26.9124
const DEFAULT_LON = 75.7873

export default function CitizenReporting() {
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState<number>(DEFAULT_LAT)
  const [longitude, setLongitude] = useState<number>(DEFAULT_LON)
  const [isLocating, setIsLocating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'Default' | 'Acquired' | 'Error'>('Default')
  
  // Incident status tracking state
  const [activeIncidentId, setActiveIncidentId] = useState<number | null>(null)
  const [incidentStatus, setIncidentStatus] = useState<'None' | 'Reported' | 'Dispatched' | 'Resolved'>('None')
  const [dispatchedAmbulance, setDispatchedAmbulance] = useState<string | null>(null)
  const [destinationHospital, setDestinationHospital] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)

  // Setup WebSocket connection to track status
  useEffect(() => {
    // Determine WS url
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
    const socket = new WebSocket(`${wsUrl}/ws`)
    wsRef.current = socket

    socket.onopen = () => {
      console.log('Citizen WS connection open.')
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Listen for dispatch message corresponding to our active incident
        if (data.type === 'INCIDENT_DISPATCHED' && data.incident_id === activeIncidentId) {
          setIncidentStatus('Dispatched')
          setDispatchedAmbulance(data.resource_name)
          setDestinationHospital(data.hospital_name)
        }
      } catch (e) {
        console.error('Error parsing WS message in citizen view:', e)
      }
    }

    socket.onclose = () => {
      console.log('Citizen WS closed. Reconnecting...')
    }

    return () => {
      socket.close()
    }
  }, [activeIncidentId])

  // Get current location
  const detectLocation = () => {
    setIsLocating(true)
    if (!navigator.geolocation) {
      setLocationStatus('Error')
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setLocationStatus('Acquired')
        setIsLocating(false)
      },
      (error) => {
        console.warn('Geolocation failed. Using San Francisco coordinate sandbox:', error)
        // Add tiny jitter to default SF coordinate so it looks unique
        setLatitude(DEFAULT_LAT + (Math.random() - 0.5) * 0.01)
        setLongitude(DEFAULT_LON + (Math.random() - 0.5) * 0.01)
        setLocationStatus('Default')
        setIsLocating(false)
      },
      { timeout: 5000 }
    )
  }

  // Auto-detect location on load
  useEffect(() => {
    detectLocation()
  }, [])

  // Simulate Voice input recording
  const simulateVoiceRecording = () => {
    setIsRecording(true)
    setDescription('Recording voice...')
    
    setTimeout(() => {
      const voiceTranscripts = [
        "A car crashed into a light pole near Union Square! The driver is bleeding heavily and unconscious. There is smoke coming out of the engine!",
        "I think my elderly neighbor is having a heart attack. He is complaining of extreme chest pain and he passed out on the living room floor.",
        "There is a huge gas leak in our basement! I smell gas and we are feeling dizzy, we have evacuated to the street.",
        "A person just got shot in the leg during a robbery! They are bleeding a lot and need an ambulance immediately.",
        "My daughter is having a severe seizure and shaking uncontrollably. She has been convulsing for about 3 minutes now."
      ]
      
      const randomTranscript = voiceTranscripts[Math.floor(Math.random() * voiceTranscripts.length)]
      setDescription(randomTranscript)
      setIsRecording(false)
    }, 2000)
  }

  // Submit Incident report
  const submitIncident = async (reportText: string) => {
    if (!reportText.trim() || isSubmitting) return
    setIsSubmitting(true)

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')
    try {
      const res = await fetch(`${apiUrl}/api/incidents/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: reportText,
          latitude: latitude,
          longitude: longitude,
          user_id: 3 // Default John Doe citizen
        })
      })

      if (res.ok) {
        const data = await res.json()
        setActiveIncidentId(data.incident.id)
        setIncidentStatus('Reported')
        setDescription('')
      } else {
        alert('Failed to report emergency. Please try again.')
      }
    } catch (e) {
      console.error('Error submitting report:', e)
      alert('Connection error. Is backend running?')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Big SOS Button trigger
  const triggerSOS = () => {
    detectLocation()
    const sosMessage = "IMMEDIATE SOS BUTTON ACTIVATED. Citizen triggered urgent emergency alarm at current coordinates. Requesting immediate dispatch of medical and police assistance."
    submitIncident(sosMessage)
  }

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-8 flex-1 flex flex-col justify-center">
      {incidentStatus === 'None' ? (
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6 siren-ping" />
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Citizen Emergency Reporting</h2>
            <p className="mt-2 text-sm text-slate-400">
              Direct link to emergency response dispatch. Enter text description, record voice, or hit the SOS button.
            </p>
          </div>

          {/* SOS Pulsing Button */}
          <div className="flex justify-center py-4">
            <button
              onClick={triggerSOS}
              disabled={isSubmitting}
              className="relative flex h-36 w-36 items-center justify-center rounded-full bg-red-600 font-extrabold uppercase tracking-wide text-white shadow-2xl transition-all duration-300 hover:bg-red-500 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {/* Outer pulsing ring */}
              <span className="absolute inset-0 rounded-full bg-red-600 opacity-70 siren-ping -z-10" />
              <div className="text-center">
                <Bell className="h-8 w-8 mx-auto mb-1 animate-bounce" />
                <span className="text-2xl font-black">SOS</span>
              </div>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0b0f19] px-2 text-slate-500 font-medium">Or File A Detailed Report</span>
            </div>
          </div>

          {/* Detailed Input Form */}
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/50 p-6 backdrop-blur space-y-4 shadow-xl">
            {/* Description input */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-300">
                What is happening? Describe the situation
              </label>
              <div className="mt-2 relative">
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. A collision just occurred at 4th and Mission St. Two cars involved. One person seems injured and cannot get out."
                  className="block w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm placeholder-slate-500 outline-none"
                />
                
                {/* Voice button */}
                <button
                  type="button"
                  onClick={simulateVoiceRecording}
                  disabled={isRecording}
                  className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition disabled:opacity-50"
                  title="Simulate Voice Report"
                >
                  <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
                </button>
              </div>
            </div>

            {/* Location section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className={`h-5 w-5 ${locationStatus === 'Acquired' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Report Location</p>
                  <p className="text-xs text-slate-300">
                    {latitude.toFixed(5)}, {longitude.toFixed(5)} ({locationStatus === 'Acquired' ? 'GPS Acquired' : 'SF Sandbox Location'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={detectLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                {isLocating ? 'Locating...' : 'Refresh Location'}
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => submitIncident(description)}
              disabled={isSubmitting || !description.trim() || description === 'Recording voice...'}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Sending Alert...' : 'Submit Emergency Report'}
            </button>
          </div>
        </div>
      ) : (
        /* Tracker view */
        <div className="rounded-2xl border border-slate-800 bg-[#0e1626]/80 p-8 shadow-2xl space-y-8 backdrop-blur text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="h-8 w-8 animate-bounce" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Emergency Report Received</h2>
            <p className="text-sm text-slate-400 mt-1">Incident Reference ID: #{activeIncidentId}</p>
            <p className="text-xs text-slate-500 mt-1">Command center operators have been notified.</p>
          </div>

          {/* Stepper tracker */}
          <div className="max-w-md mx-auto relative pl-6 space-y-8 text-left border-l-2 border-slate-800">
            
            {/* Step 1: Received */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-[#0b0f19]">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <h3 className="text-sm font-bold text-white">Report Registered</h3>
              <p className="text-xs text-slate-400">Emergency report successfully stored and processed by AI engine.</p>
            </div>

            {/* Step 2: Dispatch Status */}
            <div className="relative">
              <span className={`absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-[#0b0f19] ${
                incidentStatus === 'Dispatched' ? 'bg-emerald-500' : 'bg-slate-700'
              }`}>
                {incidentStatus === 'Dispatched' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <h3 className="text-sm font-bold text-white">
                {incidentStatus === 'Dispatched' ? 'Emergency Dispatch Approved' : 'Command Center Review'}
              </h3>
              <p className="text-xs text-slate-400">
                {incidentStatus === 'Dispatched' 
                  ? 'Response unit is on the way to your coordinates.' 
                  : 'AI recommendation calculated. Awaiting operator validation.'}
              </p>
            </div>

            {/* Step 3: Transit */}
            {incidentStatus === 'Dispatched' && (
              <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a] space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <Truck className="h-5 w-5 animate-pulse" />
                  Active Dispatch Details:
                </div>
                <div className="text-xs space-y-1.5 text-slate-300">
                  <p className="flex justify-between">
                    <span className="text-slate-500">Ambulance dispatched:</span>
                    <span className="font-semibold text-white">{dispatchedAmbulance}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Destination Hospital:</span>
                    <span className="font-semibold text-white">{destinationHospital}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Dispatch Status:</span>
                    <span className="font-bold text-emerald-400">En Route</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                setActiveIncidentId(null)
                setIncidentStatus('None')
                setDispatchedAmbulance(null)
                setDestinationHospital(null)
              }}
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              Report Another Emergency
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
