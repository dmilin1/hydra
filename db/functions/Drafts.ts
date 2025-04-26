import { eq, lt } from "drizzle-orm";
import { SetStateAction, Dispatch, useState } from "react";

import db from "..";
import { Drafts } from "../schema";

export async function maintainDrafts() {
  const MAX_DRAFTS = 100;
  const draftCount = await db.$count(Drafts);
  if (draftCount > MAX_DRAFTS) {
    const oldestDraft = db
      .select()
      .from(Drafts)
      .orderBy(Drafts.createdAt)
      .offset(draftCount - MAX_DRAFTS)
      .limit(1)
      .get();
    if (oldestDraft) {
      await db.delete(Drafts).where(lt(Drafts.id, oldestDraft.id));
    }
  }
}
export function getDraft(key: string) {
  return db.select().from(Drafts).where(eq(Drafts.key, key)).get()?.text;
}

export function setDraft(key: string, text: string) {
  db.insert(Drafts)
    .values({ key, text })
    .onConflictDoUpdate({
      target: Drafts.key,
      set: { text },
    })
    .run();
}

export function useDraftState(
  key: string,
): [string, Dispatch<SetStateAction<string>>] {
  const [draft, setDraftState] = useState(getDraft(key) ?? "");
  const updateDraft: Dispatch<SetStateAction<string>> = (textDispatch) => {
    if (typeof textDispatch === "string") {
      setDraftState(textDispatch);
      setDraft(key, textDispatch);
    } else {
      setDraftState((prev) => {
        const newText = textDispatch(prev);
        setDraft(key, newText);
        return newText;
      });
    }
  };
  return [draft, updateDraft];
}
