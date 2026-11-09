import { BrandMark } from '@/components/BrandMark'

export function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f9fc]">
      <div className="flex flex-col items-center gap-5">
        <BrandMark />
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-blue-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Organizando o atendimento...</p>
      </div>
    </div>
  )
}
