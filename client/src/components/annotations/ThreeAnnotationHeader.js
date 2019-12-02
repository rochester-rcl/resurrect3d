import React from "react";

const ThreeAnnotationHeader = props => {
  const handleChange = event => {
    props.callback(event.target.data);
  };
  return (
    <div className="annotation-header">
      <textarea
        type="text"
        defaultValue={props.text}
        onChange={handleChange}
        className="text-area"
      />
    </div>
  );
};

export default ThreeAnnotationHeader;
