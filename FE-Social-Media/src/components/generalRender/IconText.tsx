import React from "react";

const IconText = ({ icon, text, styleIcon }) => (
  <span
    style={{ display: "flex", alignItems: "center", gap: "4px", ...styleIcon }}
  >
    {React.createElement(icon)}
    <span>{text}</span>
  </span>
);

export default IconText;
