import React, { useMemo } from 'react';
import { Canvas, DiffRect, Path, Skia, rect, rrect } from '@shopify/react-native-skia';

const cornerRadius = 24;
const cornerLength = 30;

interface OverlayProps {
  cameraWidth: number;
  cameraHeight: number;
}

export const Overlay = ({ cameraWidth, cameraHeight }: OverlayProps) => {
  const { outer, inner, cornerPath } = useMemo(() => {
    if (!cameraWidth || !cameraHeight) return { outer: null, inner: null, cornerPath: null };

    const innerDimension = Math.min(cameraWidth * 0.787, 266);
    const innerX = cameraWidth / 2 - innerDimension / 2;
    const innerY = cameraHeight / 2 - innerDimension / 2 - cameraHeight * 0.1;
    const x2 = innerX + innerDimension;
    const y2 = innerY + innerDimension;

    const _outer = rrect(rect(0, 0, cameraWidth, cameraHeight), 0, 0);
    const _inner = rrect(
      rect(innerX, innerY, innerDimension, innerDimension),
      cornerRadius,
      cornerRadius,
    );

    const path = Skia.Path.Make();

    // top-left
    path.moveTo(innerX, innerY + cornerLength);
    path.lineTo(innerX, innerY + cornerRadius);
    path.arcToTangent(innerX, innerY, innerX + cornerRadius, innerY, cornerRadius);
    path.lineTo(innerX + cornerLength, innerY);

    // top-right
    path.moveTo(x2 - cornerLength, innerY);
    path.lineTo(x2 - cornerRadius, innerY);
    path.arcToTangent(x2, innerY, x2, innerY + cornerRadius, cornerRadius);
    path.lineTo(x2, innerY + cornerLength);

    // bottom-left
    path.moveTo(innerX, y2 - cornerLength);
    path.lineTo(innerX, y2 - cornerRadius);
    path.arcToTangent(innerX, y2, innerX + cornerRadius, y2, cornerRadius);
    path.lineTo(innerX + cornerLength, y2);

    // bottom-right
    path.moveTo(x2 - cornerLength, y2);
    path.lineTo(x2 - cornerRadius, y2);
    path.arcToTangent(x2, y2, x2, y2 - cornerRadius, cornerRadius);
    path.lineTo(x2, y2 - cornerLength);

    return { outer: _outer, inner: _inner, cornerPath: path };
  }, [cameraWidth, cameraHeight]);

  if (!cameraWidth || !cameraHeight || !outer || !inner || !cornerPath) return null;

  return (
    <Canvas style={{ flex: 1 }}>
      <DiffRect inner={inner} outer={outer} color="black" opacity={0.5} />
      <Path
        path={cornerPath}
        color="white"
        style="stroke"
        strokeWidth={4}
        strokeCap="round"
        strokeJoin="round"
      />
    </Canvas>
  );
};
