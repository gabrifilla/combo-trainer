# Combo Rhythm Trainer

A Vue 3 rhythm-game inspired combo trainer for practicing generic fighting-game inputs with timed visual commands, keyboard/gamepad validation, and real-time accuracy feedback.

## Run locally

```bash
npm install
npm run dev
```

## Controls

- Arrow keys: direction
- Z: button 1
- X: button 2
- C: button 3
- V: button 4
- Gamepad D-pad or left stick: direction
- Gamepad face buttons 0-3: buttons 1-4

Use the Controls panel in training mode to remap each command to a keyboard key or gamepad button. The left stick always remains available for directions.
Use the P1/P2 toggle in the same panel to choose which side the combo should be interpreted from; P2 flips forward/back.
Press Select/Back/View or Start/Menu on a connected gamepad to restart the current combo.

The MVP uses P1 side mapping, so Right is forward and Left is back.
