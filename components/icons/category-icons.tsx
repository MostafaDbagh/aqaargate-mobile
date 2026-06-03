/**
 * Property-category icons — ported VERBATIM from web's
 * components/common/Categories.jsx (the detailed filled SVGs marked
 * "provided by user") plus filled equivalents for the icomoon glyphs
 * (Building / Office / Land / Holiday Home) the web loads from its
 * font file.
 *
 * Map keys MUST match the backend category `name` values exactly.
 */
import Svg, { G, Path } from 'react-native-svg';

type Props = { size?: number; color?: string };

function Apartment({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <G transform="translate(1 1)">
        <Path d="M502.467,493.933H459.8V50.2h17.067c5.12,0,8.533-3.413,8.533-8.533V7.533c0-5.12-3.413-8.533-8.533-8.533H33.133 C28.013-1,24.6,2.413,24.6,7.533v34.133c0,5.12,3.413,8.533,8.533,8.533H50.2v443.733H7.533c-5.12,0-8.533,3.413-8.533,8.533 S2.413,511,7.533,511h51.2h238.933h102.4h51.2h51.2c5.12,0,8.533-3.413,8.533-8.533S507.587,493.933,502.467,493.933z M41.667,16.067h426.667v17.067h-17.067H58.733H41.667V16.067z M306.2,493.933V357.4h34.133v136.533H306.2z M357.4,493.933V357.4 h34.133v136.533H357.4z M408.6,493.933V348.867c0-5.12-3.413-8.533-8.533-8.533h-102.4c-5.12,0-8.533,3.413-8.533,8.533v145.067 H67.267V50.2h375.467v443.733H408.6z" />
        <Path d="M229.4,84.333h-68.267H92.867c-5.12,0-8.533,3.413-8.533,8.533v68.267c0,5.12,3.413,8.533,8.533,8.533h68.267H229.4 c5.12,0,8.533-3.413,8.533-8.533V92.867C237.933,87.747,234.52,84.333,229.4,84.333z M101.4,101.4h51.2v51.2h-51.2V101.4z M220.867,152.6h-51.2v-51.2h51.2V152.6z" />
        <Path d="M417.133,84.333h-68.267H280.6c-5.12,0-8.533,3.413-8.533,8.533v68.267c0,5.12,3.413,8.533,8.533,8.533h68.267h68.267 c5.12,0,8.533-3.413,8.533-8.533V92.867C425.667,87.747,422.253,84.333,417.133,84.333z M289.133,101.4h51.2v51.2h-51.2V101.4z M408.6,152.6h-51.2v-51.2h51.2V152.6z" />
        <Path d="M229.4,203.8h-68.267H92.867c-5.12,0-8.533,3.413-8.533,8.533V280.6c0,5.12,3.413,8.533,8.533,8.533h68.267H229.4 c5.12,0,8.533-3.413,8.533-8.533v-68.267C237.933,207.213,234.52,203.8,229.4,203.8z M101.4,220.867h51.2v51.2h-51.2V220.867z M220.867,272.067h-51.2v-51.2h51.2V272.067z" />
        <Path d="M229.4,340.333h-68.267H92.867c-5.12,0-8.533,3.413-8.533,8.533v68.267c0,5.12,3.413,8.533,8.533,8.533h68.267H229.4 c5.12,0,8.533-3.413,8.533-8.533v-68.267C237.933,343.747,234.52,340.333,229.4,340.333z M101.4,357.4h51.2v51.2h-51.2V357.4z M220.867,408.6h-51.2v-51.2h51.2V408.6z" />
        <Path d="M417.133,203.8h-68.267H280.6c-5.12,0-8.533,3.413-8.533,8.533V280.6c0,5.12,3.413,8.533,8.533,8.533h68.267h68.267 c5.12,0,8.533-3.413,8.533-8.533v-68.267C425.667,207.213,422.253,203.8,417.133,203.8z M289.133,220.867h51.2v51.2h-51.2 V220.867z M408.6,272.067h-51.2v-51.2h51.2V272.067z" />
      </G>
    </Svg>
  );
}

