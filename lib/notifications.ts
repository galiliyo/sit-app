import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { ReminderSettings } from "./types";

const isNative = Platform.OS === "ios" || Platform.OS === "android";

// Configure how notifications appear when app is in foreground
if (isNative) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isNative) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleReminders(reminders: ReminderSettings): Promise<void> {
  if (!isNative) return;
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
