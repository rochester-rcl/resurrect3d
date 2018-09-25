/* @flow */

// React
import React, { Component } from "react";

// semantic-ui-react
import { Accordion, Button, Icon } from "semantic-ui-react";
export default class ThreeTools extends Component {
  state: Object = { activeIndex: -1, menuExpanded: false };
  constructor(props: Object) {
    super(props);
    (this: any).selectTool = this.selectTool.bind(this);
    (this: any).expandMenu = this.expandMenu.bind(this);
  }

  selectTool(index: Number): void {
    if (this.state.activeIndex === index) {
      this.setState({ activeIndex: -1 });
    } else {
      this.setState({ activeIndex: index });
    }
  }

  expandMenu(callback: any): void {
    this.setState(
      {
        menuExpanded: !this.state.menuExpanded
      },
      () => {
        if (callback) callback(this.state.menuExpanded);
      }
    );
  }

  render() {
    const { activeIndex, menuExpanded } = this.state;
    const { tools } = this.props;
    let menuClass = "three-tool-menu";
    let dropdownClass = "three-tool-menu-dropdown";
    return (
      <div className={(menuClass += menuExpanded ? " expanded" : " collapsed")}>
        <Accordion
          className={
            (dropdownClass += menuExpanded ? " expanded" : " collapsed")
          }
          inverted
        >
          {tools.map((group, index) => (
            <div key={index} className="three-tool-container">
              <Accordion.Title
                active={activeIndex === index}
                key={index}
                onClick={() => this.selectTool(index)}
              >
                <h3>
                  <Icon name="dropdown" />
                  {group.group}
                </h3>
              </Accordion.Title>
              <Accordion.Content active={activeIndex === index}>
                {group.components.map((tool, index) => (
                  <div className="three-tool" key={index}>
                    {tool.component}
                  </div>
                ))}
              </Accordion.Content>
            </div>
          ))}
        </Accordion>
      </div>
    );
  }
}
