import Link from 'next/link'
import { Shield, Zap, MapPin, Activity, BellRing, ServerCrash } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="relative isolate overflow-hidden bg-[#0b0f19] flex-1">
      {/* Background radial gradient decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff4d4d] to-[#ffcc00] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-md bg-red-400/10 px-3 py-1 text-sm font-medium text-red-400 ring-1 ring-inset ring-red-400/20">
            ResQMesh v2.4 (Enterprise Edition)
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Real-Time Emergency Response Support
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400">
            ResQMesh combines AI report classification, PostGIS geospatial intelligence, OSRM routing, and a transparent **TrustScore Engine** to help dispatchers make correct decisions in critical seconds.
          </p>
        </div>

        {/* System Status Metrics */}
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-[#0f172a]/50 p-6 backdrop-blur text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Incidents</p>
            <p className="mt-2 text-3xl font-bold text-red-500">Live Feed</p>
            <p className="mt-1 text-xs text-slate-400">Updates via WebSockets</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0f172a]/50 p-6 backdrop-blur text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ready Ambulances</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">Medic units</p>
            <p className="mt-1 text-xs text-slate-400">Monitored in SF Area</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0f172a]/50 p-6 backdrop-blur text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospitals Available</p>
            <p className="mt-2 text-3xl font-bold text-cyan-400">4 Trauma/Burn</p>
            <p className="mt-1 text-xs text-slate-400">ZSFG, UCSF, Kaiser, CPMC</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0f172a]/50 p-6 backdrop-blur text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg routing latency</p>
            <p className="mt-2 text-3xl font-bold text-amber-400">&lt; 350ms</p>
            <p className="mt-1 text-xs text-slate-400">Fast deterministic score</p>
          </div>
        </div>

        {/* Portal Access Cards */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Card 1: Citizen Emergency Reporting */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0e1626]/80 p-8 shadow-2xl transition hover:border-slate-700">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/10 text-red-500">
                <BellRing className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white group-hover:text-red-400 transition">Citizen Reporting</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Report critical emergencies using text, voice simulation, and geolocation. Trigger a direct instant SOS alarm and track responder status.
              </p>
            </div>
            <Link href="/citizen" className="mt-6 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition">
              Report Emergency
            </Link>
          </div>

          {/* Card 2: Command Center */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0e1626]/80 p-8 shadow-2xl transition hover:border-slate-700">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white group-hover:text-indigo-400 transition">Operator Command Center</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Real-time dispatcher console. Review AI incident details, consult pgvector RAG guidance, compare TrustScore resource options, and click to dispatch.
              </p>
            </div>
            <Link href="/operator" className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition">
              Launch Command Center
            </Link>
          </div>

          {/* Card 3: Admin Resource Management */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0e1626]/80 p-8 shadow-2xl transition hover:border-slate-700">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600/10 text-amber-500">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white group-hover:text-amber-400 transition">Resource Control</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Manage ambulances and hospital occupancy. Register simulated road blockages on the street map to test the system's dynamic replanning.
              </p>
            </div>
            <Link href="/admin" className="mt-6 inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 transition">
              Configure Assets
            </Link>
          </div>
        </div>

        {/* Workflow Diagram Section */}
        <div className="mx-auto mt-20 max-w-4xl border border-slate-800 bg-slate-950/40 rounded-2xl p-8 backdrop-blur">
          <h2 className="text-2xl font-bold text-center text-white mb-8">ResQMesh Core Decision Flow</h2>
          <div className="flex flex-col md:flex-row items-center justify-around gap-4 text-center">
            <div className="flex-1 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="block text-xs font-semibold text-red-400 uppercase">1. Citizens</span>
              <span className="block mt-2 text-base font-bold text-white">Unstructured Report</span>
              <span className="block mt-1 text-xs text-slate-500">Text + GPS coordinates</span>
            </div>
            <div className="text-slate-600 font-extrabold rotate-90 md:rotate-0">→</div>
            <div className="flex-1 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="block text-xs font-semibold text-indigo-400 uppercase">2. AI & OSRM</span>
              <span className="block mt-2 text-base font-bold text-white">Structured Extraction</span>
              <span className="block mt-1 text-xs text-slate-500">Classification & routing</span>
            </div>
            <div className="text-slate-600 font-extrabold rotate-90 md:rotate-0">→</div>
            <div className="flex-1 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="block text-xs font-semibold text-amber-400 uppercase">3. Scoring</span>
              <span className="block mt-2 text-base font-bold text-white">TrustScore Ranking</span>
              <span className="block mt-1 text-xs text-slate-500">Deterministic factors</span>
            </div>
            <div className="text-slate-600 font-extrabold rotate-90 md:rotate-0">→</div>
            <div className="flex-1 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="block text-xs font-semibold text-emerald-400 uppercase">4. Dispatcher</span>
              <span className="block mt-2 text-base font-bold text-white">Human Approval</span>
              <span className="block mt-1 text-xs text-slate-500">One-click activation</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
