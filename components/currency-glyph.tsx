import Svg, { Path } from 'react-native-svg';

/**
 * Inline currency glyphs (USD / EUR / TRY), ported verbatim from the web
 * components/common/PropertyCard/CurrencyGlyph.jsx so the geometry matches.
 * SYP and any unknown code return null; callers fall back to the text symbol.
 */
type Props = { code?: string; size?: number; color?: string };

export function hasCurrencyGlyph(code?: string): boolean {
  const c = String(code || '').toUpperCase();
  return c === 'USD' || c === 'EUR' || c === 'TRY';
}

export function CurrencyGlyph({ code, size = 17, color = '#333333' }: Props) {
  const c = String(code || '').toUpperCase();

  if (c === 'USD') {
    return (
      <Svg width={size} height={size} viewBox="390 240 340 540" fill={color}>
        <Path d="M541.7 768v-45.3c46.3-2.4 81.5-15 108.7-37.8 27.2-22.8 40.8-53.1 40.8-88.2 0-37.8-11-65.7-35.3-83.4-24.6-20.1-59.8-35.4-111.6-45.3h-2.6V351.8c35.3 5.1 65.3 15 95.1 35.4l43.6-55.5c-43.6-27.9-89.9-42.9-138.8-45.3V256h-40.8v30.3c-40.8 2.4-76.3 15-103.5 37.8-27.2 22.8-40.8 53.1-40.8 88.2s11 63 35.3 80.7c21.7 17.7 59.8 32.7 108.7 42.9v118.5c-38.2-5.1-76.3-22.8-114.2-53.1l-48.9 53.1c48.9 40.5 103.5 63 163.3 68.1V768h41zm2.6-219.6c27.2 7.5 43.6 15 54.4 22.8 8.1 10.2 13.6 20.1 13.6 35.4s-5.5 25.2-19.1 35.4c-13.6 10.2-30.1 15-48.9 17.7V548.4zM449.2 440c-8.1-7.5-13.6-20.1-13.6-32.7 0-15 5.5-25.2 16.2-35.4 13.6-10.2 27.2-15 48.9-17.7v108.6c-27.2-7.8-43.4-15.3-51.5-22.8z" />
      </Svg>
    );
  }

  if (c === 'EUR') {
    return (
      <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
        <Path d="M4.99918 5C5.13949 4.81337 5.29458 4.63433 5.46444 4.46447C7.41706 2.51184 10.5829 2.51184 12.5355 4.46447L14.6568 2.34315C11.5326 -0.781049 6.46731 -0.781049 3.34312 2.34315C2.55926 3.12701 1.97207 4.03306 1.58155 5H0V7H1.06235C0.979184 7.66386 0.979184 8.33614 1.06235 9H0V11H1.58155C1.97207 11.9669 2.55926 12.873 3.34312 13.6569C6.46731 16.781 11.5326 16.781 14.6568 13.6569L12.5355 11.5355C10.5829 13.4882 7.41706 13.4882 5.46444 11.5355C5.29458 11.3657 5.13949 11.1866 4.99918 11H9V9H4.10044C3.96649 8.3406 3.96649 7.6594 4.10044 7H9V5H4.99918Z" />
      </Svg>
    );
  }

  if (c === 'TRY') {
    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round">
        <Path d="M7 12.1429V20H11.8889C15.8162 20 19 16.8162 19 12.8889V12M7 12.1429V8.14286M7 12.1429L5 13M7 12.1429L12 10M7 8.14286V4M7 8.14286L5 9M7 8.14286L12 6" />
      </Svg>
    );
  }

  return null;
}
