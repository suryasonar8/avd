export const NumberInput = ({
  label,
  value,
  onChange,
  badge,
  suffix = "px",
  disabled,
}) => (
  <div style={{ opacity: disabled ? 0.6 : 1 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
      }}
    >
      <s-text variant="bodyMd" as="label" style={{ fontWeight: "600" }}>
        {label}
      </s-text>
      {badge}
    </div>
    <div style={{ maxWidth: "240px" }}>
      <s-text-field
        type="number"
        value={(value ?? "").toString()}
        disabled={disabled}
        suffix={suffix}
        onChange={(e) => onChange(parseInt(e.currentTarget.value) || 0)}
      />
    </div>
  </div>
);
