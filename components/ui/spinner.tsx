import { cn } from "@/lib/utils"
import { ArrowPathIcon } from "@heroicons/react/24/outline"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <ArrowPathIcon data-slot="spinner" role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
