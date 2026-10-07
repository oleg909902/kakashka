import { PaintStyle, Skia, StrokeCap } from '@shopify/react-native-skia';

export function fill(color: string, alpha = 1) {
  'worklet';
  const p = Skia.Paint();
  p.setAntiAlias(true);
  p.setColor(Skia.Color(color));
  p.setAlphaf(alpha);
  return p;
}

export function stroke(color: string, width: number) {
  'worklet';
  const p = fill(color);
  p.setStyle(PaintStyle.Stroke);
  p.setStrokeWidth(width);
  p.setStrokeCap(StrokeCap.Round);
  return p;
}