function Villa({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 425" fill={color}>
      <Path fillRule="nonzero" d="M154.42 416.25h54.14v-93.06h94.88v93.06h54.14V107.53L253.62 33.72l-99.2 70.99v311.54zm211.91 0h115.61V195.72l-115.61-23.03v243.56zm0-266.43 138.47 28.2c5.72 2.13 8.63 8.5 6.5 14.21-2.13 5.72-8.49 8.63-14.21 6.5l-6.39-1.27V425H20.07V197.86l-5.16.87c-5.72 2.13-12.08-.78-14.21-6.5-2.13-5.71.78-12.08 6.5-14.21l138.46-24.37v-42.67l-9.1 6.52c-6.81 4.84-16.27 3.25-21.11-3.56-4.85-6.81-3.25-16.26 3.56-21.11L244.54 3.01c5.12-3.83 12.33-4.11 17.82-.21l125.81 89.32c6.81 4.85 8.4 14.3 3.56 21.11-4.85 6.81-14.3 8.41-21.11 3.56l-4.29-3.04v36.07zm-220.67 26.69L28.82 196.37v219.88h116.84V176.51zm114.36 154.72v85.02h35.38v-85.02h-35.38zm-8.04 85.02v-85.02H216.6v85.02h35.38zm43.42-231.59h-35.38v71.81h35.38v-71.81zm-43.42 0H216.6v71.81h35.38v-71.81zm-35.38-8.04h35.38v-61.8c-9.24.95-17.56 5.12-23.81 11.37-7.14 7.14-11.57 17-11.57 27.83v22.6zm43.42 0h35.38v-22.6c0-10.83-4.43-20.68-11.58-27.83-6.24-6.25-14.57-10.42-23.8-11.37v61.8zM256 106.57c13.05 0 24.91 5.34 33.51 13.94 8.6 8.59 13.93 20.46 13.93 33.51v110.49h-94.88V154.02c0-13.05 5.33-24.92 13.93-33.51 8.59-8.6 20.46-13.94 33.51-13.94z" />
    </Svg>
  );
}

function Chalet({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 476.041 476.041" fill={color}>
      <Path d="M473.715,215.027l-232.02-179.75c-2.164-1.676-5.186-1.676-7.35,0L105.02,135.468V121.02h0.5c3.313,0,6-2.687,6-6v-24 c0-3.313-2.687-6-6-6h-57c-3.313,0-6,2.687-6,6v24c0,3.313,2.687,6,6,6h0.5v57.832L2.326,215.027 c-2.028,1.571-2.833,4.258-2.002,6.685C1.154,224.14,3.435,225.77,6,225.77h18.52v18.25h-7.5c-3.313,0-6,2.687-6,6v38 c0,3.313,2.687,6,6,6h7.5v142c0,3.313,2.686,6,6,6h415c3.314,0,6-2.687,6-6v-142h7.5c3.313,0,6-2.687,6-6v-38c0-3.313-2.687-6-6-6 h-7.5v-18.25h18.52c2.565,0,4.847-1.631,5.677-4.059C476.548,219.285,475.743,216.599,473.715,215.027z M54.52,97.02h45v12h-45 V97.02z M61.02,121.02h32v23.744l-32,24.791V121.02z M89.52,256.02v7h-66.5v-7H89.52z M258.02,244.02h-40v-66h40V244.02z M279.52,256.02v7h-83v-7H279.52z M291.52,282.02v-7h83v7H291.52z M101.52,282.02v-7h83v7H101.52z M196.52,275.02h83v7h-83V275.02z M291.52,263.02v-7h83v7H291.52z M184.52,263.02h-83v-7h83V263.02z M23.02,275.02h66.5v7h-66.5V275.02z M133.27,430.02h-40v-98h40 V430.02z M439.52,430.02H145.27v-104c0-3.313-2.687-6-6-6h-52c-3.313,0-6,2.687-6,6v104H36.52v-136h403V430.02z M386.52,282.02v-7 h66.5v7H386.52z M453.02,263.02h-66.5v-7h66.5V263.02z M386.52,244.02v-4c0-3.313-2.687-6-6-6s-6,2.687-6,6v4h-83v-4 c0-3.313-2.687-6-6-6s-6,2.687-6,6v4h-9.5v-72c0-3.313-2.687-6-6-6h-52c-3.313,0-6,2.687-6,6v72h-9.5v-4c0-3.313-2.687-6-6-6 s-6,2.687-6,6v4h-83v-4c0-3.313-2.687-6-6-6s-6,2.687-6,6v4h-53v-17.059L238.02,70.86l201.5,156.102v17.059H386.52z M442.883,214.388L241.695,58.527c-2.163-1.676-5.186-1.676-7.349,0L33.158,214.388c-6.384-0.363-9.615-0.617-9.615-0.617 L238.02,47.61l214.478,166.16C452.498,213.77,449.024,214.024,442.883,214.388z" />
    </Svg>
  );
}

