import {
  Editor,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnNumberedList,
  BtnBulletList,
  Separator,
  EditorProvider,
  useEditorState,
} from "react-simple-wysiwyg";
import { useState, useRef, useEffect } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { Badge } from "./Badge";
import { usePlan } from "../context/PlanContext";
import { useNavigate } from "react-router";

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
};

const PlanBadge = ({ show, plan }) => {
  if (!show) return null;
  const isPremium = plan === "premium";
  const text = isPremium ? "Premium plan or higher" : "Basic plan or higher";

  return (
    <div
      style={{
        position: "absolute",
        bottom: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        paddingBottom: "6px",
        zIndex: 100,
        display: "flex",
      }}
    >
      <div
        style={{
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          borderRadius: "20px",
        }}
      >
        <Badge text={text} type={plan} />
      </div>
    </div>
  );
};

const FontFamilyPicker = ({ locked }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const { $el } = useEditorState();
  const [currentFont, setCurrentFont] = useState("Arial");
  const containerRef = useRef(null);
  const navigate = useNavigate();
  useClickOutside(containerRef, () => setIsOpen(false));

  const fonts = ["Arial", "Fira Sans", "Poppins", "Inter"];

  const apply = (font) => {
    setCurrentFont(font);
    if ($el) {
      $el.focus();
      document.execCommand("fontName", false, font);
    }
    setIsOpen(false);
  };

  const handleClick = (e) => {
    if (locked) {
      e.preventDefault();
      navigate("/pricing");
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative" }}
      onMouseEnter={() => locked && setShowBadge(true)}
      onMouseLeave={() => locked && setShowBadge(false)}
    >
      <PlanBadge show={showBadge} plan="premium" />
      <button
        type="button"
        className="rsw-btn"
        title="Font family"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleClick}
        style={{ padding: "0 6px", gap: "2px", opacity: locked ? 0.6 : 1 }}
      >
        <span>A</span>
        <span style={{ fontSize: "8px", opacity: 0.5 }}>▼</span>
      </button>
      {isOpen && (
        <div className="rsw-popup">
          {fonts.map((font) => (
            <div
              key={font}
              className={`rsw-popup-item${currentFont === font ? " active" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => apply(font)}
              style={{ fontFamily: font }}
            >
              <span>{font}</span>
              {currentFont === font && (
                <span style={{ color: "#008060" }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ColorPickerButton = ({ locked }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [color, setColor] = useState("#000000");
  const { $el } = useEditorState();
  const containerRef = useRef(null);
  const [savedSelection, setSavedSelection] = useState(null);
  const navigate = useNavigate();
  useClickOutside(containerRef, () => setIsOpen(false));

  const applyColor = (newColor) => {
    setColor(newColor);
    if ($el) {
      $el.focus();
      if (savedSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelection);
      }
      document.execCommand("foreColor", false, newColor);
    }
  };

  const toggleOpen = (e) => {
    if (locked) {
      e.preventDefault();
      navigate("/pricing");
      return;
    }
    if (!isOpen) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        setSavedSelection(sel.getRangeAt(0));
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative" }}
      onMouseEnter={() => locked && setShowBadge(true)}
      onMouseLeave={() => locked && setShowBadge(false)}
    >
      <PlanBadge show={showBadge} plan="basic" />
      <button
        type="button"
        className="rsw-btn"
        title="Text color"
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggleOpen}
        style={{ padding: "0 8px", opacity: locked ? 0.6 : 1 }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            border: "1px dashed #CBCFD2",
            background: color || "transparent",
          }}
        />
      </button>
      {isOpen && (
        <div
          className="rsw-popup"
          style={{
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            minWidth: "auto",
          }}
        >
          <HexColorPicker color={color} onChange={applyColor} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{ fontSize: "12px", color: "#6D7175", fontWeight: 500 }}
            >
              HEX
            </span>
            <HexColorInput
              color={color}
              onChange={applyColor}
              prefixed
              style={{
                width: "100%",
                padding: "4px 8px",
                border: "1px solid #CBCFD2",
                borderRadius: "6px",
                fontSize: "13px",
                fontFamily: "monospace",
                outline: "none",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const FontSizePicker = ({ locked }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const { $el } = useEditorState();
  const [currentSize, setCurrentSize] = useState("16");
  const containerRef = useRef(null);
  const navigate = useNavigate();
  useClickOutside(containerRef, () => setIsOpen(false));

  const sizes = [
    ["10", "1"],
    ["13", "2"],
    ["16", "3"],
    ["18", "4"],
    ["24", "5"],
    ["32", "6"],
    ["48", "7"],
  ];

  const apply = (label, arg) => {
    setCurrentSize(label);
    if ($el) {
      $el.focus();
      document.execCommand("fontSize", false, arg);
    }
    setIsOpen(false);
  };

  const handleClick = (e) => {
    if (locked) {
      e.preventDefault();
      navigate("/pricing");
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative" }}
      onMouseEnter={() => locked && setShowBadge(true)}
      onMouseLeave={() => locked && setShowBadge(false)}
    >
      <PlanBadge show={showBadge} plan="basic" />
      <button
        type="button"
        className="rsw-btn"
        title="Font size"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleClick}
        style={{ padding: "0 6px", gap: "2px", opacity: locked ? 0.6 : 1 }}
      >
        <span>{currentSize}</span>
        <span style={{ fontSize: "8px", opacity: 0.5 }}>▼</span>
      </button>
      {isOpen && (
        <div className="rsw-popup">
          {sizes.map(([label, arg]) => (
            <div
              key={arg}
              className={`rsw-popup-item${currentSize === label ? " active" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => apply(label, arg)}
            >
              <span>{label}px</span>
              {currentSize === label && (
                <span style={{ color: "#008060" }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BtnClearFormat = () => {
  const { $el } = useEditorState();

  return (
    <button
      type="button"
      className="rsw-btn"
      title="Clear formatting"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        if ($el) {
          $el.focus();
          document.execCommand("removeFormat");
        }
      }}
    >
      <span style={{ fontSize: "14px", fontWeight: "400" }}>
        T<sub style={{ fontSize: "10px", bottom: "0" }}>x</sub>
      </span>
    </button>
  );
};

const EditorToolbar = () => {
  const { plan } = usePlan();
  const currentPlan = (plan || "FREE").toLowerCase();

  const basicLocked = currentPlan === "free";
  const premiumLocked = currentPlan === "free" || currentPlan === "basic";

  return (
    <Toolbar>
      <BtnBold />
      <BtnItalic />
      <BtnUnderline />
      <Separator />
      <BtnNumberedList />
      <BtnBulletList />
      <Separator />
      <FontFamilyPicker locked={premiumLocked} />
      <ColorPickerButton locked={basicLocked} />
      <FontSizePicker locked={basicLocked} />
      <BtnClearFormat />
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

      /* ── Shared popup styles ── */
      .rsw-popup {
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border: 1px solid #CBCFD2;
        border-radius: 8px;
        margin-top: 4px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        z-index: 100;
        min-width: 120px;
        padding: 4px 0;
      }
      .rsw-popup-item {
        padding: 8px 12px;
        cursor: pointer;
        font-size: 13px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .rsw-popup-item:hover,
      .rsw-popup-item.active {
        background: #F6F6F7;
      }

      /* ── Color picker size ── */
      .rsw-popup .react-colorful {
        width: 200px !important;
        height: 160px !important;
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
