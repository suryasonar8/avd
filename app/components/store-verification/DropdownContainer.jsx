import { useState, useEffect, useRef } from "react";

export default function DropdownContainer({ children, onClick }) {
  const [position, setPosition] = useState({
    top: "100%",
    bottom: "auto",
    marginTop: "6px",
    marginBottom: 0,
  });
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        setPosition({
          top: "auto",
          bottom: "100%",
          marginTop: 0,
          marginBottom: "6px",
        });
      }
    }
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: 0,
        background: "#FFFFFF",
        border: "1px solid #E1E3E5",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 9999,
        padding: "8px 0",
        minWidth: "180px",
        ...position,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
