import { Check, CircleCheck, Clock3, Package, Truck, XCircle } from "lucide-react";

const steps = [
  { status: "pending", label: "Placed", icon: Clock3, description: "Your order has been received." },
  { status: "processing", label: "Processing", icon: Package, description: "Your order is being prepared." },
  { status: "shipped", label: "Shipped", icon: Truck, description: "Your order is on its way." },
  { status: "delivered", label: "Delivered", icon: CircleCheck, description: "Your order has been delivered." },
];

export function OrderStatus({ status }: { status: string }) {
  const current = steps.findIndex(step => step.status === status);
  if (current < 0) return <div role="status" className="my-5 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm"><XCircle size={22} aria-hidden="true" /><div><p className="font-semibold">{status === "cancelled" ? "Order cancelled" : "Status unavailable"}</p><p className="mt-1 text-xs text-muted-foreground">{status === "cancelled" ? "This order will not continue through delivery." : "Please check again later for an update."}</p></div></div>;

  return <div className="my-5 rounded-xl border border-border bg-[#f7f8f3] px-2 py-5 sm:px-4">
    <ol aria-label="Order progress" className="grid grid-cols-4">
      {steps.map((step, index) => {
        const complete = index < current || status === "delivered";
        const active = index === current;
        const Icon = complete ? Check : step.icon;
        return <li key={step.status} aria-current={active ? "step" : undefined} className="relative flex min-w-0 flex-col items-center text-center">
          {index > 0 && <span aria-hidden="true" className={`absolute right-1/2 top-[18px] h-0.5 w-full ${index <= current ? "bg-primary" : "bg-border"}`} />}
          <span className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border-4 border-[#f7f8f3] ${index <= current ? "bg-primary text-primary-foreground" : "bg-border text-muted-foreground"} ${active ? "ring-1 ring-primary" : ""}`}><Icon size={15} aria-hidden="true" /></span>
          <span className={`mt-3 text-[10px] sm:text-xs ${index <= current ? "font-semibold text-primary" : "text-muted-foreground"}`}>{step.label}</span>
          <span className="sr-only">{active ? "Current stage" : complete ? "Complete" : "Upcoming"}</span>
        </li>;
      })}
    </ol>
    <p role="status" className="mt-5 text-center text-xs text-muted-foreground">{steps[current].description}</p>
  </div>;
}
