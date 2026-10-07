import { Link } from "react-router-dom";
import { SignupForm } from "../components/SignUpform";

export default function Page() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#173c2b] p-12 text-white lg:flex">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute bottom-0 right-0 h-72 w-72 bg-[#dff274]/10 blur-3xl" />
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <span className="grid h-10 w-10 rotate-3 place-items-center rounded-xl bg-[#dff274] text-sm font-black text-[#173c2b]">LV</span>
          <span className="display-font text-xl">LeloVaiLelo</span>
        </Link>
        <div className="relative z-10 max-w-md">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#dff274]">Join us</p>
          <h1 className="display-font text-4xl leading-tight tracking-[-.03em]">Better finds for <span className="italic text-[#dff274]">real life.</span></h1>
          <p className="mt-4 text-sm leading-6 text-white/65">Create an account to save your cart, track orders, and get first access to fresh arrivals.</p>
        </div>
        <p className="relative z-10 text-xs text-white/40">© {new Date().getFullYear()} LeloVaiLelo</p>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f7f6f1] p-6 md:p-10">
        <Link to="/" className="flex items-center gap-3 lg:hidden">
          <span className="grid h-10 w-10 rotate-3 place-items-center rounded-xl bg-[#173c2b] text-sm font-black text-[#dff274]">LV</span>
          <span className="display-font text-xl text-[#18231c]">LeloVaiLelo</span>
        </Link>
        <div className="w-full max-w-sm">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
