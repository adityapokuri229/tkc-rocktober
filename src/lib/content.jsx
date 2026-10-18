import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_CONTENT, STORAGE_KEY } from "../data/event.js";
import { supabase } from "./supabase.js";

const ContentCtx = createContext(null);

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_CONTENT);
    return { ...structuredClone(DEFAULT_CONTENT), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_CONTENT);
  }
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(loadLocal);
  const [source, setSource] = useState("local");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function pull() {
      if (!supabase) return;
      const { data, error } = await supabase.from("event_content").select("data").eq("id", 1).single();
      if (!error && data?.data) {
        setContent({ ...structuredClone(DEFAULT_CONTENT), ...data.data });
        setSource("supabase");
      }
    }
    pull();
  }, []);

  async function save(next) {
    setContent(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch { /* ignore */ }
    if (supabase) {
      const { error } = await supabase.from("event_content").upsert({ id: 1, data: next });
      if (!error) setSource("supabase");
    }
  }

  function reset() {
    const fresh = structuredClone(DEFAULT_CONTENT);
    save(fresh);
  }

  return (
    <ContentCtx.Provider value={{ content, save, reset, source }}>
      {children}
    </ContentCtx.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentCtx);
  if (!ctx) throw new Error("useContent must be used inside ContentProvider");
  return ctx;
}