function Commercial({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill={color}>
      <Path d="M59,0H5C2.789,0,1,1.789,1,4v20c0,2.22,1.208,4.152,3,5.19V60c0,2.211,1.789,4,4,4h48c2.211,0,4-1.789,4-4V29.19c1.792-1.038,3-2.971,3-5.19V4C63,1.789,61.211,0,59,0z M51,2v22c0,2.209-1.791,4-4,4s-4-1.791-4-4V2H51z M41,2v22c0,2.209-1.791,4-4,4s-4-1.791-4-4V2H41z M31,2v22c0,2.209-1.791,4-4,4s-4-1.791-4-4V2H31z M21,2v22c0,2.209-1.791,4-4,4s-4-1.791-4-4V2H21z M3,4c0-1.104,0.896-2,2-2h6v22c0,2.209-1.791,4-4,4s-4-1.791-4-4V4z M12,62V38h12v10h-1c-0.553,0-1,0.447-1,1s0.447,1,1,1h1v12H12z M58,60c0,1.104-0.896,2-2,2H26V37c0-0.516-0.447-1-1-1H11c-0.553,0-1,0.447-1,1v25H8c-1.104,0-2-0.896-2-2V29.91C6.326,29.965,6.658,30,7,30c2.088,0,3.926-1.068,5-2.687C13.074,28.932,14.912,30,17,30s3.926-1.068,5-2.687C23.074,28.932,24.912,30,27,30s3.926-1.068,5-2.687C33.074,28.932,34.912,30,37,30s3.926-1.068,5-2.687C43.074,28.932,44.912,30,47,30s3.926-1.068,5-2.687C53.074,28.932,54.912,30,57,30c0.342,0,0.674-0.035,1-0.09V60z M57,28 c-2.209,0-4-1.791-4-4V2h6c1.104,0,2,0.896,2,2v20C61,26.209,59.209,28,57,28z" />
      <Path d="M53,36H29c-0.553,0-1,0.447-1,1v20c0,0.553,0.447,1,1,1h24c0.553,0,1-0.447,1-1V37C54,36.447,53.553,36,53,36z M52,56H30V38h22V56z" />
      <Path d="M48.293,42.707C48.488,42.902,48.744,43,49,43s0.512-0.098,0.707-0.293c0.391-0.391,0.391-1.023,0-1.414 l-1-1c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414L48.293,42.707z" />
      <Path d="M48.293,47.707C48.488,47.902,48.744,48,49,48s0.512-0.098,0.707-0.293c0.391-0.391,0.391-1.023,0-1.414 l-6-6c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414L48.293,47.707z" />
    </Svg>
  );
}

function HolidayHome({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* wavy water */}
      <Path
        d="M2 22q1.5 -1 3 0t3 0t3 0t3 0t3 0t3 0"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* bungalow body */}
      <Path d="M10 21v-9M20 21v-9" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Path
        d="M8.5 12L15 5l6.5 7"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M8.5 12h13" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Path
        d="M13 14h3.5v7H13z"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.5 13.5h2v2h-2z"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* palm trunk */}
      <Path
        d="M4.5 21c-1.5-5-1.5-10 .5-15"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      {/* palm fronds */}
      <Path d="M5 6c-2-0.5-3.5 0.5-4 2.5" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Path d="M5 6c2-0.5 3.5 0.5 4 2.5" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Path d="M5 6c-0.5-2 0.5-3.5 2-4" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Path d="M5 6c0.5-2-0.5-3-2-3.7" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

/* ----- Filled equivalents for icomoon glyphs (house / office1 / land) ----- */

function Building({ size = 28, color = 'currentColor' }: Props) {
  // Clean residential apartment block (Material "apartment").
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm4 4H9v-2h2v2zm0-4H9V9h2v2zm0-4H9V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z" />
    </Svg>
  );
}

function Office({ size = 28, color = 'currentColor' }: Props) {
  // Clean commercial / office complex (Material "business").
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
    </Svg>
  );
}

function Land({ size = 28, color = 'currentColor' }: Props) {
  // Terrain / land plot — rolling hills with location pin
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2a4 4 0 0 0-4 4c0 3 4 8 4 8s4-5 4-8a4 4 0 0 0-4-4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
      <Path d="M2 21c2-3 4-3 6 0 1.5-2.5 3.5-2.5 5 0 1.5-2.5 3.5-2.5 5 0 1.5-2 3-2 4 0H2z" />
      <Path d="M2 22h20v1H2z" />
    </Svg>
  );
}

function HomeFallback({ size = 28, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 3 3 11h2v10h5v-6h4v6h5V11h2L12 3z" />
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
