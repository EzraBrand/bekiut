type CalendarItem = {
  title?: { en?: string };
  displayValue?: { en?: string; he?: string };
  ref?: string;
  heRef?: string;
};

export function parseWeeklyParsha(input: unknown) {
  if (!input || typeof input !== "object" || !("calendar_items" in input) || !Array.isArray(input.calendar_items)) {
    throw new Error("Invalid Sefaria calendar");
  }
  const data = input as { calendar_items: CalendarItem[] };
  const item = data.calendar_items?.find(item => item.title?.en === "Parashat Hashavua");
  const match = item?.ref?.match(/^(Genesis|Exodus|Leviticus|Numbers|Deuteronomy) (\d+):(\d+)(?:-|$)/);
  if (!match || !item?.displayValue?.en || !item.displayValue.he || !item.heRef) {
    throw new Error("Sefaria calendar has no valid weekly Torah portion");
  }
  return {
    titleEn: item.displayValue.en, titleHe: item.displayValue.he,
    ref: item.ref!, heRef: item.heRef,
    href: `/bible/${match[1]}/${match[2]}#${match[3]}`,
  };
}

let cached: { date: string; value: ReturnType<typeof parseWeeklyParsha> } | undefined;
export async function getWeeklyParsha() {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  if (cached?.date === date) return cached.value;
  const [year, month, day] = date.split("-");
  const params = new URLSearchParams({ diaspora: "0", year, month, day });
  const response = await fetch(`https://www.sefaria.org/api/calendars?${params}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Sefaria calendar HTTP ${response.status}`);
  const value = parseWeeklyParsha(await response.json());
  cached = { date, value };
  return value;
}
