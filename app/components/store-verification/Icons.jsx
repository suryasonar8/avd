export const RadioIcon = ({ checked }) =>
  checked ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r="6" stroke="#202223" strokeWidth="4" fill="#fff" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r="7.5" stroke="#C9CCCF" fill="#fff" />
    </svg>
  );

export const SearchButtonIcon = () => (
  <svg
    width="20"
    height="20"
    style={{ flexShrink: 0 }}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 3a5 5 0 100 10 5 5 0 000-10zM1.5 8a6.5 6.5 0 1111.966 3.864l4.238 4.238a1 1 0 01-1.414 1.414l-4.238-4.238A6.5 6.5 0 011.5 8z"
      fill="#4B4E50"
    />
  </svg>
);

export const FilterButtonIcon = () => (
  <svg
    width="20"
    height="20"
    style={{ flexShrink: 0 }}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 6h4v1.5h-4V6zm-2 9h6v1.5h-6V15zM13 10.5h5V12h-5v-1.5z"
      fill="#4B4E50"
    />
  </svg>
);

export const TrashIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
      fill="currentColor"
    />
  </svg>
);

export const SearchInputIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 3a5 5 0 100 10 5 5 0 000-10zM1.5 8a6.5 6.5 0 1111.966 3.864l4.238 4.238a1 1 0 01-1.414 1.414l-4.238-4.238A6.5 6.5 0 011.5 8z"
      fill="#6D7175"
    />
  </svg>
);

export const PlusIcon = (props) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "inline-block", verticalAlign: "middle", ...props.style }}
    {...props}
  >
    <path
      d="M6 2v8M2 6h8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const AppEmbedIcon = (props) => (
  <svg
    viewBox="0 0 20 20"
    width="20"
    height="20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M12.5 3a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.207l-4.146 4.147a.5.5 0 0 1-.708-.708L15.793 3.5H13a.5.5 0 0 1-.5-.5Zm-10 2A1.5 1.5 0 0 1 4 3.5h3A1.5 1.5 0 0 1 8.5 5v3A1.5 1.5 0 0 1 7 9.5H4A1.5 1.5 0 0 1 2.5 8V5Zm1.5 0v3h3V5H4ZM2.5 12A1.5 1.5 0 0 1 4 10.5h3A1.5 1.5 0 0 1 8.5 12v3A1.5 1.5 0 0 1 7 16.5H4A1.5 1.5 0 0 1 2.5 15v-3Zm1.5 0v3h3v-3H4Zm7.5-1.5A1.5 1.5 0 0 0 10.5 12v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5h-3Zm1.5 1.5v3h3v-3h-3Z"
    />
  </svg>
);

export const AppsIcon = (props) => (
  <svg
    viewBox="0 0 20 20"
    width="20"
    height="20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M2.5 5A1.5 1.5 0 0 1 4 3.5h3A1.5 1.5 0 0 1 8.5 5v3A1.5 1.5 0 0 1 7 9.5H4A1.5 1.5 0 0 1 2.5 8V5Zm1.5 0v3h3V5H4Zm7.5-1.5A1.5 1.5 0 0 0 10.5 5v3A1.5 1.5 0 0 0 12 9.5h3A1.5 1.5 0 0 0 16.5 8V5A1.5 1.5 0 0 0 15 3.5h-3Zm1.5 1.5v3h3V5h-3ZM2.5 12A1.5 1.5 0 0 1 4 10.5h3A1.5 1.5 0 0 1 8.5 12v3A1.5 1.5 0 0 1 7 16.5H4A1.5 1.5 0 0 1 2.5 15v-3Zm1.5 0v3h3v-3H4Zm7.5-1.5A1.5 1.5 0 0 0 10.5 12v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5h-3Zm1.5 1.5v3h3v-3h-3Z"
    />
  </svg>
);
