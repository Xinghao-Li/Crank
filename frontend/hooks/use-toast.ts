// In hooks/use-toast.ts
import {
    Toast,
    ToastActionElement,
    ToastProps,
  } from "@/components/ui/toast"
  import {
    useToast as useToastOriginal,
  } from "@/components/ui/use-toast"
  
  export const useToast = useToastOriginal
  export type { Toast, ToastActionElement, ToastProps }