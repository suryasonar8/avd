/* eslint-disable react/prop-types */

const radioStyles = {
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "13px",
    lineHeight: "20px",
    padding: "4px 0",
    color: "#1a1a1a",
  },
  labelDisabled: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    lineHeight: "20px",
    padding: "4px 0",
    color: "#8c9196",
    cursor: "not-allowed",
  },
  input: {
    appearance: "none",
    WebkitAppearance: "none",
    width: "16px",
    height: "16px",
    border: "1px solid #8c9196",
    borderRadius: "50%",
    margin: 0,
    cursor: "pointer",
    flexShrink: 0,
    position: "relative",
    backgroundColor: "#fff",
    boxSizing: "border-box",
  },
};

export function RadioOption({ label, name = "radio-group", value, selected, disabled, onChange }) {
  return (
    <label style={disabled ? radioStyles.labelDisabled : radioStyles.label}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        disabled={disabled}
        onChange={() => onChange(value)}
        style={{
          ...radioStyles.input,
          border: selected ? "5px solid #303030" : "1px solid #8c9196",
          backgroundColor: "#fff",
          boxShadow: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
        }}
      />
      {label}
    </label>
  );
}
