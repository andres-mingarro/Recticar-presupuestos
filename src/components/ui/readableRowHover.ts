export const readableRowHoverCls =
  "transition-[background-color,box-shadow] duration-[180ms] ease-out hover:bg-[var(--color-accent-soft)] hover:shadow-[inset_3px_0_0_var(--orange-vivid)] focus-within:bg-[var(--color-accent-soft)] focus-within:shadow-[inset_3px_0_0_var(--orange-vivid)]";

export const readableRowGroupCls = "group/readable-row";

export const readableRowGroupPanelCls =
  "transition-colors group-hover/readable-row:bg-[var(--color-accent-soft)] group-focus-within/readable-row:bg-[var(--color-accent-soft)]";

export function mergeReadableRowTransition(transition: string | undefined) {
  return [
    transition,
    "background-color 180ms ease",
    "box-shadow 180ms ease",
  ].filter(Boolean).join(", ");
}
