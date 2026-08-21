'Client Side Only'
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { AlertCircle, MapPin, Activity, Check, X, ShieldAlert, Award, ChevronRight, BookOpen, Layers } from 'lucide-react'
interface Incident {
  id: number
  incident_type: string
  severity: string
  description: string
  latitude: number
  longitude: number
  status: string
  created_at: string
}

interface TrustScoreBreakdown {
  distance_score: number
  time_score: number
  capacity_score: number
  specialty_score: number
  route_condition_score: number
  total_score: number
  duration_sec?: number
}

interface Recommendation {
  id: number
  incident_id: number
  resource_id: number
  resource_name: string
  resource_type: string
  hospital_id: number
  hospital_name: string
  route_id: string
  trust_score: number
  score_breakdown: TrustScoreBreakdown
  explanation: string
  approval_status: string
  ambulance_coords: [number, number]
  hospital_coords: [number, number]
  route_geometry: [number, number][]
}

interface TacticalMapProps {
  incidents: Incident[]
  selectedIncident: Incident | null
  selectedRec: Recommendation | null
  hospitals: any[]
  resources: any[]
  blockages: any[]
}

const TacticalMap: React.FC<TacticalMapProps> = ({
  incidents,
  selectedIncident,
  selectedRec,
  hospitals,
  resources,
  blockages
}) => {
  const minLat = 26.83;
  const maxLat = 26.95;
  const minLon = 75.71;
  const maxLon = 75.87;

  const getXY = (lat: number, lon: number) => {
    const x = ((lon - minLon) / (maxLon - minLon)) * 800;
    const y = 600 - ((lat - minLat) / (maxLat - minLat)) * 600;
    return { x, y };
  };

  const getSvgPath = (coords: [number, number][]) => {
    if (!coords || coords.length === 0) return "";
    return coords.map((c, i) => {
      const { x, y } = getXY(c[0], c[1]);
      if (isNaN(x) || isNaN(y)) return "";
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(" ");
  };

  return (
    <div className="w-full h-full relative bg-[#05080f] overflow-hidden flex flex-col justify-between border border-slate-800/80 rounded-xl shadow-inner">
       <svg viewBox="0 0 800 600" className="w-full h-full text-slate-700 select-none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f1624" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <line x1="100" y1="500" x2="700" y2="100" stroke="#122540" strokeWidth="6" strokeLinecap="round" />
          <text x="350" y="320" fill="#1b3a60" className="text-[10px] font-bold uppercase tracking-wider transform -rotate-30">Tonk Road</text>

          <line x1="450" y1="0" x2="450" y2="600" stroke="#122540" strokeWidth="4" />
          <text x="460" y="50" fill="#1b3a60" className="text-[10px] font-bold uppercase tracking-wider">JLN Marg</text>

          <line x1="0" y1="250" x2="800" y2="250" stroke="#122540" strokeWidth="4" />
          <text x="50" y="240" fill="#1b3a60" className="text-[10px] font-bold uppercase tracking-wider">Ajmer Road</text>

          <line x1="80" y1="530" x2="680" y2="130" stroke="#0f1f35" strokeWidth="4" />
          <text x="330" y="360" fill="#142c4b" className="text-[10px] font-bold uppercase tracking-wider transform -rotate-30">MI Road</text>

          {selectedRec && selectedRec.route_geometry && (
             <>
               <path 
                 d={getSvgPath(selectedRec.route_geometry)} 
                 fill="none" 
                 stroke="#818cf8" 
                 strokeWidth="6" 
                 strokeOpacity="0.3"
                 strokeLinecap="round"
                 strokeLinejoin="round"
               />
               <path 
                 d={getSvgPath(selectedRec.route_geometry)} 
                 fill="none" 
                 stroke="#4f46e5" 
                 strokeWidth="3.5" 
                 strokeDasharray="8,6"
                 strokeLinecap="round"
                 strokeLinejoin="round"
               >
                 <animate attributeName="stroke-dashoffset" values="100;0" dur="8s" repeatCount="indefinite" />
               </path>
             </>
          )}

          {blockages.map((b, i) => {
            const { x, y } = getXY(b.latitude, b.longitude);
            return (
              <g key={`block-${i}`}>
                <circle cx={x} cy={y} r="25" fill="#f59e0b" fillOpacity="0.08" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
                <circle cx={x} cy={y} r="8" fill="#f59e0b" />
                <text x={x} y={y + 3} textAnchor="middle" fill="#0f172a" className="text-[9px] font-black">🚧</text>
                <text x={x} y={y - 14} textAnchor="middle" fill="#f59e0b" className="text-[8px] font-bold bg-slate-950 p-0.5 rounded border border-amber-900/40">
                  {b.description}
                </text>
              </g>
            );
          })}

          {hospitals.map((h, i) => {
            const { x, y } = getXY(h.latitude, h.longitude);
            const isFull = h.current_occupancy >= h.emergency_capacity;
            return (
              <g key={`hosp-${i}`} className="cursor-pointer">
                <rect x={x - 10} y={y - 10} width="20" height="20" rx="3" fill={isFull ? '#ef4444' : '#10b981'} fillOpacity="0.15" stroke={isFull ? '#ef4444' : '#10b981'} strokeWidth="1.5" />
                <text x={x} y={y + 3} textAnchor="middle" fill={isFull ? '#ef4444' : '#10b981'} className="text-[10px] font-bold">🏥</text>
                <text x={x} y={y + 20} textAnchor="middle" fill="#94a3b8" className="text-[8px] font-semibold">{h.name.split(" ").slice(0, 2).join(" ")}</text>
                <text x={x} y={y - 14} textAnchor="middle" fill="#64748b" className="text-[7px] font-mono">
                  {h.current_occupancy}/{h.emergency_capacity}
                </text>
              </g>
            );
          })}

          {resources.map((r, i) => {
            const { x, y } = getXY(r.latitude, r.longitude);
            const isDispatched = selectedRec && selectedRec.resource_id === r.id;
            return (
              <g key={`res-${i}`} className="cursor-pointer">
                <circle cx={x} cy={y} r="9" fill={r.availability ? '#38bdf8' : '#64748b'} fillOpacity="0.2" stroke={r.availability ? '#0284c7' : '#475569'} strokeWidth="1.5" />
                {isDispatched && (
                   <circle cx={x} cy={y} r="14" fill="none" stroke="#6366f1" strokeWidth="1.5">
                     <animate attributeName="r" values="9;18;9" dur="2s" repeatCount="indefinite" />
                     <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                   </circle>
                )}
                <text x={x} y={y + 3} textAnchor="middle" className="text-[9px]">🚑</text>
                <text x={x} y={y - 12} textAnchor="middle" fill={r.availability ? '#38bdf8' : '#94a3b8'} className="text-[7px] font-bold">{r.name}</text>
              </g>
            );
          })}

          {selectedIncident && (
             <g>
               <circle 
                 cx={getXY(selectedIncident.latitude, selectedIncident.longitude).x} 
                 cy={getXY(selectedIncident.latitude, selectedIncident.longitude).y} 
                 r="20" 
                 fill="none" 
                 stroke="#ef4444" 
                 strokeWidth="1.5"
               >
                 <animate attributeName="r" values="6;24" dur="1.5s" repeatCount="indefinite" />
                 <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
               </circle>
               <circle 
                 cx={getXY(selectedIncident.latitude, selectedIncident.longitude).x} 
                 cy={getXY(selectedIncident.latitude, selectedIncident.longitude).y} 
                 r="7" 
                 fill="#ef4444" 
               />
               <text 
                 x={getXY(selectedIncident.latitude, selectedIncident.longitude).x} 
                 y={getXY(selectedIncident.latitude, selectedIncident.longitude).y + 3} 
                 textAnchor="middle" 
                 className="text-[9px]"
               >
                 🚨
               </text>
               <text 
                 x={getXY(selectedIncident.latitude, selectedIncident.longitude).x} 
                 y={getXY(selectedIncident.latitude, selectedIncident.longitude).y - 14} 
                 textAnchor="middle" 
                 fill="#f87171" 
                 className="text-[8px] font-extrabold uppercase tracking-wide bg-slate-950 px-1 border border-red-900/50 rounded"
               >
                 {selectedIncident.incident_type}
               </text>
             </g>
          )}
       </svg>
    </div>
  );
};

export default function OperatorCommandCenter() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [aiData, setAiData] = useState<any>(null)
  const [ragGuidance, setRagGuidance] = useState<string>('')
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null)
  const [isProcessingApproval, setIsProcessingApproval] = useState(false)
  const [blockages, setBlockages] = useState<any[]>([])
  const [dynamicAlert, setDynamicAlert] = useState<string | null>(null)
  const [hospitals, setHospitals] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')
  const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || apiUrl.replace(/^http/, 'ws')).replace(/\/$/, '')

  const loadInitialData = async () => {
    try {
      const resInc = await fetch(`${apiUrl}/api/incidents`)
      const resBlock = await fetch(`${apiUrl}/api/blockages`)
      const resHosp = await fetch(`${apiUrl}/api/hospitals`)
      const resRes = await fetch(`${apiUrl}/api/resources`)
      
      if (resInc.ok) {
        const data = await resInc.json()
        setIncidents(data)
        if (data.length > 0) {
          const pending = data.find((i: Incident) => i.status === 'Pending') || data[0]
          handleSelectIncident(pending)
        }
      }
      if (resBlock.ok) setBlockages(await resBlock.json())
      if (resHosp.ok) setHospitals(await resHosp.json())
      if (resRes.ok) setResources(await resRes.json())
    } catch (e) {
      console.error('Error fetching operator console data:', e)
    }
  }

  useEffect(() => {
    loadInitialData()

    const socket = new WebSocket(`${wsUrl}/ws`)
    
    socket.onopen = () => {
      console.log('Operator WS connected.')
    }

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        
        if (payload.type === 'NEW_INCIDENT') {
          setIncidents(prev => [payload.incident, ...prev])
          setDynamicAlert(`NEW INCOMING EMERGENCY: ${payload.incident.incident_type} (${payload.incident.severity})`)
          setTimeout(() => setDynamicAlert(null), 5000)
          loadInitialData()
        }
        
        else if (payload.type === 'INCIDENT_DISPATCHED') {
          setIncidents(prev => prev.map(inc => 
            inc.id === payload.incident_id ? { ...inc, status: 'Dispatched' } : inc
          ))
          if (selectedIncident && selectedIncident.id === payload.incident_id) {
            setSelectedIncident(prev => prev ? { ...prev, status: 'Dispatched' } : null)
          }
          loadInitialData()
        }
        
        else if (payload.type === 'DYNAMIC_REPLAN') {
          setDynamicAlert(`Dynamic Re-planning triggered: ${payload.description}`)
          setTimeout(() => setDynamicAlert(null), 5000)
          
          fetch(`${apiUrl}/api/blockages`)
            .then(res => res.json())
            .then(data => setBlockages(data))

          loadInitialData()

          if (selectedIncident) {
            const match = payload.updates.find((u: any) => u.incident_id === selectedIncident.id)
            if (match) {
              setRecommendations(match.recommendations)
              if (selectedRec) {
                const updatedRec = match.recommendations.find((r: Recommendation) => r.resource_id === selectedRec.resource_id && r.hospital_id === selectedRec.hospital_id)
                setSelectedRec(updatedRec || match.recommendations[0])
              } else {
                setSelectedRec(match.recommendations[0])
              }
            }
          }
        }
      } catch (e) {
        console.error('Error handling WebSocket message:', e)
      }
    }

    return () => {
      socket.close()
    }
  }, [selectedIncident, selectedRec])

  const handleSelectIncident = async (incident: Incident) => {
    setSelectedIncident(incident)
    setAiData(null)
    setRagGuidance('')
    setRecommendations([])
    setSelectedRec(null)

    try {
      const resRecs = await fetch(`${apiUrl}/api/incidents/${incident.id}/recommendations`)
      if (resRecs.ok) {
        const recs = await resRecs.json()
        setRecommendations(recs)
        if (recs.length > 0) {
          setSelectedRec(recs[0])
        }
      }

      const resEvents = await fetch(`${apiUrl}/api/incidents/${incident.id}/events`)
      if (resEvents.ok) {
        const events = await resEvents.json()
        const reportEvent = events.find((e: any) => e.event_type === 'Incident_Reported')
        if (reportEvent && reportEvent.metadata) {
          setAiData(reportEvent.metadata.ai_extracted)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const approveDispatch = async (recId: number) => {
    if (isProcessingApproval) return
    setIsProcessingApproval(true)
    try {
      const res = await fetch(`${apiUrl}/api/recommendations/${recId}/approve`, {
        method: 'POST'
      })
      if (res.ok) {
        loadInitialData()
        alert('Emergency response dispatch approved! Responders notified.')
      } else {
        alert('Failed to approve dispatch.')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessingApproval(false)
    }
  }

  const rejectDispatch = (recId: number) => {
    setSelectedRec(null)
    alert('Recommendation rejected. Please select an alternative dispatch recommendation.')
  }

  const roundTime = (s?: number) => {
    if (s === undefined || s === null || isNaN(s)) return "N/A"
    return `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-64px)] relative bg-[#070b13]">
      
      {dynamicAlert && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-amber-500 px-6 py-3 text-slate-900 font-bold shadow-2xl flex items-center gap-2 border border-slate-950 animate-bounce">
          <ShieldAlert className="h-5 w-5" />
          <span>{dynamicAlert}</span>
        </div>
      )}

      {/* Panel 1: Live Emergency Feed */}
      <div className="w-full md:w-80 border-r border-slate-800 bg-[#0f172a]/95 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-red-500 siren-ping" />
            Live Emergency Feed
          </h2>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-500">
            {incidents.length} logs
          </span>
        </div>
        <div className="divide-y divide-slate-800/60">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => handleSelectIncident(inc)}
              className={`p-4 cursor-pointer hover:bg-slate-900/60 transition flex flex-col gap-2 relative ${
                selectedIncident?.id === inc.id ? 'bg-slate-900/80 border-l-4 border-indigo-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  inc.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  inc.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                  inc.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                  'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }`}>
                  {inc.severity}
                </span>
                <span className={`text-[10px] uppercase font-bold ${
                  inc.status === 'Pending' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {inc.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate">{inc.incident_type}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{inc.description}</p>
              <p className="text-[10px] text-slate-600 font-mono mt-1">
                {new Date(inc.created_at).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel 2: Interactive Map Panel */}
      <div className="flex-1 relative border-r border-slate-800 h-full min-h-[300px]">
        <TacticalMap 
          incidents={incidents}
          selectedIncident={selectedIncident}
          selectedRec={selectedRec}
          hospitals={hospitals}
          resources={resources}
          blockages={blockages}
        />
        
        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3 backdrop-blur shadow-2xl text-xs space-y-2 z-10">
          <p className="font-bold text-white flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-slate-400" /> Legend
          </p>
          <div className="space-y-1.5 text-slate-300">
            <div className="flex items-center gap-2"><span className="text-sm">🚨</span> <span>Active Incident</span></div>
            <div className="flex items-center gap-2"><span className="text-sm">🏥</span> <span>Hospital / ER</span></div>
            <div className="flex items-center gap-2"><span className="text-sm">🚑</span> <span>Ambulance Unit</span></div>
            <div className="flex items-center gap-2"><span className="text-sm">🚧</span> <span>Road Blockage</span></div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-6 rounded bg-indigo-600 block"></span> <span>Transit Route</span></div>
          </div>
        </div>
      </div>

      {/* Panel 3: Console Incident Detail Controls */}
      <div className="w-full md:w-96 bg-[#0f172a]/95 flex flex-col overflow-y-auto">
        {selectedIncident ? (
          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Incident Header */}
              <div className="border-b border-slate-800 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">Incident #{selectedIncident.id}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(selectedIncident.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">{selectedIncident.incident_type}</h2>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "{selectedIncident.description}"
                </p>
              </div>

              {/* AI Structured Intelligence */}
              {aiData && (
                <div className="rounded-xl border border-slate-800 bg-[#070b13]/60 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-indigo-400" />
                    AI Incident Intelligence
                  </h3>
                  <div className="text-xs space-y-2 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Victim Count:</span>
                      <span className="font-bold text-white">{aiData.num_victims}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Required Services:</span>
                      <span className="font-bold text-indigo-400">{aiData.required_services.join(', ')}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Key Details:</span>
                      <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px] pl-1">
                        {aiData.key_details.map((detail: string, idx: number) => (
                          <li key={idx} className="truncate">{detail}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* RAG Guidance section */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                  RAG Dispatch Guidance
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed font-mono whitespace-pre-line bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  {selectedIncident.incident_type === 'Cardiac Arrest' 
                    ? "Official First Aid Instructions (CPR Guidelines):\nIf a person is unresponsive and not breathing, immediately call emergency services and begin CPR. Place hands on the center of the victim's chest and push hard and fast (100 to 120 compressions per minute). Use an AED if available."
                    : selectedIncident.incident_type === 'Structure Fire'
                    ? "Official First Aid Instructions (Structure Fire and Thermal Burn):\nEvacuate building immediately. Cool severe thermal burns with cool running water for 10-20 minutes. Cover loosely with sterile bandage. Do not apply ice/ointments."
                    : selectedIncident.incident_type === 'Car Collision'
                    ? "Official First Aid Instructions (Motor Vehicle Accident response):\nEnsure scene safety first. Do not move injured victims unless there is immediate danger. Apply direct pressure to bleeding."
                    : selectedIncident.incident_type === 'Gunshot Wound'
                    ? "Official First Aid Instructions (Severe Hemorrhage Care):\nEnsure scene safety. Apply tourniquet 2-3 inches above extremity bleeding. For chest/torso packing, apply heavy direct pressure."
                    : "Emergency Guidance:\nKeep the patient warm and dry, monitor breathing, and reassure them that emergency responders are en route."
                  }
                </p>
              </div>

              {/* Recommendations comparison */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  TrustScore Dispatch Options
                </h3>
                <div className="space-y-2">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRec(rec)}
                      className={`p-3 rounded-xl border cursor-pointer hover:bg-slate-900/60 transition flex items-center justify-between gap-4 ${
                        selectedRec?.id === rec.id 
                          ? 'border-indigo-500 bg-[#0e1626]/80' 
                          : 'border-slate-800 bg-[#070b13]/60'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs truncate">{rec.resource_name}</span>
                          <span className="text-[10px] text-slate-500">to</span>
                          <span className="font-bold text-slate-300 text-xs truncate max-w-[80px]">{rec.hospital_name}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          Est. travel time: {roundTime(rec.score_breakdown.duration_sec)}
                        </p>
                      </div>
                      
                      {/* TrustScore score tag */}
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-black ${
                          rec.trust_score >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                          rec.trust_score >= 60 ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          <Award className="h-3 w-3" />
                          {rec.trust_score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TrustScore detailed breakdown panel */}
              {selectedRec && (
                <div className="rounded-xl border border-slate-800 bg-[#070b13]/40 p-4 space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    TrustScore breakdown: {selectedRec.trust_score} pts
                  </h3>
                  
                  {/* Detailed Bar Charts */}
                  <div className="space-y-2 text-[10px] text-slate-300">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Travel ETA Score</span>
                        <span className="font-semibold">{selectedRec.score_breakdown.time_score} / 100</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1">
                        <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${selectedRec.score_breakdown.time_score}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Hospital Specialties</span>
                        <span className="font-semibold">{selectedRec.score_breakdown.specialty_score} / 100</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1">
                        <div className="bg-cyan-500 h-1 rounded-full" style={{ width: `${selectedRec.score_breakdown.specialty_score}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Hospital Capacity</span>
                        <span className="font-semibold">{selectedRec.score_breakdown.capacity_score} / 100</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1">
                        <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${selectedRec.score_breakdown.capacity_score}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Route Safety & Blocks</span>
                        <span className="font-semibold">{selectedRec.score_breakdown.route_condition_score} / 100</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1">
                        <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${selectedRec.score_breakdown.route_condition_score}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded leading-relaxed mt-2 border border-slate-800/80">
                    <span className="font-bold text-white">AI Reason: </span>
                    {selectedRec.explanation}
                  </p>
                </div>
              )}

            </div>

            {/* Approval Footer Buttons */}
            {selectedRec && selectedIncident.status === 'Pending' && (
              <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  onClick={() => rejectDispatch(selectedRec.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 transition"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
                <button
                  onClick={() => approveDispatch(selectedRec.id)}
                  disabled={isProcessingApproval}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 py-2.5 text-xs font-bold text-white shadow hover:scale-[1.02] active:scale-95 transition"
                >
                  <Check className="h-4 w-4" /> Approve Dispatch
                </button>
              </div>
            )}
            
            {selectedIncident.status !== 'Pending' && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 mt-6 text-center text-xs font-bold text-emerald-400">
                ✓ Response Dispatched & En Route
              </div>
            )}

          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 italic my-auto">
            No incidents reported. Waiting for live feeds...
          </div>
        )}
      </div>

    </div>
  )
}

// Helpers
function roundTime(seconds: number): string {
  const mins = seconds / 60.0
  if (mins < 1) return 'Under 1 min'
  return `${Math.round(mins)} mins`
}
