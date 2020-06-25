import React from "react";
import { Transition } from "semantic-ui-react";

const ThreeAnnotationReadOnlyBody = (props) => {
  const { visible, text, className, innerRef } = props;
  const cName = `annotation-body-read-only ${className ? className : ""}`;
  return (
    <Transition duration={500} visible={visible} mountOnShow={false}>
      {text.length > 0 ? (
        <div ref={innerRef} className={cName}>
          <div className="text-area-read-only">{text}</div>
        </div>
      ) : (
        <div></div>
      )}
    </Transition>
  );
};

export default ThreeAnnotationReadOnlyBody;
