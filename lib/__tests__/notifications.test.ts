jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve("id")),
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: "daily" },
}));

import * as Notifications from "expo-notifications";
import { scheduleReminders } from "../notifications";

describe("notifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("schedules morning notification when enabled", async () => {
    await scheduleReminders({
      morningEnabled: true,
      morningTime: "07:30",
      eveningEnabled: false,
      eveningTime: "21:00",
    });

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: "Time to sit" }),
        trigger: expect.objectContaining({ hour: 7, minute: 30 }),
      })
    );
  });

  test("schedules both notifications when both enabled", async () => {
    await scheduleReminders({
      morningEnabled: true,
      morningTime: "07:30",
      eveningEnabled: true,
      eveningTime: "21:00",
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });

  test("cancels all and schedules none when both disabled", async () => {
    await scheduleReminders({
      morningEnabled: false,
      morningTime: "07:30",
      eveningEnabled: false,
      eveningTime: "21:00",
    });

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
