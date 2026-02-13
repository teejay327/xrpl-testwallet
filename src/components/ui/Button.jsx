import { cn } from "./cn";

const base = 
  "inline-flex items-center justitfy-center rounded-md font-semibold transition" +
  "focus:outline-none focus:ring-2 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950" +
  "disabled:opacity-50 disabled: pointer-events-none"

const variants = {
  primary: "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
  secondary: "bg-slate-800 test-slate-100 hover:bg-slate-700 border border-slate-700",
  ghost: "bg-transparent text-slate-100 hover: bg-slate-800/60",
  danger: "bg-rose-600 text-white hover:bg-rose-500"
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base"
};

const Button = ({ 
  className, 
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) => (
  <button 
    type = {type}
    className = {cn(base, variants[variant], sizes[size], className)}
    {...props}
    />
);

export default Button;