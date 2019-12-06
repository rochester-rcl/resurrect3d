import React from "react";

const ThreeAnnotationReadOnlyBody = props => {
  const { visible, text, innerRef } = props;
  const display = text.length > 0 ? "flex" : "none";
  if (visible) {
    return (
      <div
        ref={innerRef}
        style={{ display: display }}
        className="annotation-body-read-only"
      >
        <div className="text-area-read-only">{text}</div>
      </div>
    );
  } else {
    return <div style={{ display: "none" }}></div>;
  }
};

export default ThreeAnnotationReadOnlyBody;
