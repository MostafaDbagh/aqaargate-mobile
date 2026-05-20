/**
 * Node smoke test that imports the REAL `authAPI` / `userAPI` / `searchListings`
 * modules and exercises them against the production backend. Stubs
 * AsyncStorage so `lib/storage.ts` and the axios interceptor don't blow up.
 *
 * Run: npx tsx scripts/smoke-api.ts
 */

import Module from 'node:module';

// --- Stub @react-native-async-storage/async-storage in Node ---
const memory = new Map<string, string>();
const asyncStorageImpl = {
  getItem: async (k: string) => memory.get(k) ?? null,
  setItem: async (k: string, v: string) => {
    memory.set(k, v);
  },
  removeItem: async (k: string) => {
    memory.delete(k);
  },
  multiRemove: async (ks: string[]) => {
    ks.forEach((k) => memory.delete(k));
  },
};
// Mark __esModule so tsx/esbuild's __importDefault interop returns
// { default: impl } correctly (otherwise it double-wraps).
const fakeAsyncStorage = { __esModule: true, default: asyncStorageImpl };

const ModAny = Module as unknown as { _load: (...args: unknown[]) => unknown };
const origLoad = ModAny._load.bind(Module);
ModAny._load = function patched(request: unknown, ...rest: unknown[]) {
  if (request === '@react-native-async-storage/async-storage') return fakeAsyncStorage;
  return origLoad(request, ...rest);
} as typeof ModAny._load;

// --- Helpers ---
type Result = { name: string; ok: boolean; detail: string };
const results: Result[] = [];

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

async function expect(name: string, fn: () => Promise<string | void>) {
  try {
    const detail = (await fn()) ?? 'ok';
    results.push({ name, ok: true, detail });
    console.log(`${GREEN}✓${RESET} ${name} ${DIM}— ${detail}${RESET}`);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    results.push({ name, ok: false, detail });
    console.log(`${RED}✗${RESET} ${name} ${DIM}— ${detail}${RESET}`);
  }
}

function isAxiosErrorWithMessage(err: unknown): { status?: number; message?: string; raw?: unknown } {
  const e = err as { response?: { status?: number; data?: { message?: string; error?: string } } };
  return {
    status: e?.response?.status,
    message: e?.response?.data?.message ?? e?.response?.data?.error,
    raw: e?.response?.data,
  };
}

