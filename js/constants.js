const TILE_SIZE = 32;
const GRID_WIDTH = 30;
const GRID_HEIGHT = 18;
const MAX_LIGHT_DISTANCE = 20;
const DEFAULT_BULB_COLOR = '#ffd966';

const BLOCK_TYPES = {
  platform: 'platform',
  start: 'start',
  button: 'button',
  pressure: 'pressure',
  spike: 'spike',
  lava: 'lava',
  lightbulb: 'lightbulb',
  ladder: 'ladder',
  torch: 'torch',
  moving: 'moving',
  rotating: 'rotating',
  erase: 'erase'
};

const BLOCK_LABELS = {
  platform: 'Platform',
  start: 'Start',
  button: 'Button',
  pressure: 'Pressure Plate',
  spike: 'Spike',
  lava: 'Lava',
  lightbulb: 'Light Bulb',
  ladder: 'Ladder',
  torch: 'Torch',
  moving: 'Moving Block',
  rotating: 'Rotating Block',
  erase: 'Erase'
};
