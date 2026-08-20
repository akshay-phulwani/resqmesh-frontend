'Client Side Only'
'use client'

import React, { useState, useEffect } from 'react'
import { Truck, Activity as HospitalIcon, Plus, Minus, Construction, Trash2, ShieldAlert } from 'lucide-react'

interface Resource {
  id: number
  name: string
  type: string
  latitude: number
  longitude: number
  status: string
  availability: boolean
}

interface Hospital {
  id: number
  name: string
  latitude: number
  longitude: number
  emergency_capacity: number
  current_occupancy: number
  specialties: string[]
  availability: boolean
}

interface Blockage {
  id: string
  latitude: number
  longitude: number
  description: string
  radius_meters: number
}

export default function AdminConsole() {
  const [resources, setResources] = useState<Resource[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [blockages, setBlockages] = useState<Blockage[]>([])
  
  // Custom blockage form state
  const [blockId, setBlockId] = useState('')
  const [blockDesc, setBlockDesc] = useState('')
  const [blockLat, setBlockLat] = useState('37.7802')
  const [blockLon, setBlockLon] = useState('-122.4105')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // Fetch initial data
  const fetchData = async () => {
    try {
      const resRes = await fetch(`${apiUrl}/api/resources`)
      const resHosp = await fetch(`${apiUrl}/api/hospitals`)
      const resBlock = await fetch(`${apiUrl}/api/blockages`)

      if (resRes.ok) setResources(await resRes.json())
      if (resHosp.ok) setHospitals(await resHosp.json())
      if (resBlock.ok) setBlockages(await resBlock.json())
    } catch (e) {
      console.error('Error fetching admin data:', e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Toggle resource availability
  const toggleResourceAvailability = async (id: number, currentAvail: boolean) => {
    try {
      const res = await fetch(`${apiUrl}/api/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: !currentAvail })
      })
      if (res.ok) {
        fetchData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Update resource status dropdown
  const updateResourceStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Change hospital bed occupancy
  const adjustOccupancy = async (id: number, currentOccupancy: number, delta: number, capacity: number) => {
    const nextOccupancy = Math.max(0, Math.min(capacity, currentOccupancy + delta))
    try {
      const res = await fetch(`${apiUrl}/api/hospitals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_occupancy: nextOccupancy })
      })
      if (res.ok) {
        fetchData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Add road blockage
  const handleAddBlockage = async (id: string, desc: string, lat: number, lon: number) => {
    if (!id || !desc) return
    try {
      const res = await fetch(`${apiUrl}/api/blockages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          description: desc,
          latitude: lat,
          longitude: lon,
          radius_meters: 150.0
        })
      })
      if (res.ok) {
        setBlockId('')
        setBlockDesc('')
        fetchData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Delete road blockage
  const handleDeleteBlockage = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/blockages/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Preset blockages for quick demo testing
  const addPresetBlockage = (type: 'union_square' | 'civic_center' | 'cpmc') => {
    if (type === 'union_square') {
      handleAddBlockage('BLOCK_UNION_SQ', 'Water Main Break on Stockton St', 37.788, -122.408)
    } else if (type === 'civic_center') {
      handleAddBlockage('BLOCK_CIVIC_CTR', 'Protest closing McAllister St', 37.779, -122.418)
    } else if (type === 'cpmc') {
      handleAddBlockage('BLOCK_CPMC_CORRIDOR', 'Active gas leak repairs on Van Ness Ave', 37.7865, -122.4225)
    }
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-amber-500" />
            Resource Management & Simulator
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Simulate operational delays, toggle resource status, and place road blockages to test real-time AI and scoring re-calculations.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="self-start rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
        >
          Refresh Feeds
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel 1: Ambulance control */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Ambulances */}
          <div className="rounded-xl border border-slate-800 bg-[#0e1626]/80 p-6 backdrop-blur shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-indigo-400" />
              Ambulance Units
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-2">Unit Name</th>
                    <th className="py-3 px-2">Current Coordinates</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-center">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {resources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-2 font-semibold text-white">{res.name}</td>
                      <td className="py-3 px-2 text-xs text-slate-400">
                        {res.latitude.toFixed(4)}, {res.longitude.toFixed(4)}
                      </td>
                      <td className="py-3 px-2">
                        <select
                          value={res.status}
                          onChange={(e) => updateResourceStatus(res.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500"
                        >
                          <option value="Idle">Idle</option>
                          <option value="EnRoute">EnRoute</option>
                          <option value="Busy">Busy</option>
                          <option value="Offline">Offline</option>
                        </select>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => toggleResourceAvailability(res.id, res.availability)}
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            res.availability 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {res.availability ? 'Available' : 'Unavailable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Hospitals */}
          <div className="rounded-xl border border-slate-800 bg-[#0e1626]/80 p-6 backdrop-blur shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HospitalIcon className="h-5 w-5 text-emerald-400" />
              Hospitals & ER Capacity
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-2">Hospital Name</th>
                    <th className="py-3 px-2">Specialties</th>
                    <th className="py-3 px-2 text-center">Occupied Beds / Total</th>
                    <th className="py-3 px-2 text-center">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {hospitals.map((hosp) => (
                    <tr key={hosp.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-2 font-semibold text-white">{hosp.name}</td>
                      <td className="py-3 px-2 text-xs">
                        <div className="flex flex-wrap gap-1">
                          {hosp.specialties.map((spec) => (
                            <span key={spec} className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-400">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-mono">
                        <span className={hosp.current_occupancy >= hosp.emergency_capacity ? 'text-red-400 font-bold' : 'text-slate-200'}>
                          {hosp.current_occupancy}
                        </span>{' '}
                        / {hosp.emergency_capacity}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => adjustOccupancy(hosp.id, hosp.current_occupancy, -1, hosp.emergency_capacity)}
                            className="rounded bg-slate-800 hover:bg-slate-700 p-1 text-slate-400 hover:text-white transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => adjustOccupancy(hosp.id, hosp.current_occupancy, 1, hosp.emergency_capacity)}
                            className="rounded bg-slate-800 hover:bg-slate-700 p-1 text-slate-400 hover:text-white transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Panel 2: Road Blockage controls */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-[#0e1626]/80 p-6 backdrop-blur shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Construction className="h-5 w-5 text-amber-500" />
              Road Blockage Simulator
            </h3>

            {/* Quick Presets */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Simulate Pre-set Blockages</p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => addPresetBlockage('union_square')}
                  className="w-full text-left rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-3 hover:bg-slate-900/80 transition group"
                >
                  <p className="text-xs font-bold text-white group-hover:text-amber-400">Union Square Blockage</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Blocks routes crossing downtown Union Square streets.</p>
                </button>
                <button
                  onClick={() => addPresetBlockage('civic_center')}
                  className="w-full text-left rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-3 hover:bg-slate-900/80 transition group"
                >
                  <p className="text-xs font-bold text-white group-hover:text-amber-400">Civic Center Closure</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Forces dispatch rerouting around City Hall area.</p>
                </button>
                <button
                  onClick={() => addPresetBlockage('cpmc')}
                  className="w-full text-left rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-3 hover:bg-slate-900/80 transition group"
                >
                  <p className="text-xs font-bold text-white group-hover:text-amber-400">CPMC / Van Ness Gas Leak</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Blocks immediate path to CPMC Van Ness hospital.</p>
                </button>
              </div>
            </div>

            {/* Custom blockage form */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add Custom Blockage</p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Blockage ID (e.g. BLOCK_01)"
                  value={blockId}
                  onChange={(e) => setBlockId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Description (e.g. Water main leak)"
                  value={blockDesc}
                  onChange={(e) => setBlockDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Latitude"
                    value={blockLat}
                    onChange={(e) => setBlockLat(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Longitude"
                    value={blockLon}
                    onChange={(e) => setBlockLon(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={() => handleAddBlockage(blockId, blockDesc, parseFloat(blockLat), parseFloat(blockLon))}
                  disabled={!blockId || !blockDesc}
                  className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-500 transition disabled:opacity-50"
                >
                  Create Custom Blockage
                </button>
              </div>
            </div>

            {/* Active blockages list */}
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Road Blockages ({blockages.length})</p>
              {blockages.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No current road blocks registered.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {blockages.map((block) => (
                    <div key={block.id} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-xs">
                      <div>
                        <p className="font-bold text-white">{block.description}</p>
                        <p className="text-[10px] text-slate-500">{block.id} | {block.latitude.toFixed(4)}, {block.longitude.toFixed(4)}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteBlockage(block.id)}
                        className="text-red-500 hover:text-red-400 p-1"
                        title="Clear blockage"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
