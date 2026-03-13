import { useState } from "react";
import { Pressable, Text, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { colors } from "../constants/theme";

interface TimePickerProps {
  value: string; // "HH:MM"
  onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [show, setShow] = useState(false);

  const [hours, minutes] = (value || "07:30").split(":").map(Number);
  const date = new Date();
  date.setHours(hours || 7, minutes || 30, 0, 0);

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (selectedDate) {
      const h = String(selectedDate.getHours()).padStart(2, "0");
      const m = String(selectedDate.getMinutes()).padStart(2, "0");
      onChange(`${h}:${m}`);
    }
  };

  return (
    <>
      <Pressable onPress={() => setShow(true)}>
        <Text
          style={{ fontFamily: "JetBrainsMono_400Regular" }}
          className="text-sm text-accent"
        >
          {value || "07:30"}
        </Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          themeVariant="dark"
        />
      )}
    </>
  );
}
