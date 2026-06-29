/* eslint-disable react/prop-types */
import { DateRangePicker as RSuiteDateRangePicker } from "rsuite";
import dayjs from "dayjs";
const predefinedRanges = [
  {
    label: "Today",
    value: [dayjs().startOf("day").toDate(), dayjs().endOf("day").toDate()],
  },
  {
    label: "Yesterday",
    value: [
      dayjs().subtract(1, "day").startOf("day").toDate(),
      dayjs().subtract(1, "day").endOf("day").toDate(),
    ],
  },
  {
    label: "Last 7 Days",
    value: [
      dayjs().subtract(6, "day").startOf("day").toDate(),
      dayjs().endOf("day").toDate(),
    ],
  },
  {
    label: "Last 30 Days",
    value: [
      dayjs().subtract(29, "day").startOf("day").toDate(),
      dayjs().endOf("day").toDate(),
    ],
  },
  {
    label: "Last month",
    value: [
      dayjs().subtract(1, "month").startOf("month").toDate(),
      dayjs().subtract(1, "month").endOf("month").toDate(),
    ],
  },
  {
    label: "Last 60 Days",
    value: [
      dayjs().subtract(59, "day").startOf("day").toDate(),
      dayjs().endOf("day").toDate(),
    ],
  },
];

export default function DateRangePicker({ value, onChange }) {
  // Convert external { startDate, endDate } format to rsuite's [Date, Date] format
  const rsuiteValue =
    value?.startDate && value?.endDate
      ? [new Date(value.startDate), new Date(value.endDate)]
      : value?.startDate
        ? [new Date(value.startDate), new Date(value.startDate)]
        : null;

  const handleChange = (dates) => {
    if (!dates) {
      onChange({ startDate: null, endDate: null });
      return;
    }
    const [start, end] = dates;
    onChange({
      startDate: dayjs(start).format("YYYY-MM-DD"),
      endDate: dayjs(end).format("YYYY-MM-DD"),
    });
  };

  return (
    <div>
      <RSuiteDateRangePicker
        value={rsuiteValue}
        onChange={handleChange}
        ranges={predefinedRanges}
        format="dd/MM/yyyy"
        character=" - "
        placeholder="Select Date Range"
        placement="bottomStart"
        shouldDisableDate={(date) => dayjs(date).isAfter(dayjs(), "day")}
        showHeader={false}
        editable={false}
        appearance="default"
        size="md"
        style={{ width: "100%" }}
        popupStyle={{ marginTop: "8px" }}
        cleanable
        renderValue={([start, end]) => {
          const startStr = dayjs(start).format("YYYY-MM-DD");
          const endStr = dayjs(end).format("YYYY-MM-DD");

          const todayStr = dayjs().format("YYYY-MM-DD");
          const yesterdayStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");
          const sevenDaysAgoStr = dayjs()
            .subtract(6, "day")
            .format("YYYY-MM-DD");
          const thirtyDaysAgoStr = dayjs()
            .subtract(29, "day")
            .format("YYYY-MM-DD");
          const sixtyDaysAgoStr = dayjs()
            .subtract(59, "day")
            .format("YYYY-MM-DD");

          if (startStr === todayStr && endStr === todayStr) {
            return "Today";
          }
          if (startStr === yesterdayStr && endStr === yesterdayStr) {
            return "Yesterday";
          }
          if (startStr === sevenDaysAgoStr && endStr === todayStr) {
            return "Last 7 Days";
          }
          if (startStr === thirtyDaysAgoStr && endStr === todayStr) {
            return "Last 30 Days";
          }
          if (startStr === sixtyDaysAgoStr && endStr === todayStr) {
            return "Last 60 Days";
          }

          // Explicitly show "Custom" when user picks a non-preset range
          return `${dayjs(start).format("DD/MM/YYYY")} - ${dayjs(end).format("DD/MM/YYYY")}`;
        }}
      />
    </div>
  );
}
