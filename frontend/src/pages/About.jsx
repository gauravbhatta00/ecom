import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles, Truck, Users } from "lucide-react";

const VALUES = [
  { icon: HeartHandshake, title: "Customer-first support", body: "Real answers, fast — we're here Monday through Friday and reply within 24 hours." },
  { icon: ShieldCheck, title: "Secure by default", body: "Encrypted payments and responsible data handling on every order." },
  { icon: Sparkles, title: "Curated, not endless", body: "A tight, honest selection instead of infinite scrolling." },
  { icon: Truck, title: "Fast, reliable shipping", body: "Tracked delivery with easy 30-day returns, no fine print." },
];

const STATS = [
  { value: "10k+", label: "Happy customers" },
  { value: "500+", label: "Curated products" },
  { value: "24h", label: "Support response" },
  { value: "4.8★", label: "Average rating" },
];

export default function About() {
  return (
    <main className="min-h-screen bg-[#f7f6f1] pb-20 pt-24">
      <section className="page-shell py-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#173c2b] px-8 py-16 text-white sm:px-14">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-10 right-0 h-64 w-64 bg-[#dff274]/10 blur-3xl" />
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#dff274]">Our story</p>
            <h1 className="display-font text-4xl leading-tight tracking-[-.03em] sm:text-5xl">A simpler way to shop for <span className="italic text-[#dff274]">real life.</span></h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/70">LeloVaiLelo is a trusted destination for quality products, secure checkout, and friendly service — built on reliability, transparency, and community.</p>
          </motion.div>
        </div>
      </section>

      <section className="page-shell py-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="rounded-2xl border border-[#dedfd7] bg-white py-6 text-center">
              <p className="display-font text-3xl text-[#173c2b]">{value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#8a9089]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell py-14">
        <div className="mb-10 max-w-xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#71813d]">What we stand for</p>
          <h2 className="display-font text-3xl tracking-tight text-[#18231c] sm:text-4xl">Built around a few honest principles</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {VALUES.map((value, i) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-2xl border border-[#dedfd7] bg-white p-6"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f4f4ee] text-[#173c2b]"><Icon size={20} /></span>
                <h3 className="mt-4 font-semibold text-[#18231c]">{value.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#68716b]">{value.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="page-shell py-6">
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-[#dedfd7] bg-white px-8 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#f4f4ee] text-[#173c2b]"><Users size={24} /></span>
          <div>
            <h2 className="display-font text-2xl text-[#18231c] sm:text-3xl">Join our community</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#68716b]">Follow along for new arrivals, honest picks, and the occasional good deal.</p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-[#173c2b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#24533d]">
            Start shopping <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
