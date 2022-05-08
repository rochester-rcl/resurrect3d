# Matan Kotler-Berkowitz Spring 2022 Handoff Document

This document describes the changes to Ressurect3D made by Matan Kotler-Berkowitz during the Spring of 2022. For questions, please contact mkotlerb@u.rochester.edu.

## Changelog

- Fixed minor server issues
- Fixed WebXR polyfill configuration and 3D rendering bug
- Added control panel (limited functionality, with framework to add port more functionality from desktop view)
- Added gaze tracking to select buttons on the control panel
- Added hand controls:
    - Right hand in fist rotates the model around the x- and y-axis, and changes zoom
    - Left hand in fist rotates the model around the z-axis
    - Right hand in pointer changes where the colored light is pointing (the light comes from the fingertip)
    - Left hand in “O” shape (hold for a second) resets model position and zoom
    - Left hand in “C” shape (hold for a second) switches between color picker and regular view
- Added color picker, used for light:
    - Select the color by pointing right hand on the color wheel
    - Select brightness by bringing right hand closer or further from viewer
    - Square next to the color wheel previews currently selected color

## New & Updated Methods

### General

- `prepareSceneForVR`: this function prepares hand controls, spotlight, interaction manager, and other necessary setup.
- `update`: run every loop. While in VR, runs Handy update loop, and update functions for gaze and hand tracking

### Control Panel

- `renderVrControls`, which constructs the control box, then renders each control inside the control box. If the state is set to show vr controls, it then makes it visible on the screen
- `renderVrToolsPanel`, which renders and displays the control box mesh.
- `clearVrControls`, which clears the vr control panel and all buttons inside. It also de-registers each button from the interaction manager.
- `renderVrControl`, which takes parameters about the specific control and renders a button based on those specifications.
    - `generateVrButtonMaterial` and `setButtonHighlight`, both helpers for `renderVrControl`.

### Cardboard Pointer Tracking

- `updateCursor` function, which adds gaze tracking (commonly used by Google Cardboard devices). The function creates a simulated ray from the user’s head, in the direction the user is looking, and then selects the button in the control panel which the user is currently looking at.

### Hand Controls

- `setupHands`: this creates and renders the hand models and registers them with Handy (the pose-detection library).
- `updateHand`: contains the majority of the hand control logic. This detects the hands’ current poses, the hands’ positions, and the current VR mode, and acts accordingly. It contains the logic to rotate the model, zoom the model, reset the model, switch modes (viewer or color-picker), select a color, and change where the hand-light is pointing.