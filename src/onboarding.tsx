import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/onboarding.css';
import { Zap, MessagesSquare, Puzzle, ArrowRight } from 'lucide-react';
import { Logo } from './components/ui/Logo.tsx';

const steps = [
    {
        title: 'Your Autonomous Copilot',
        desc: 'BraceKit actively reads your active pages, understands context, and leverages multiple LLMs at your command.',
        icon: <Zap className="w-8 h-8" strokeWidth={1} />,
    },
    {
        title: 'Model Context Protocol',
        desc: 'Connect raw tools directly into BraceKit. Give your LLM the power to search, act, and execute via custom MCP servers.',
        icon: <Puzzle className="w-8 h-8" strokeWidth={1} />,
    },
    {
        title: 'Seamless Integration',
        desc: 'Highlight text to instantly grab context, or read the entire document with a single click.',
        icon: <MessagesSquare className="w-8 h-8" strokeWidth={1} />,
    }
];

const Onboarding = () => {
    useEffect(() => {
        // initialization here if needed
    }, []);

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-[#050505] text-[#fafafa] selection:bg-white selection:text-black flex flex-col items-center">
            {/* Dynamic Background Noise & Gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-[0.15] mix-blend-overlay"></div>
                <div className="absolute -top-[30%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-[#4f20b2] to-transparent blur-[120px] opacity-20 mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-[#2b2b2b] to-transparent blur-[150px] opacity-40 mix-blend-screen"></div>
            </div>

            <main className="relative z-10 w-full max-w-7xl px-8 py-12 min-h-screen flex flex-col justify-between">
                <header className="flex items-center justify-between animate-fade-in w-full">
                    <div className="text-xl font-bold tracking-tighter uppercase flex items-center gap-3">
                        <Logo className="w-6 h-6 text-white" />
                        BraceKit
                    </div>
                    <button onClick={() => window.close()} className="text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors border-b border-transparent hover:border-white/50 pb-1 cursor-pointer">
                        Skip & Close
                    </button>
                </header>

                <section className="flex-1 flex flex-col justify-center items-start mt-20 w-full">
                    <h1 className="text-5xl md:text-8xl tracking-tighter leading-[0.95] mb-8 font-bricolage translate-y-4 opacity-0 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                        Unleash<br />
                        <span className="italic font-light opacity-80 pl-8 md:pl-16">Absolute</span><br />
                        Context.
                    </h1>
                    <p className="text-lg md:text-2xl text-white/50 max-w-2xl font-light translate-y-4 opacity-0 animate-slide-up leading-relaxed" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
                        Configure your keys, attach an MCP server, and reshape how you interact with the web. BraceKit is ready.
                    </p>

                    <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 w-full translate-y-4 opacity-0 animate-slide-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
                        {steps.map((step, idx) => (
                            <div key={idx} className="group border-t border-white/10 pt-8 hover:border-white/50 transition-colors cursor-default">
                                <div className="text-white/30 mb-6 group-hover:scale-110 group-hover:text-white transition-all transform origin-left duration-500">
                                    {step.icon}
                                </div>
                                <h3 className="text-2xl font-semibold mb-3 tracking-tight font-bricolage text-white/90 group-hover:text-white">{step.title}</h3>
                                <p className="text-base text-white/40 leading-relaxed group-hover:text-white/70 transition-colors duration-500">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <footer className="mt-24 flex flex-col md:flex-row justify-between items-center md:items-end w-full translate-y-4 opacity-0 animate-slide-up" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-8 md:mb-0 flex flex-col gap-1 text-center md:text-left">
                        <span>v{chrome.runtime.getManifest().version} // Setup required</span>
                        <span className="text-white/20 tracking-[0.4em] mt-1">PART OF NEXIFLE LABS</span>
                    </div>
                    <button onClick={() => window.close()} className="group flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-medium tracking-wide hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                        Start Exploring
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </button>
                </footer>
            </main>
        </div>
    );
};

const elm = document.getElementById('root');
if (elm) {
    const root = createRoot(elm);
    root.render(<Onboarding />);
}
