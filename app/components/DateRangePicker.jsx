/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from "react";
import { DateRangePicker as RSuiteDateRangePicker } from "rsuite";
import dayjs from "dayjs";
import { useTranslation } from "../context/TranslationContext";

export default function DateRangePicker({ value, onChange }) {
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useTranslation();

  const predefinedRanges = useMemo(
    () => [
      {
        label: t("dateRangePicker.today"),
        value: [dayjs().startOf("day").toDate(), dayjs().endOf("day").toDate()],
      },
      {
        label: t("dateRangePicker.yesterday"),
        value: [
          dayjs().subtract(1, "day").startOf("day").toDate(),
          dayjs().subtract(1, "day").endOf("day").toDate(),
        ],
      },
      {
        label: t("dateRangePicker.last7Days"),
        value: [
          dayjs().subtract(6, "day").startOf("day").toDate(),
          dayjs().endOf("day").toDate(),
        ],
      },
      {
        label: t("dateRangePicker.last30Days"),
        value: [
          dayjs().subtract(29, "day").startOf("day").toDate(),
          dayjs().endOf("day").toDate(),
        ],
      },
      {
        label: t("dateRangePicker.lastMonth"),
        value: [
          dayjs().subtract(1, "month").startOf("month").toDate(),
          dayjs().subtract(1, "month").endOf("month").toDate(),
        ],
      },
      {
        label: t("dateRangePicker.last60Days"),
        value: [
          dayjs().subtract(59, "day").startOf("day").toDate(),
          dayjs().endOf("day").toDate(),
        ],
      },
    ],
    [t],
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Convert external { startDate, endDate } format to rsuite's [Date, Date] format
  const rsuiteValue =
    value?.startDate && value?.endDate
      ? [new Date(value.startDate), new Date(value.endDate)]
      : value?.startDate
        ? [new Date(value.startDate), new Date(value.startDate)]
        : null;

  const handleChange = (dates) => {
    if (!dates) {
      onChange({
        startDate: null,
        endDate: null,
      });
      return;
    }

    const [start, end] = dates;

    onChange({
      startDate: dayjs(start).format("YYYY-MM-DD"),
      endDate: dayjs(end).format("YYYY-MM-DD"),
    });
  };

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <RSuiteDateRangePicker
        value={rsuiteValue}
        onChange={handleChange}
        ranges={isMobile ? predefinedRanges.slice(0, 3) : predefinedRanges}
        format="dd/MM/yyyy"
        character=" - "
        placeholder={t("dateRangePicker.selectDateRange")}
        placement="bottomEnd"
        shouldDisableDate={(date) => dayjs(date).isAfter(dayjs(), "day")}
        showHeader={false}
        editable={false}
        appearance="default"
        size="md"
        cleanable
        showOneCalendar={isMobile}
        style={{
          width: "100%",
          minWidth: 0,
        }}
        popupStyle={{
          marginTop: 8,
          maxWidth: "calc(100vw - 16px)",
          zIndex: 99999,
        }}
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

          const lastMonthStartStr = dayjs()
            .subtract(1, "month")
            .startOf("month")
            .format("YYYY-MM-DD");

          const lastMonthEndStr = dayjs()
            .subtract(1, "month")
            .endOf("month")
            .format("YYYY-MM-DD");

          if (startStr === todayStr && endStr === todayStr) {
            return t("dateRangePicker.today");
          }

          if (startStr === yesterdayStr && endStr === yesterdayStr) {
            return t("dateRangePicker.yesterday");
          }

          if (startStr === sevenDaysAgoStr && endStr === todayStr) {
            return t("dateRangePicker.last7Days");
          }

          if (startStr === thirtyDaysAgoStr && endStr === todayStr) {
            return t("dateRangePicker.last30Days");
          }

          if (startStr === lastMonthStartStr && endStr === lastMonthEndStr) {
            return t("dateRangePicker.lastMonth");
          }

          if (startStr === sixtyDaysAgoStr && endStr === todayStr) {
            return t("dateRangePicker.last60Days");
          }

          return isMobile
            ? `${dayjs(start).format("DD/MM")} - ${dayjs(end).format("DD/MM")}`
            : `${dayjs(start).format("DD/MM/YYYY")} - ${dayjs(end).format("DD/MM/YYYY")}`;
        }}
      />
    </div>
  );
}
