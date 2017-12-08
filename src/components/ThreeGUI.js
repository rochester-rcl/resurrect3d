/* @flow */
import React, { Component } from 'react';
// semantic-ui-react
import { Accordion, Button, Icon } from 'semantic-ui-react';

const e = React.createElement;

export default class ThreeGUI {
  components: Object;
  layouts: Object;
  constructor() {
    this.components = {};
    this.layouts = {};
  }

  registerLayout(name: string, layout: ThreeGUILayout ): void {
    this.layouts[name] = layout;
  }

  registerComponent(name: string, component: Component ): void {
    this.components[name] = component;
  }

  removeLayout(name: string): bool {
    if (this.layouts[name]) {
      delete this.layouts[name];
      return true;
    } else {
      return false;
    }
  }

  removeComponent(name: string): bool {
    if (this.components[name]) {
      delete this.components[name];
      return true;
    } else {
      return false;
    }
  }

  getComponent(name: string): Component | bool {
    if (this.components[name]) {
      return this.components[name];
    } else {
      return false;
    }
  }

  getLayout(name: string): ThreeGUILayout | bool {
    if (this.layouts[name]) {
      return this.layouts[name];
    } else {
      return false;
    }
  }
}

export class ThreeGUIGroup {
  name: string;
  components: Array<Object>;
  constructor(name: string) {
    this.name = name;
    this.components = [];
  }

  add(name: string, component: Component, componentProps: Object): void {
    this.components.push(
      {
        name: name,
        component: component,
        props: componentProps,
      }
    );
  }

  remove(name: string): bool {
    let index = this.components.findIndex((component) => {
      return component.title === name;
    });
    if (index > -1) {
      this.components.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }

  find(name: string): Object {
    let index = this.components.findIndex((component) => {
      return component.name === name;
    });
    if (index) {
      return this.components[index];
    } else {
      return false;
    }
  }

}

export class ThreeGUINestedGroup extends ThreeGUIGroup {
  groups: Array<ThreeGUIGroup>
  constructor(name: string) {
    super(name);
    this.groups = this.components;
  }

  add(group: ThreeGUIGroup) {
    this.components.push(group);
  }
}


// Flat Layout

export class ThreeGUILayout extends Component {
  state = {}
  constructor(props: Object) {
    super(props);
  }

  render() {
    const { group, className } = this.props;
    return(
      <div className={className}>
        group.map((element) => e(element.component, element.props, null));
      </div>
    );
  }
}

// Nested Layout w/ Collapsible Panel

export class ThreeGUIPanelLayout extends ThreeGUILayout {

  state: Object = { activeIndex: -1, menuExpanded: false }
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
    this.setState({
      menuExpanded: !this.state.menuExpanded,
    }, () => {
      if (callback) callback(this.state.menuExpanded);
    });
  }

  render() {
    const { activeIndex, menuExpanded } = this.state;
    let { menuClass, dropdownClass, elementClass, groupClass, groups } = this.props;

    return(
      <div className={menuClass += menuExpanded ? " expanded" : " collapsed"}>
        <Accordion className={dropdownClass += menuExpanded ? " expanded" : " collapsed"} inverted>
          {groups.map((group, index) =>
            <div key={index} className={groupClass}>
            <Accordion.Title active={activeIndex === index} key={index} onClick={() => this.selectTool(index)}>
              <h3><Icon name="dropdown" />{group.name}</h3>
            </Accordion.Title>
            <Accordion.Content active={activeIndex === index}>
              {group.components.map((tool, index) =>
                <div className={elementClass} key={index}>
                  {e(tool.component, tool.props, null)}
                </div>)}
            </Accordion.Content>
          </div>
          )}
        </Accordion>
      </div>
    );
  }
}
