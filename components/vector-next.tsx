import { ArrowRight, BookOpen, Hammer, RotateCcw, WalletCards } from "lucide-react";

type Route = {
  label: string;
  title: string;
  text: string;
  href: string;
  event: string;
  kind?: "earn" | "build" | "read" | "return";
  external?: boolean;
};

const icon = {
  earn: <WalletCards size={19}/>,
  build: <Hammer size={19}/>,
  read: <BookOpen size={19}/>,
  return: <RotateCcw size={19}/>,
};

export function VectorNext({ eyebrow = "RECOMMENDED NEXT", title = "次の一手を選ぶ", routes }: { eyebrow?: string; title?: string; routes: Route[] }) {
  return <section className="vx-next shell">
    <div className="vx-next-heading"><span>{eyebrow}</span><h2>{title}</h2></div>
    <div className="vx-next-grid">
      {routes.map((route, index) => {
        const kind = route.kind || "return";
        return <a key={route.href} href={route.href} target={route.external ? "_blank" : undefined} rel={route.external ? "noopener noreferrer" : undefined} data-event={route.event} className={`vx-next-card is-${kind} ${index === 0 ? "is-primary" : ""}`}>
          <span className="vx-next-icon">{icon[kind]}</span>
          <span className="vx-next-copy"><small>{route.label}</small><b>{route.title}</b><em>{route.text}</em></span>
          <ArrowRight size={17}/>
        </a>;
      })}
    </div>
  </section>;
}
