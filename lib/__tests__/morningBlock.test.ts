import { initStore, getData, resetData } from "../store";

describe("morning block store logic", () => {
  beforeEach(async () => {
    await resetData();
    await initStore();
  });

  test("morning block settings have correct defaults", () => {
    const data = getData();
    expect(data.morningBlock).toBeDefined();
    expect(data.morningBlock.enabled).toBe(false);
    expect(data.morningBlock.startTime).toBe("06:00");
    expect(data.morningBlock.endTime).toBe("09:00");
    expect(data.morningBlock.dismissMode).toBe("gentle");
    expect(data.morningBlock.blockedApps.length).toBeGreaterThan(0);
    expect(data.morningBlock.unlockedToday).toBe(false);
  });

  test("blocked apps include default social media apps", () => {
    const data = getData();
    const packageNames = data.morningBlock.blockedApps.map((a) => a.packageName);
    expect(packageNames).toContain("com.instagram.android");
    expect(packageNames).toContain("com.twitter.android");
    expect(packageNames).toContain("com.reddit.frontpage");
    expect(packageNames).toContain("com.zhiliaoapp.musically");
    expect(packageNames).toContain("com.google.android.youtube");
    expect(packageNames).toContain("org.telegram.messenger");
    expect(packageNames).toContain("com.android.chrome");
  });

  test("blocked apps have display names", () => {
    const data = getData();
    for (const app of data.morningBlock.blockedApps) {
      expect(app.name).toBeTruthy();
      expect(app.packageName).toBeTruthy();
    }
  });
});
