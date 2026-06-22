import {
  Editor,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnNumberedList,
  BtnBulletList,
  EditorProvider,
  createButton,
  HtmlButton,
  useEditorState,
} from "react-simple-wysiwyg";
import React, { useState, useRef, useEffect } from "react";

const CustomDropdown = ({ title, items, value, onChange, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rsw-btn"
        style={{
          width: "100%",
          justifyContent: "space-between",
          padding: "0 6px",
        }}
      >
        <span>{title === "A" && value ? value.charAt(0) : value || title}</span>
        <span style={{ fontSize: "10px", opacity: 0.5, marginLeft: "2px" }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            background: "white",
            border: "1px solid #CBCFD2",
            borderRadius: "8px",
            marginTop: "4px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            zIndex: 100,
            minWidth: "120px",
            padding: "4px 0",
          }}
        >
          {items.map(([label, cmd, arg]) => (
            <div
              key={arg}
              onClick={() => {
                onChange(cmd, arg, label);
                setIsOpen(false);
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "13px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: value === label ? "#F6F6F7" : "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F6F6F7")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  value === label ? "#F6F6F7" : "transparent")
              }
            >
              <span
                style={{ fontFamily: cmd === "fontName" ? arg : "inherit" }}
              >
                {label}
              </span>
              {value === label && <span style={{ color: "#008060" }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomColorPicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rsw-btn"
        style={{ padding: "0 8px" }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            border: "1px dashed #CBCFD2",
            background: value || "transparent",
            position: "relative",
          }}
        >
          {!value && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#FFF",
              }}
            />
          )}
        </div>
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            background: "white",
            border: "1px solid #CBCFD2",
            borderRadius: "12px",
            marginTop: "4px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            zIndex: 100,
            padding: "12px",
            width: "220px",
          }}
        >
          <div
            style={{
              height: "120px",
              background:
                "linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent), #f00",
              borderRadius: "8px",
              marginBottom: "12px",
              position: "relative",
              cursor: "crosshair",
            }}
            onClick={(e) => {
              onChange("#ff0000");
              setIsOpen(false);
            }}
          />
          <input
            type="range"
            min="0"
            max="360"
            style={{ width: "100%", marginBottom: "12px", cursor: "pointer" }}
            onChange={(e) => {
              const hue = e.target.value;
              onChange(`hsl(${hue}, 100%, 50%)`);
            }}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              "#000000",
              "#ffffff",
              "#ff0000",
              "#00ff00",
              "#0000ff",
              "#ffff00",
              "#ff00ff",
              "#00ffff",
            ].map((c) => (
              <div
                key={c}
                onClick={() => {
                  onChange(c);
                  setIsOpen(false);
                }}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  background: c,
                  border: "1px solid #eee",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const BtnCustomClear = createButton(
  "Clear formatting",
  <span style={{ fontSize: "14px", fontWeight: "400" }}>
    T<sub style={{ fontSize: "10px", bottom: "0" }}>x</sub>
  </span>,
  "removeFormat",
);

const EditorToolbar = ({ value, onChange }) => {
  const { $el } = useEditorState();
  const [currentFont, setCurrentFont] = useState("Arial");
  const [currentSize, setCurrentSize] = useState("18px");
  const [currentColor, setCurrentColor] = useState("");

  const handleCommand = (cmd, arg, label) => {
    if ($el) {
      $el.focus();
      document.execCommand(cmd, false, arg);
      if (cmd === "fontName") setCurrentFont(label);
      if (cmd === "fontSize") setCurrentSize(label);
      if (cmd === "foreColor") setCurrentColor(arg);
    }
  };

  return (
    <Toolbar>
      <BtnBold />
      <BtnItalic />
      <BtnUnderline />
      <div className="rsw-separator" />
      <BtnNumberedList />
      <BtnBulletList />
      <div className="rsw-separator" />
      <CustomDropdown
        title="A"
        value={currentFont}
        items={[
          ["Arial", "fontName", "Arial"],
          ["Fira Sans", "fontName", "Fira Sans"],
          ["Poppins", "fontName", "Poppins"],
          ["Inter", "fontName", "Inter"],
        ]}
        onChange={handleCommand}
        style={{ width: "40px" }}
      />
      <CustomColorPicker
        value={currentColor}
        onChange={(color) => handleCommand("foreColor", color)}
      />
      <CustomDropdown
        title="18"
        value={currentSize}
        items={[
          ["10px", "fontSize", "1"],
          ["13px", "fontSize", "2"],
          ["16px", "fontSize", "3"],
          ["18px", "fontSize", "4"],
          ["24px", "fontSize", "5"],
          ["32px", "fontSize", "6"],
          ["48px", "fontSize", "7"],
        ]}
        onChange={handleCommand}
        style={{ width: "55px" }}
      />
      <BtnCustomClear />
    </Toolbar>
  );
};

export const RichTextEditor = ({ label, value, onChange }) => (
  <div style={{ marginBottom: "16px" }}>
    <style>{`
      .rsw-editor {
        border: 1px solid #CBCFD2 !important;
        border-radius: 8px !important;
        overflow: visible !important;
        background: white !important;
      }
      .rsw-toolbar {
        display: flex !important;
        align-items: center !important;
        padding: 4px 6px !important;
        border-bottom: 1px solid #CBCFD2 !important;
        background: #F6F6F7 !important;
        gap: 0px !important;
        overflow: visible !important;
      }
      .rsw-btn {
        background: transparent !important;
        border: none !important;
        cursor: pointer !important;
        padding: 0 6px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: #202223 !important;
        font-size: 14px !important;
        font-weight: 700 !important;
        width: auto !important;
        height: 32px !important;
        border-radius: 4px !important;
        transition: background 0.1s !important;
        outline: none !important;
      }
      .rsw-btn:hover {
        background: #E1E3E5 !important;
      }
      .rsw-btn[data-active="true"] {
        background: #E1E3E5 !important;
      }
      .rsw-ce {
        background: #E1E3E5 !important;
        color: #202223 !important;
        min-height: 120px !important;
        padding: 16px !important;
        outline: none !important;
        font-size: 16px !important;
        line-height: 1.5 !important;
      }
      .rsw-ce font[size="1"] { font-size: 10px !important; }
      .rsw-ce font[size="2"] { font-size: 13px !important; }
      .rsw-ce font[size="3"] { font-size: 16px !important; }
      .rsw-ce font[size="4"] { font-size: 18px !important; }
      .rsw-ce font[size="5"] { font-size: 24px !important; }
      .rsw-ce font[size="6"] { font-size: 32px !important; }
      .rsw-ce font[size="7"] { font-size: 48px !important; }
      
      .rsw-separator {
        width: 1px !important;
        height: 20px !important;
        background: #CBCFD2 !important;
        margin: 0 4px !important;
      }
    `}</style>
    {label && (
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: "600",
          marginBottom: "12px",
        }}
      >
        {label}
      </label>
    )}
    <EditorProvider>
      <Editor value={value} onChange={(e) => onChange(e.target.value)}>
        <EditorToolbar />
      </Editor>
    </EditorProvider>
  </div>
);
