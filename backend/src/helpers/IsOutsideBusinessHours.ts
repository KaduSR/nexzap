import { Op } from "sequelize";
import { Setting } from "../database/models/Setting.model";

const isOutsideBusinessHours = async (): Promise<boolean> => {
  const settings = await (Setting as any).findAll({
    where: {
      key: {
        [Op.like]: "business_hours_%",
      },
    },
  });

  const getSettingValue = (key: string, defaultValue: string) => {
    const setting = settings.find((s: any) => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  const checkHours =
    getSettingValue("business_hours_check", "false") === "true";
  if (!checkHours) return false;

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  const dayMapping: { [key: number]: string } = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };
  const currentDayKey = dayMapping[dayOfWeek];

  const isDayActive =
    getSettingValue(`business_hours_${currentDayKey}_active`, "true") ===
    "true";
  if (!isDayActive) return true; // It's a day off

  const startTimeStr = getSettingValue(
    `business_hours_${currentDayKey}_start`,
    "08:00"
  );
  const endTimeStr = getSettingValue(
    `business_hours_${currentDayKey}_end`,
    "18:00"
  );

  const [startHour, startMinute] = startTimeStr.split(":").map(Number);
  const [endHour, endMinute] = endTimeStr.split(":").map(Number);

  const start = new Date();
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date();
  end.setHours(endHour, endMinute, 0, 0);

  return now < start || now > end;
};

export default isOutsideBusinessHours;
