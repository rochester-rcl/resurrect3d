import React from "react";

const ThreeAnnotationReadOnlyBody = (props) => {
  const { visible, text, className, innerRef } = props;
  const display = text.length > 0 ? "flex" : "none";
  const cName = `annotation-body-read-only ${className ? className : ""} ${
    visible ? "show" : "hide"
  }`;
  return (
    <div ref={innerRef} style={{ display: display }} className={cName}>
      <div className="text-area-read-only">{text}</div>
    </div>
  );
};

export default ThreeAnnotationReadOnlyBody;
