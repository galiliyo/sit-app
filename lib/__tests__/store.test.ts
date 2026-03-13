import { initStore, getData, recordSession, resetData } from "../store";
import { TimerConfig } from "../types";

const defaultConfig: TimerConfig = {
  duration: 10,
  startBell: "Root Chakra",
  endBell: "Root Chakra",
  intervalBells: false,
  intervalMinutes: 7,
  ambientSound: null,
};

describe("store", () => {
  beforeEach(async () => {
    await resetData();
    await initStore();
  });

  test("initializes with seed data", () => {
    const data = getData();
    expect(data.sessions.length).toBeGreaterThan(0);
    expect(data.presets.length).toBe(3);
    expect(data.settings.minimumSitMinutes).toBe(5);
  });

  test("records a session and marks qualified", async () => {
    const session = await recordSession(10, 600, defaultConfig);
    expect(session.qualifiedForDayCredit).toBe(true);
    expect(session.durationMinutes).toBe(10);
  });

  test("sessions under minimumSitMinutes are not qualified", async () => {
    const shortConfig = { ...defaultConfig, duration: 3 };
    const session = await recordSession(3, 180, shortConfig);
    expect(session.qualifiedForDayCredit).toBe(false);
  });

  test("sessions under 5 min do not count toward streak", async () => {
    const data = getData();
    const streakBefore = data.streak.currentDailyStreak;
    await recordSession(3, 180, { ...defaultConfig, duration: 3 });
    const dataAfter = getData();
    expect(dataAfter.streak.currentDailyStreak).toBe(streakBefore);
  });
});
