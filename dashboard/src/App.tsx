import { useState, useEffect } from 'react'
import { Activity, Server, Cpu, Layers, RefreshCw, Terminal, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'

interface Job {
    id: string
    type: string
    status: string
    node: string
    priority: number
    timestamp: number
    exit_code?: number
    failure_reason?: string
}

function App() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [stats, setStats] = useState({ active: 0, completed: 0, nodes: 1, cpu: 0 })
    const [loading, setLoading] = useState(false)
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)

    const fetchJobs = async () => {
        setLoading(true)
        try {
            const res = await fetch('http://localhost:9091/api/v1/jobs', {
                headers: { 'Authorization': 'Bearer hydra-admin-token' }
            })
            const data = await res.json()
            setJobs(data.sort((a: Job, b: Job) => b.timestamp - a.timestamp))

            const active = data.filter((j: Job) => j.status === 'RUNNING' || j.status === 'PENDING').length
            const completed = data.filter((j: Job) => j.status === 'COMPLETED').length
            setStats(prev => ({ ...prev, active, completed }))
        } catch (err) {
            console.error("Failed to fetch jobs:", err)
        } finally {
            setTimeout(() => setLoading(false), 500)
        }
    }

    const submitMockJob = async () => {
        try {
            await fetch('http://localhost:9091/api/v1/submit', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer hydra-admin-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ command: 'echo "simulation"', type: 'SIMULATION' })
            })
            fetchJobs()
        } catch (e) { console.error(e) }
    }

    useEffect(() => {
        fetchJobs()
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                cpu: Math.floor(Math.random() * 40) + 30
            }))
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}>
            {/* Sticky Header */}
            <header className="layout-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex items-center gap-4">
                    <div style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', padding: '12px', borderRadius: '12px', boxShadow: '0 0 20px rgba(139,92,246,0.5)' }}>
                        <Zap size={28} color="white" fill="white" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(to right, white, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HYDRA-X</h1>
                        <div style={{ color: '#06b6d4', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Advanced Orchestration</div>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={submitMockJob}
                    className="btn-primary"
                >
                    <span style={{ marginRight: '8px' }}>+</span> Deploy Workload
                </motion.button>
            </header>

            <main style={{ display: 'grid', gap: '2rem' }}>
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                    <StatCard icon={<Activity color="#22d3ee" />} label="ACTIVE WORKLOADS" value={stats.active} delay={0.1} />
                    <StatCard icon={<Server color="#8b5cf6" />} label="ACTIVE NODES" value={stats.nodes} delay={0.2} />
                    <StatCard icon={<Cpu color="#f472b6" />} label="CLUSTER LOAD" value={`${stats.cpu}%`} delay={0.3} />
                    <StatCard icon={<Layers color="#34d399" />} label="TOTAL JOBS" value={jobs.length} delay={0.4} />
                </div>

                {/* Content Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    {/* Job Table & Timeline */}
                    <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', minHeight: '650px' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em', color: '#e4e4e7', textTransform: 'uppercase' }}>Live Execution Feed</h2>
                            <button
                                onClick={fetchJobs}
                                style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}
                            >
                                <RefreshCw size={14} className={loading ? 'spin' : ''} /> SYNC
                            </button>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Job ID</th>
                                        <th>Timeline</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {jobs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} style={{ textAlign: 'center', padding: '6rem', color: '#52525b' }}>
                                                    <div style={{ marginBottom: '1rem' }}><Terminal size={48} /></div>
                                                    <div>SYSTEM IDLE</div>
                                                    <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Ready for new workloads</div>
                                                </td>
                                            </tr>
                                        ) : (
                                            jobs.map((job) => (
                                                <motion.tr
                                                    key={job.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className={selectedJob?.id === job.id ? 'selected-row' : ''}
                                                    onClick={() => setSelectedJob(job)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td>
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f4f4f5', letterSpacing: '-0.02em', fontSize: '0.9rem' }}>{job.id.split('-')[1]}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{job.type}</div>
                                                    </td>
                                                    <td>
                                                        <JobTimeline status={job.status} />
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge status-${job.status}`}>
                                                            {job.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="inspect-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedJob(job);
                                                            }}
                                                        >
                                                            INSPECT
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Side Panel: Job Inspector */}
                    <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-dim)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)' }}>
                            <Terminal size={18} color="#22d3ee" />
                            <span style={{ fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.85rem', color: '#e4e4e7' }}>DIAGNOSTICS</span>
                        </div>

                        <div style={{ padding: '2rem', flex: 1, position: 'relative' }}>
                            {selectedJob ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#71717a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>UNIQUE IDENTIFIER</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', color: '#fff', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>{selectedJob.id}</div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#71717a', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Node ID</div>
                                            <div style={{ color: '#e4e4e7', fontFamily: 'var(--font-mono)' }}>{selectedJob.node}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#71717a', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Priority</div>
                                            <div style={{ color: '#8b5cf6', fontWeight: 700 }}>LEVEL {selectedJob.priority}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#71717a', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>Execution Strategy</div>
                                        <code style={{ display: 'block', background: '#09090b', padding: '1.5rem', borderRadius: '8px', color: '#22d3ee', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', border: '1px solid var(--border-dim)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}>
                                            {/* @ts-ignore */}
                                            $ {selectedJob.command || "echo 'Unknown'"}
                                        </code>
                                    </div>

                                    {selectedJob.status === 'FAILED' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1.5rem', borderRadius: '8px' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171', marginBottom: '10px', fontWeight: '700', fontSize: '0.9rem' }}>
                                                <AlertCircle size={20} /> CRITICAL FAILURE
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#fca5a5', lineHeight: 1.6 }}>
                                                Process terminated unexpectedly with <span style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>EXIT_CODE_{selectedJob.exit_code || 1}</span>.
                                            </div>
                                        </motion.div>
                                    )}

                                    {selectedJob.status === 'COMPLETED' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.5rem', borderRadius: '8px' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399', marginBottom: '10px', fontWeight: '700', fontSize: '0.9rem' }}>
                                                <CheckCircle size={20} /> EXECUTION SUCCESS
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#a7f3d0' }}>
                                                Resources released. Artifacts archived securely.
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b', textAlign: 'center', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ padding: '2rem', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-dim)' }}>
                                        <Terminal size={48} strokeWidth={1} style={{ opacity: 0.5 }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#71717a' }}>NO SELECTION</div>
                                        <span style={{ fontSize: '0.8rem' }}>Select a workload from the feed</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function StatCard({ icon, label, value, delay }: { icon: any, label: string, value: any, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-card"
            style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
        >
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-dim)' }}>{icon}</div>
            <div>
                <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</div>
                <div className="stat-value" style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#fff', lineHeight: 1 }}>{value}</div>
            </div>
        </motion.div>
    )
}

function JobTimeline({ status }: { status: string }) {
    const states = ['PENDING', 'RUNNING', 'COMPLETED']
    const isFailed = status === 'FAILED'
    const step = isFailed ? 2 : states.indexOf(status)

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {[0, 1, 2].map((s) => {
                let color = '#27272a' // default dark
                let shadow = 'none'

                if (s < step) { color = '#34d399'; shadow = '0 0 10px rgba(52, 211, 153, 0.4)'; } // completed
                if (s === step) {
                    color = isFailed ? '#f87171' : '#60a5fa';
                    shadow = isFailed ? '0 0 10px rgba(248, 113, 113, 0.4)' : '0 0 15px rgba(96, 165, 250, 0.6)';
                }

                return (
                    <motion.div
                        key={s}
                        initial={false}
                        animate={{ backgroundColor: color, boxShadow: shadow }}
                        style={{ width: '24px', height: '6px', borderRadius: '2px', transition: 'all 0.4s ease' }}
                    />
                )
            })}
        </div>
    )
}

export default App
