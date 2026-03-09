import cn from "./cn.js";

const Input = ({ className, ...props }) => {

  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-slate-100",
        "placeholder:text-slate-950",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950",
        className
      )}
      {...props}
    />
  );
};

export default Input;