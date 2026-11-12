/** Storage that never throws: private windows and blocked storage just keep nothing. */
function safe(store: () => Storage) {
  return {
    get(key: string): string | null {
      try {
        return store().getItem(key);
      } catch {
        return null;
      }
    },
    set(key: string, value: string | null) {
      try {
        if (value === null) store().removeItem(key);
        else store().setItem(key, value);
      } catch {
        // Storage blocked: the value lives in memory for this page only.
      }
    },
  };
}

export const local = safe(() => window.localStorage);
export const session = safe(() => window.sessionStorage);
