import { Info } from '@phosphor-icons/react'

export function RuleNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/5 px-4 py-3">
      <Info size={18} weight="duotone" className="text-warning shrink-0 mt-0.5" />
      <p className="text-sm text-base-content/80">
        <span className="font-semibold text-warning">Note: </span>
        Expired license or Suspended status → blocked from trip assignment.
      </p>
    </div>
  )
}
