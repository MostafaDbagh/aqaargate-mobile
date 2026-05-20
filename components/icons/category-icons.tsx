/**
 * Property-category SVG icons. Geometry sourced from the web's icomoon set
 * and reduced to single-path glyphs that look right on mobile at 24-32px.
 * Map keys MUST match the backend category `name` values exactly.
 */
import Svg, { Path } from 'react-native-svg';

type Props = { size?: number; color?: string };

function Building({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 10h4a1 1 0 0 1 1 1v10M9 8h2M9 12h2M9 16h2M19 14h0M19 18h0M2 21h20"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Apartment({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 21V8l9-5 9 5v13M9 21v-6h6v6M8 11h.01M12 11h.01M16 11h.01M2 21h20"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Villa({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10 12 3l9 7v11H3z M9 21v-6h6v6 M8 13h.01M16 13h.01"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Office({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 21V7l8-4 10 4v14M3 21h18M8 9h.01M14 9h.01M8 13h.01M14 13h.01M10 21v-4h4v4"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Commercial({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7h18l-1 5H4zM5 12v8h14v-8M10 20v-4h4v4M3 7l2-3h14l2 3"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Land({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 18s3-7 9-7 9 7 9 7M3 21h18M8 14l2-3M14 11l3 3"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HolidayHome({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2v3M12 22v-2M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M5 19l3-9 4 11 4-11 3 9"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Chalet({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 21 12 4l9 17H3z M8 21l4-7 4 7"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HomeFallback({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 11 12 3l9 8v10H3zM9 21v-6h6v6"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const ICONS: Record<string, React.ComponentType<Props>> = {
  Apartment,
  'Villa/Farms': Villa,
  Villa,
  Building,
  Office,
  Commercial,
  Land,
  'Holiday Home': HolidayHome,
  Chalet,
};

export function CategoryIcon({
  name,
  size = 28,
  color = '#f1913d',
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const Cmp = ICONS[name] ?? HomeFallback;
  return <Cmp size={size} color={color} />;
}
