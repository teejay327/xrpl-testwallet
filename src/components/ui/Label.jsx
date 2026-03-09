import cn from "./cn.js";

const Label = ({ className, children, ...props }) => {

  return (
    <label 
      className={cn("text-sm font-semibold text-slate-200", className)}
      {...props}
    >
      {children}
    </label>
  )
}


export default Label;