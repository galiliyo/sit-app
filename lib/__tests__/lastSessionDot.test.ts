describe("last session dot logic", () => {
  function getDotColor(
    hasSatToday: boolean,
    qualifiedForDayCredit: boolean,
    lastSessionTime: string // "today" | "yesterday" | date string
  ): "green" | "red" | "none" {
    const showGreen = qualifiedForDayCredit && lastSessionTime === "today";
    const showRed = !hasSatToday && lastSessionTime === "yesterday";
    if (showGreen) return "green";
    if (showRed) return "red";
    return "none";
  }

  test("green dot when qualified session today", () => {
    expect(getDotColor(true, true, "today")).toBe("green");
  });

  test("red dot when last session was yesterday and no session today", () => {
    expect(getDotColor(false, true, "yesterday")).toBe("red");
  });

  test("no dot for unqualified session today", () => {
    expect(getDotColor(false, false, "today")).toBe("none");
  });

  test("no dot for old sessions", () => {
    expect(getDotColor(false, true, "Mar 5")).toBe("none");
  });

  test("no dot when sat today but last session was yesterday", () => {
    expect(getDotColor(true, true, "yesterday")).toBe("none");
  });
});
