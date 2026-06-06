import type { ExtendedListing } from '@/apis/listing';

/**
 * Listing privacy helper — pure (no React) mirror of the web
 * `aqaarGate-FE/utlis/listingPrivacy.js`.
 *
 * Agents publish their own personal contact + exact address; guests scrape
 * those to close deals off-platform. So for agent-published listings we hide
 * the exact street address and the map from non-logged-in visitors. Admin /
 * platform listings (no agentId) stay fully visible — that's our own data.
 *
 * Agent-published == listing tied to a real agent account, as opposed to
 * admin/platform listings (no agentId). Kept permissive to match web.
 */
export function isAgentListing(listing?: ExtendedListing | null): boolean {
  const a = listing?.agentId;
  if (a && typeof a === 'object') {
    // The serialized agent may carry a `role`/`username` at runtime even though
    // the TS type only lists a subset of fields — check them defensively.
    const obj = a as { role?: string; username?: string; email?: string; _id?: string };
    if (obj.role) return obj.role === 'agent';
    return !!(obj.username || obj.email || obj._id);
  }
  if (typeof a === 'string' && a.trim()) return true;
  return !!(listing?.agentName && listing.agentName.trim());
}
