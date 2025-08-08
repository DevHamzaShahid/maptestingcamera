import React from 'react';
import Svg, { G, Path, Circle, Polygon } from 'react-native-svg';
import { View } from 'react-native';

interface FOVConeProps {
  heading: number; // degrees
  size?: number;
  color?: string;
}

const FOVCone: React.FC<FOVConeProps> = ({ heading, size = 60, color = '#4285F4' }) => {
  // Cone is a sector of a circle (e.g., 60 deg wide)
  const coneAngle = 60; // degrees
  const radius = size;
  const center = size;
  const startAngle = -coneAngle / 2;
  const endAngle = coneAngle / 2;
  // Convert to radians
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;
  // Arc points
  const x1 = center + radius * Math.cos(startRad);
  const y1 = center + radius * Math.sin(startRad);
  const x2 = center + radius * Math.cos(endRad);
  const y2 = center + radius * Math.sin(endRad);
  // Large arc flag
  const largeArcFlag = coneAngle > 180 ? 1 : 0;
  // Path for cone sector
  const d = [
    `M ${center} ${center}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    'Z',
  ].join(' ');

  // Arrow (triangle) at tip
  const arrowLength = size * 0.7;
  const arrowWidth = size * 0.25;
  const arrowPoints = [
    `${center},${center - arrowLength}`, // tip
    `${center - arrowWidth / 2},${center - arrowLength * 0.6}`,
    `${center + arrowWidth / 2},${center - arrowLength * 0.6}`,
  ].join(' ');

  return (
    <View style={{ width: size * 2, height: size * 2, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size * 2}
        height={size * 2}
        style={{ transform: [{ rotate: `${heading}deg` }] }}
      >
        {/* Cone */}
        <Path d={d} fill={color} fillOpacity={0.25} />
        {/* Arrow */}
        <Polygon points={arrowPoints} fill={color} />
        {/* Center dot */}
        <Circle cx={center} cy={center} r={size * 0.18} fill="#fff" stroke={color} strokeWidth={2} />
      </Svg>
    </View>
  );
};

export default FOVCone;