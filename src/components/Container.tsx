import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  isAdminPage?: boolean;
}

const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "mx-auto max-w-[2520px] px-4 sm:px-2 md:px-10 xl:px-20",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
