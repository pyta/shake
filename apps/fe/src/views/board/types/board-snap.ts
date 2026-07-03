export interface BoardSnapViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface BoardSnapNodePosition {
  x: number;
  y: number;
  toAdjusted?: boolean;
}

export interface BoardSnap {
  viewport?: BoardSnapViewport;
  nodes?: Record<string, BoardSnapNodePosition>;
}

export function parseBoardSnap(raw: unknown): BoardSnap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  return raw as BoardSnap;
}

export function defaultNodePosition(index: number): BoardSnapNodePosition {
  return {
    x: 80 + (index % 4) * 240,
    y: 80 + Math.floor(index / 4) * 160,
  };
}
