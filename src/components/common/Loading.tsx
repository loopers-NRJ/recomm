import { Loader2 } from "lucide-react";
import Container from "../Container";
import { cn } from "@/lib/utils";

const Loading = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <Container
      className={cn(
        "flex h-full w-full items-center justify-center",
        className
      )}
      {...props}
    >
      <Loader2 className="animate-spin" size={36} color="#000" />
    </Container>
  );
};

export default Loading;
