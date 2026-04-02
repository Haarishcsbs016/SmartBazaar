import { Toaster as SonnerToaster, toast } from "sonner";

const Toaster = (props) => {
  return <SonnerToaster className="toaster group" {...props} />;
};

export { Toaster, toast };
