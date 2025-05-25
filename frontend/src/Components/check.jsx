import { useState, useEffect } from "react";

export default function CustomCheckbox({
  label,
  checked,
  due_date,
  onChange,
  isPending,
  disabled = false,
  className = "",
  labelClassName = "",
  checkboxClassName = "",
  showStrikeThrough = true
}) {
  const [isChecked, setIsChecked] = useState(checked);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = (e) => {
    if (disabled) return;

    setIsChecked(e.target.checked);
    setIsAnimating(true);
    onChange?.(e);

    setTimeout(() => setIsAnimating(false), 300);
  };

  const taskDate = new Date(due_date).toISOString().split('T')[0];
  return (
    <label
      className={`
        flex items-center justify-center gap-3 cursor-pointer w-full
        transition-all duration-300
        ${isPending ? "translate-x-[100%] opacity-0" : "opacity-100"}
        ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:translate-x-2 hover:w-[97%]"}
        ${className}
      `}
    >
      <input
        type="checkbox"
        className="hidden"
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
      />
      <div
        className={`
          w-5 h-5 border-2 rounded-sm flex items-center justify-center
          transition-colors duration-200
          ${isChecked ? "bg-red-600 border-red-600" : "border-gray-400"}
          ${isAnimating ? "scale-90" : "scale-100"}
          ${disabled ? "border-gray-500" : ""}
          ${checkboxClassName}
        `}
      >
        {isChecked && (
          <svg
            className={`w-3 h-3 text-white transition-transform duration-200 ${isAnimating ? "scale-125" : "scale-100"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex items-center justify-between w-full">
        <span
          className={`
          transition-all duration-200
          ${isChecked && showStrikeThrough ? "line-through text-gray-400" : ""}
          ${labelClassName}
          `}
        >
          {label}
        </span>
        <span
          className={`
          transition-all duration-200 text-sm text-gray-300
          ${isChecked && showStrikeThrough ? "line-through text-gray-400" : ""}
          ${labelClassName}
          `}
        >
          {new Date(taskDate).toLocaleDateString('en-US')}
        </span>
      </div>
    </label>
  );
}