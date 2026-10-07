import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { adminLogin, isAuthenticated, user, loading, error } = useAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();
  if (isAuthenticated && user?.role === "admin") return <Navigate to="/admin" replace />;

  const submit = async (event) => {
    event.preventDefault();
    if (await adminLogin(credentials)) navigate(location.state?.from || "/admin", { replace: true });
  };

  return <main className="grid min-h-screen place-items-center bg-[#102a1e] px-4 py-24">
    <div className="w-full max-w-md rounded-[2rem] bg-[#f7f6f1] p-7 shadow-2xl sm:p-10">
      <div className="mb-8 grid h-14 w-14 place-items-center rounded-2xl bg-[#dff274] text-[#173c2b]"><ShieldCheck size={26} /></div>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#71813d]">Restricted area</p>
      <h1 className="display-font mt-2 text-4xl text-[#18231c]">Admin sign in</h1>
      <p className="mt-3 text-sm leading-6 text-[#6c756e]">Only authorized store administrators can access inventory, orders, and customer records.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#59635c]">Username</span><input autoFocus autoComplete="username" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} className="w-full rounded-xl border border-[#d8dad0] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#71813d]" required /></label>
        <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#59635c]">Password</span><div className="relative"><LockKeyhole size={17} className="absolute left-4 top-4 text-[#8a918a]" /><input type="password" autoComplete="current-password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} className="w-full rounded-xl border border-[#d8dad0] bg-white py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#71813d]" required /></div></label>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#173c2b] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#24533d] disabled:opacity-60">{loading ? "Signing in…" : "Enter dashboard"}<ArrowRight size={17} /></button>
      </form>
    </div>
  </main>;
}
