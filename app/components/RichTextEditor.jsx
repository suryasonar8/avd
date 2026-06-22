import {
  Editor,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnNumberedList,
  BtnBulletList,
  BtnClearFormatting,
  EditorProvider,
} from "react-simple-wysiwyg";

export const RichTextEditor = ({ label, value, onChange }) => (
  <div style={{ marginBottom: "16px" }}>
    <style>{`
      .rsw-editor {
        border: 1px solid #CBCFD2 !important;
        border-radius: 8px !important;
        overflow: hidden !important;
        background: white !important;
      }
      .rsw-toolbar {
        display: flex !important;
        align-items: center !important;
        padding: 8px 12px !important;
        border-bottom: 1px solid #CBCFD2 !important;
        background: #FFF !important;
        gap: 12px !important;
      }
      .rsw-btn {
        background: transparent !important;
        border: none !important;
        cursor: pointer !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: #6D7175 !important;
        font-size: 14px !important;
        font-weight: 700 !important;
        width: auto !important;
        height: auto !important;
      }
      .rsw-ce {
        background: #000 !important;
        color: #FFF !important;
        min-height: 100px !important;
        padding: 12px !important;
        outline: none !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
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
        <Toolbar>
          <BtnBold />
          <BtnItalic />
          <BtnUnderline />
          <BtnNumberedList />
          <BtnBulletList />
          <BtnClearFormatting />
        </Toolbar>
      </Editor>
    </EditorProvider>
  </div>
);
