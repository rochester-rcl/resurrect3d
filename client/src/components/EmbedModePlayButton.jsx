import React, { Component } from "react";
import { Button, Image } from "semantic-ui-react";

export default function EmbedModePlayButton(props) {
  const { thumbnail, message, onClick } = props;
  return (
    <div className="embed-mode-play-button-container">
      {thumbnail ? (
        <Image
          className="embed-mode-play-button-background"
          src={thumbnail}
          fluid
        />
      ) : null}
      <Button
        className="embed-mode-play-button"
        color="green"
        onClick={onClick}
        content={message}
        icon="play"
        size="massive"
        labelPosition="left"
      />
    </div>
  );
}
