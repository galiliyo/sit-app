import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { ReminderSettings } from "./types";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleReminders(reminders: ReminderSettings): Promise<void> {
  // Cancel all existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  if (reminders.morningEnabled && reminders.morningTime) {
    const [hour, minute] = reminders.morningTime.split(":").map(Number);
    if (!isNaN(hour) && !isNaN(minute)) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to sit",
          body: "Your morning practice awaits.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }
  }

  if (reminders.eveningEnabled && reminders.eveningTime) {
    const [hour, minute] = reminders.eveningTime.split(":").map(Number);
    if (!isNaN(hour) && !isNaN(minute)) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Evening check-in",
          body: "Have you sat today?",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }
  }
}