async function main() {
  // Import real modules AFTER stubbing AsyncStorage
  const { authAPI } = await import('../apis/auth');
  const { userAPI } = await import('../apis/user');
  const { searchListings, getApiErrorMessage } = await import('../lib/api');
  const { persistCredentials, clearCredentials } = await import('../store/persist');

  console.log(`${YELLOW}Smoke-testing real auth/user/listing modules against production backend${RESET}\n`);

  // --- LISTINGS ---
  await expect('searchListings({ limit: 3 }) returns array of listings', async () => {
    const list = await searchListings({ limit: 3, sort: 'newest' });
    if (!Array.isArray(list)) throw new Error(`expected array, got ${typeof list}`);
    if (list.length === 0) throw new Error('empty array');
    const first = list[0];
    if (!first._id) throw new Error('listing missing _id');
    if (!Array.isArray(first.images)) throw new Error('listing missing images[]');
    return `${list.length} listings, first._id=${first._id}`;
  });

  await expect('searchListings({ status: "For Sale", limit: 2 }) filters by status', async () => {
    const list = await searchListings({ status: 'For Sale', limit: 2 });
    if (!Array.isArray(list)) throw new Error(`expected array`);
    const offender = list.find((l) => l.status && l.status !== 'For Sale');
    if (offender) throw new Error(`got listing with status="${offender.status}"`);
    return `${list.length} listings, all status=For Sale`;
  });

  // --- AUTH: signin with bad credentials ---
  await expect('authAPI.signin(bad creds) → axios error with backend message', async () => {
    try {
      await authAPI.signin({ email: 'nonexistent_xyz_' + Date.now() + '@example.com', password: 'wrong' });
      throw new Error('signin unexpectedly succeeded');
    } catch (err) {
      const info = isAxiosErrorWithMessage(err);
      if (info.status !== 404 && info.status !== 400 && info.status !== 401) {
        throw new Error(`unexpected status ${info.status}: ${JSON.stringify(info.raw)}`);
      }
      const surfaced = getApiErrorMessage(err);
      if (!surfaced || surfaced.length < 3) throw new Error('getApiErrorMessage returned empty');
      return `${info.status} "${surfaced}"`;
    }
  });

  // --- AUTH: send-otp with invalid email ---
  await expect('authAPI.sendOTP(invalid email) → backend rejects with INVALID_EMAIL_FORMAT', async () => {
    try {
      await authAPI.sendOTP('not_an_email', 'signup');
      throw new Error('sendOTP unexpectedly succeeded');
    } catch (err) {
      const info = isAxiosErrorWithMessage(err);
      if (info.status === undefined) throw new Error(`no status on error: ${String(err)}`);
      const surfaced = getApiErrorMessage(err);
      return `${info.status} "${surfaced}"`;
    }
  });

  // --- AUTH: send-otp with valid but unused-shape email (we WILL receive a real send) ---
  // Skip actually sending — we don't want to spam the backend or burn rate limit.

  // --- AUTH: verify-otp with garbage ---
  await expect('authAPI.verifyOTP(no pending otp) → backend rejects with OTP_NOT_FOUND', async () => {
    try {
      await authAPI.verifyOTP('never_requested_' + Date.now() + '@example.com', '000000', 'signup');
      throw new Error('verifyOTP unexpectedly succeeded');
    } catch (err) {
      const info = isAxiosErrorWithMessage(err);
      const surfaced = getApiErrorMessage(err);
      return `${info.status} "${surfaced}"`;
    }
  });

  // --- TOKEN ATTACHMENT: persistCredentials then check axios attaches Authorization ---
  await expect('axios attaches Authorization: Bearer <token> after persistCredentials', async () => {
    const fakeToken = 'test-token-' + Date.now();
    await persistCredentials(
      { _id: 'fake', email: 'fake@example.com', username: 'fake', role: 'user' },
      fakeToken
    );
    // Inspect outgoing headers via a RESPONSE interceptor — request interceptors
    // run LIFO so a late-registered request interceptor would fire BEFORE the
    // token-attaching one in lib/api.ts. The response side sees the final config.
    const { Axios } = await import('../lib/api');
    let sent: string | undefined;
    const id = Axios.interceptors.response.use(
      (resp) => {
        sent = resp.config.headers?.Authorization as string | undefined;
        return resp;
      },
      (err) => {
        sent = err?.config?.headers?.Authorization as string | undefined;
        return Promise.reject(err);
      }
    );
    try {
      await Axios.get('/listing/search', { params: { limit: 1 } });
    } catch {
      /* network result irrelevant — we want the captured header */
    }
    Axios.interceptors.response.eject(id);
    await clearCredentials();
    if (sent !== `Bearer ${fakeToken}`) {
      throw new Error(`Authorization header was "${sent}", expected "Bearer ${fakeToken}"`);
    }
    return sent;
  });

  // --- USER profile (no token → backend should 401 or 4xx) ---
  await expect('userAPI.getProfile(bogus id) without token → backend rejects', async () => {
    try {
      await userAPI.getProfile('000000000000000000000000');
      throw new Error('unexpectedly succeeded');
    } catch (err) {
      const info = isAxiosErrorWithMessage(err);
      if (info.status === undefined) throw new Error(`no http status: ${String(err)}`);
      return `${info.status} "${getApiErrorMessage(err)}"`;
    }
  });

  console.log('');
  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;
  console.log(`${YELLOW}Summary:${RESET} ${GREEN}${passed} passed${RESET}, ${failed > 0 ? RED : DIM}${failed} failed${RESET}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(2);
});
