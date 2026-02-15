import cn from "./cn";

const Container  = ({ className, children, ...props }) => {

  return (
    <div className={cn("mx-auto max-w-3xl p-6", className)} {...props}>
      {children}
    </div>
  )
};

export default Container;
