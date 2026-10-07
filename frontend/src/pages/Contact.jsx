import { apiBaseUrl } from '../lib/config';
import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Camera, Mail, MapPin, MessageCircle, Phone, Send, Video } from "lucide-react";
import { useToast } from "../context/ToastContext";

const SOCIALS = [
  { icon: MessageCircle, href: "https://twitter.com", label: "Twitter" },
  { icon: Camera, href: "https://www.instagram.com", label: "Instagram" },
  { icon: Video, href: "https://www.youtube.com", label: "YouTube" },
  { icon: Briefcase, href: "https://www.linkedin.com", label: "LinkedIn" },
];

const BASEURL = apiBaseUrl;

export default function Contact() {
  const { notify } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(`${BASEURL}/api/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        notify(data.error || data.message?.[0] || "We couldn't send your message. Please try again.", "error");
        return;
      }
      notify(data.message || "Thanks for reaching out — we'll get back to you soon.", "success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Contact form error:", err);
      notify("We couldn't send your message. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f6f1] pb-20 pt-24">
      <section className="page-shell py-10">
        <div className="mb-10 max-w-xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#71813d]">Get in touch</p>
          <h1 className="display-font text-4xl tracking-tight text-[#18231c] sm:text-5xl">Contact us</h1>
          <p className="mt-3 text-sm leading-6 text-[#68716b]">Questions, feedback, or just want to say hi? We&apos;d love to hear from you.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#dedfd7] bg-white p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f4f4ee] text-[#173c2b]"><Phone size={19} /></span>
              <h3 className="mt-4 font-semibold text-[#18231c]">Call us anytime</h3>
              <a href="tel:+919866109959" className="mt-1 block text-sm font-semibold text-[#71813d] hover:underline">+91 98661 09959</a>
            </div>
            <div className="rounded-2xl border border-[#dedfd7] bg-white p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f4f4ee] text-[#173c2b]"><Mail size={19} /></span>
              <h3 className="mt-4 font-semibold text-[#18231c]">Email support</h3>
              <a href="mailto:bhattagaurav100@gmail.com" className="mt-1 block text-sm font-semibold text-[#71813d] hover:underline">bhattagaurav100@gmail.com</a>
            </div>
            <div className="rounded-2xl border border-[#dedfd7] bg-white p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f4f4ee] text-[#173c2b]"><MapPin size={19} /></span>
              <h3 className="mt-4 font-semibold text-[#18231c]">Find us</h3>
              <p className="mt-1 text-sm text-[#68716b]">LeloVaiLelo Street</p>
            </div>
            <div className="rounded-2xl border border-[#dedfd7] bg-white p-6">
              <h3 className="mb-3 font-semibold text-[#18231c]">Follow along</h3>
              <div className="flex gap-2">
                {SOCIALS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="grid h-10 w-10 place-items-center rounded-full border border-[#dedfd7] text-[#59635c] transition hover:border-[#9cab6d] hover:text-[#173c2b]">
                      <Icon size={17} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="h-fit space-y-4 rounded-2xl border border-[#dedfd7] bg-white p-6 sm:p-8"
          >
            <h2 className="font-semibold text-[#18231c]">Send us a message</h2>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">Name</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Your name" className="w-full rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-4 py-3 text-sm text-[#18231c] outline-none transition placeholder:text-[#a3a89e] focus:border-[#9cab6d] focus:bg-white" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">Email</span>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" className="w-full rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-4 py-3 text-sm text-[#18231c] outline-none transition placeholder:text-[#a3a89e] focus:border-[#9cab6d] focus:bg-white" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">Message</span>
              <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required placeholder="How can we help?" className="w-full resize-none rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-4 py-3 text-sm text-[#18231c] outline-none transition placeholder:text-[#a3a89e] focus:border-[#9cab6d] focus:bg-white" />
            </label>
            <button type="submit" disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#173c2b] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#24533d] disabled:cursor-not-allowed disabled:opacity-50">
              <Send size={15} /> {sending ? "Sending…" : "Send message"}
            </button>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
