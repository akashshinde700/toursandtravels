"use client";

import { createContext, useContext } from "react";
import { DEFAULT_CONTENT, type Content } from "@/lib/data";

// Hands the server-loaded (admin-editable) content to client components.
const ContentContext = createContext<Content>(DEFAULT_CONTENT);

export function ContentProvider({ value, children }: { value: Content; children: React.ReactNode }) {
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
