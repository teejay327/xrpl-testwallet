import cn from "./cn.js";

const Card = ({ className, children, ...props }) => {

  return (
    <section 
      className={cn(
        "rounded-xl border border-slate-800 bg-slate-900/40 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={cn("p-4 pb-2", className)} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ className, children, ...props }) => {
  return (
    <h2
      className={cn("text-lg font-bold text-slate-100", className)}
      {...props}
    >
      {children}
    </h2>
  );
};

const CardDescription = ({ className, children, ...props }) => {
  return (
    <p
      className={cn("mt-1 text-sm text-slate-300", className)}
      {...props}
    >
      {children}
    </p>
  )
};

const CardContent = ({ className, children, ...props }) => {
  return (
    <div 
      className={cn("p-4 pt-2", className)} {...props}
    >
      {children}
    </div>
  )
};

const CardFooter = ({ className, children, ...props }) => {
  return (
    <div
      className={cn("p-4 pt-2 flex items-center gap-3",  className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };