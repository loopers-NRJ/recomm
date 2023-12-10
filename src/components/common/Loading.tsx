import { Loader2 } from "lucide-react";
import Container from "../Container";
import { cn } from "@/lib/utils";

type LoadingProps = React.ComponentProps<"div"> & { size?: number };

const Loading = ({ className, size = 36, ...props }: LoadingProps) => {
  return (
    <Container
      className={cn(
        "flex h-full w-full items-center justify-center",
        className
      )}
      {...props}
    >
      <Loader2 className="animate-spin" size={size} color="#000" />
    </Container>
  );
};

export default Loading;
