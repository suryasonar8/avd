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
    width: "18px",
    height: "18px",
    border: "2px solid #8c9196",
    borderRadius: "50%",
    margin: 0,
    cursor: "pointer",
    flexShrink: 0,
    position: "relative",
    backgroundColor: "#fff",
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
          borderColor: selected ? "#303030" : "#8c9196",
          backgroundColor: selected ? "#303030" : "#fff",
          boxShadow: selected ? "inset 0 0 0 3px #fff" : "none",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
        }}
      />
      {label}
    </label>
  );
}
