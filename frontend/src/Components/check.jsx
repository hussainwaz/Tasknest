import React from "react";

export default function CustomCheckbox({
  label,
  checked,
  dueDate,
  due_date,
  onChange,
  isPending,
  disabled = false,
  className = "",
  labelClassName = "",
  checkboxClassName = "",
  showStrikeThrough = true
}) {
  const internalDueDate = dueDate ?? due_date ?? null;
  const safeDate = internalDueDate ? new Date(internalDueDate) : null;
  const formattedDate = safeDate ? safeDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : null;

  return (
    <label
      className={`group flex items-start gap-3 rounded-2xl border border-[rgba(109,141,255,0.16)] bg-[rgba(255,255,255,0.03)] px-4 py-3 transition-all duration-300 hover:border-[rgba(109,141,255,0.4)] ${isPending ? "translate-x-6 opacity-0" : "opacity-100"
        } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"} ${className}`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={disabled ? undefined : onChange}
        disabled={disabled}
      />
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-md border border-[rgba(197,208,245,0.35)] bg-[rgba(8,10,18,0.6)] text-[11px] font-semibold text-transparent transition-all peer-checked:border-[rgba(109,141,255,0.8)] peer-checked:bg-[rgba(109,141,255,0.85)] peer-checked:text-[rgba(4,7,13,0.85)] ${checkboxClassName}`}
      >
        ✓
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={`truncate text-sm font-medium text-white transition-all peer-checked:text-[rgba(197,208,245,0.6)] ${showStrikeThrough && checked ? "line-through" : ""
            } ${labelClassName}`}
        >
          {label}
        </span>
        {formattedDate && (
          <span className="text-xs text-[rgba(197,208,245,0.65)]">Due {formattedDate}</span>
        )}
      </div>
    </label>
  );
}