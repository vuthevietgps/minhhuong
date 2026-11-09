import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { readStoredSession } from "../../session-storage";
import { api, type Item } from "../client";
import type { Dashboard, Policy, QuickPreset } from "./shared";

/** State, effects and handlers of BrowserControlPage, moved verbatim from page.tsx. */
export function useBrowserControlPageState() {
  const [children, setChildren] = useState<
    { id: string; displayName: string }[]
  >([]);
  const [childId, setChildId] = useState("");
  const [data, setData] = useState<Dashboard | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [draft, setDraft] = useState<Item | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pairing, setPairing] = useState<{
    code: string;
    expiresAt: string;
    knownDeviceIds: string[];
  } | null>(null);
  const [now, setNow] = useState(0);
  const [childName, setChildName] = useState("");
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const loadId = useRef(0);
  const load = useCallback(async (id: string) => {
    const requestId = ++loadId.current;
    setData(null);
    setPolicy(null);
    setPairing(null);
    setDraft(null);
    setDirty(false);
    try {
      const result = await api<Dashboard>(`parent/browser-control/${id}`);
      if (requestId === loadId.current) {
        setData(result);
        setPolicy(result.policy);
      }
    } catch (error) {
      if (requestId === loadId.current) setStatus((error as Error).message);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(async () => {
      const session = readStoredSession<{
        accessToken: string;
        user?: { roles: string[] };
      }>();
      const allowed = !!session?.user?.roles.includes("PARENT");
      setAuthorized(allowed);
      if (!allowed) return;
      try {
        const result = await api<{
          children: { id: string; displayName: string }[];
        }>("parent/children");
        setChildren(result.children);
        if (result.children[0]) {
          setChildId(result.children[0].id);
          await load(result.children[0].id);
        }
      } catch (error) {
        setStatus((error as Error).message);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    if (!pairing) return;
    // Countdown tick for the visible expiry of the pairing code.
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [pairing]);
  useEffect(() => {
    if (!pairing || !childId) return;
    // While a code is waiting, refresh only devices/usage/events so the parent
    // sees the child's machine appear without reloading or losing unsaved edits.
    const requestId = loadId.current;
    let cancelled = false;
    const poll = setInterval(async () => {
      if (Date.now() > Date.parse(pairing.expiresAt)) {
        clearInterval(poll);
        return;
      }
      try {
        const result = await api<Dashboard>(`parent/browser-control/${childId}`);
        if (cancelled || requestId !== loadId.current) return;
        setData((current) =>
          current
            ? {
                ...current,
                devices: result.devices,
                usage: result.usage,
                events: result.events,
              }
            : current,
        );
        const added = result.devices.find(
          (device) =>
            !device.revokedAt && !pairing.knownDeviceIds.includes(device.id),
        );
        if (added) {
          setPairing(null);
          setStatus(
            `Đã kết nối “${added.name}”. Máy của con đã sẵn sàng sử dụng.`,
          );
        }
      } catch {
        // Transient errors: keep waiting until the code expires.
      }
    }, 4000);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [pairing, childId]);
  const pairingSecondsLeft = pairing
    ? Math.max(0, Math.ceil((Date.parse(pairing.expiresAt) - now) / 1000))
    : 0;
  const change = (next: Policy) => {
    setPolicy(next);
    setDirty(true);
  };
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setStatus("");
    try {
      await action();
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!policy) return;
    await api(`parent/browser-control/${childId}`, "PUT", policy);
    setData((current) =>
      current ? { ...current, policy: structuredClone(policy) } : current,
    );
    setDirty(false);
    setStatus(
      "Đã lưu. Máy của con sẽ tự nhận thay đổi trong khoảng 30 giây khi có mạng.",
    );
  }
  async function createChild(event: FormEvent) {
    event.preventDefault();
    await run(async () => {
      const child = await api<{ id: string; displayName: string }>(
        "parent/children",
        "POST",
        { displayName: childName },
      );
      setChildren((current) => [...current, child]);
      setChildName("");
      setChildId(child.id);
      await load(child.id);
    });
  }
  const totalMinutes = Math.ceil(
    (data?.usage.reduce((sum, u) => sum + u.seconds, 0) || 0) / 60,
  );
  const selectedChild = children.find((child) => child.id === childId);
  const activeDevices = data?.devices.filter((device) => !device.revokedAt) ?? [];
  const setupStep = !policy?.items.length ? 1 : !activeDevices.length ? 2 : 3;
  const applyPreset = (preset: QuickPreset) => {
    if (!policy) return;
    change({
      ...policy,
      mode: preset.mode,
      dailyMinutes: preset.dailyMinutes,
      windows: [],
    });
    setStatus("Đã chọn “" + preset.title + "”. Nhấn “Lưu thay đổi” để áp dụng.");
  };

  return {
    children,
    setChildren,
    childId,
    setChildId,
    data,
    setData,
    policy,
    setPolicy,
    draft,
    setDraft,
    status,
    setStatus,
    busy,
    setBusy,
    dirty,
    setDirty,
    pairing,
    setPairing,
    now,
    setNow,
    childName,
    setChildName,
    authorized,
    setAuthorized,
    loadId,
    load,
    pairingSecondsLeft,
    change,
    run,
    save,
    createChild,
    totalMinutes,
    selectedChild,
    activeDevices,
    setupStep,
    applyPreset,
  };
}

export type BrowserControlPageState = ReturnType<typeof useBrowserControlPageState>;
