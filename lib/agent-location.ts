export const AGENT_LOCATION_FILTER_KEYS = [
  'latakia',
  'damascus',
  'aleppo',
  'homs',
  'hama',
  'idlib',
  'deirEzZor',
  'daraa',
  'tartous',
] as const;

export type AgentLocationKey = (typeof AGENT_LOCATION_FILTER_KEYS)[number];

const FILTER_KEY_REGEX: Record<AgentLocationKey, RegExp> = {
  latakia: /latakia|lattakia|اللاذقية/i,
  damascus: /damascus|دمشق/i,
  aleppo: /aleppo|حلب/i,
  homs: /homs|حمص/i,
  hama: /hama|حماة/i,
  idlib: /idlib|إدلب/i,
  deirEzZor: /deir\s*ez|deir-ez|der el zor|دير\s*الزور/i,
  daraa: /daraa|درعا/i,
  tartous: /tartus|tartous|طرطوس/i,
};

export function matchesAgentLocationFilter(
  filterKey: string,
  location?: string
): boolean {
  if (!filterKey || filterKey === 'all') return true;
  const raw = location || '';
  const re = FILTER_KEY_REGEX[filterKey as AgentLocationKey];
  if (!re) return true;
  return re.test(raw);
}

function segmentToDisplayKey(segment: string): AgentLocationKey | null {
  const s = segment.trim();
  if (!s) return null;
  for (const key of AGENT_LOCATION_FILTER_KEYS) {
    if (FILTER_KEY_REGEX[key].test(s)) return key;
  }
  return null;
}

export function formatAgentLocationParts(
  location: string | undefined,
  t: (key: string) => string
): string[] {
  if (!location || typeof location !== 'string') return [];
  return location
    .split(',')
    .map((seg) => seg.trim())
    .filter(Boolean)
    .map((seg) => {
      const key = segmentToDisplayKey(seg);
      return key ? t(`agentsScreen.cities.${key}`) : seg;
    });
}

const PLACEHOLDER_COMPANIES = new Set([
  'Syrian Properties',
  'syrian properties',
  'AqaarGate Real Estate',
  'AqaarGate',
  'عقار غيت',
  'عقارات سورية',
]);

function cleanCompany(raw?: string): string {
  const s = (raw || '').trim();
  return PLACEHOLDER_COMPANIES.has(s) ? '' : s;
}

export function pickAgentCompany(
  agent: {
    company?: string;
    company_ar?: string;
    companyName?: string;
  } | null | undefined,
  isRTL: boolean
): string {
  if (!agent) return '';
  const candidates = isRTL
    ? [agent.company_ar, agent.company, agent.companyName]
    : [agent.company, agent.companyName];
  for (const raw of candidates) {
    const cleaned = cleanCompany(raw);
    if (cleaned) return cleaned;
  }
  return '';
}
