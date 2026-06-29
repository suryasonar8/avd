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
