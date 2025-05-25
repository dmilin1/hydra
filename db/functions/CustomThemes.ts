import { eq } from "drizzle-orm";

import db from "..";
import { CustomThemes } from "../schema";
import { CustomTheme } from "../../constants/Themes";

export function getCustomThemes(): CustomTheme[] {
  const customThemeData = db.select().from(CustomThemes).all();
  const customThemes: CustomTheme[] = [];
  customThemeData.forEach((theme) => {
    try {
      customThemes.push(JSON.parse(theme.data));
    } catch (error) {
      console.error("Error parsing custom theme data:", error, theme.data);
    }
  });
  return customThemes;
}

export function getCustomTheme(name: string): CustomTheme | null {
  const customThemeData = db
    .select()
    .from(CustomThemes)
    .where(eq(CustomThemes.name, name))
    .get();
  if (!customThemeData) return null;
  try {
    return JSON.parse(customThemeData.data);
  } catch (error) {
    console.error(
      "Error parsing custom theme data:",
      error,
      customThemeData.data,
    );
    return null;
  }
}

export function saveCustomTheme(theme: CustomTheme) {
  const data = JSON.stringify(theme);
  db.insert(CustomThemes)
    .values({
      name: theme.name,
      data,
    })
    .onConflictDoUpdate({
      target: CustomThemes.name,
      set: {
        data,
      },
    })
    .run();
}

export function deleteCustomTheme(theme: CustomTheme) {
  db.delete(CustomThemes).where(eq(CustomThemes.name, theme.name)).run();
}
