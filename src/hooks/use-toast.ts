
import {
    ToastActionElement,
    ToastProps,
  } from "@/components/ui/toast"
  
  import {
    useToast as useToastOriginal,
    toast as toastOriginal,
  } from "@/components/ui/toaster"
  
  export const useToast = useToastOriginal
  export const toast = toastOriginal
  
  export type Toast = ToastProps & {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
  }
