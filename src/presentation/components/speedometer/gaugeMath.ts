export interface Point {
  x: number;
  y: number;
}

export function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): Point {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.sin(angleInRadians),
    y: centerY - radius * Math.cos(angleInRadians),
  };
}

export function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", end.x, end.y, "A", radius, radius, 0, arcSweep, 1, start.x, start.y].join(" ");
}

export interface SpeedTick {
  value: number;
  isMajor: boolean;
  isActive: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lx: number;
  ly: number;
}

export function generateSpeedTicks(maxSpeed: number, currentSpeed: number, hasReading: boolean): SpeedTick[] {
  const totalSteps = 20;
  const result: SpeedTick[] = [];
  for (let i = 0; i <= totalSteps; i++) {
    const fraction = i / totalSteps;
    const value = Math.round(maxSpeed * fraction);
    const angleDeg = -135 + fraction * 270;
    const isMajor = i % 2 === 0;

    const r1 = isMajor ? 104 : 110;
    const r2 = 114;
    const p1 = polarToCartesian(150, 150, r1, angleDeg);
    const p2 = polarToCartesian(150, 150, r2, angleDeg);

    const labelPos = polarToCartesian(150, 150, 92, angleDeg);
    const isActive = hasReading && value <= currentSpeed;

    result.push({
      value,
      isMajor,
      isActive,
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      lx: labelPos.x,
      ly: labelPos.y,
    });
  }
  return result;
}
