import { ArrowLeft, BookOpen, Hammer, Home, Sparkles, WalletCards } from "lucide-react";

const NOTE = "https://note.com/deft_eel6718";

type Tone = "start" | "build" | "earn" | "read" | "return";

export function VectorHeader({ tone = "start" }: { tone?: Tone }) {
  return <header className={`vx-header tone-${tone}`}>
    <a href="/" className="vx-brand" aria-label="Vector Praxis ホーム"><span className="vx-mark">V</span><span><b>Vector Praxis</b><small>Practice → Build → Earn</small></span></a>
    <nav className="vx-nav" aria-label="Vector navigation">
      <a href="/#routes"><Sparkles size={15}/> Start</a>
      <a href="/#routes"><Hammer size={15}/> Build</a>
      <a href="/#routes" className="is-earn"><WalletCards size={15}/> Earn</a>
      <a href={NOTE} target="_blank" rel="noopener noreferrer"><BookOpen size={15}/> Read</a>
    </nav>
  </header>;
}

export function VectorFooter() {
  return <footer className="vx-footer shell">
    <div><span className="vx-mark small">V</span><span><b>Vector Praxis</b><small>AIを使って、次の一手まで。</small></span></div>
    <nav><a href="/"><Home size={14}/> Hub</a><a href={NOTE} target="_blank" rel="noopener noreferrer"><BookOpen size={14}/> note</a></nav>
    <small>© 2026 Vector Praxis</small>
  </footer>;
}

export function BackToHub() {
  return <a href="/" className="vx-back"><ArrowLeft size={15}/> Vector Hubへ戻る</a>;
}
