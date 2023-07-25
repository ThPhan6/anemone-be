function convertDateToTimeZoneJP(date: Date) {
  return new Date(date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
}

export const convertTimeStampToDateTimeJP = (
  timestamp: number,
  hasTime?: boolean,
  onlyHour?: boolean,
  isMMDDHHmm?: boolean,
) => {
  if (!timestamp) {
    return '';
  }

  const date = new Date(Number(timestamp));
  const jpDate = convertDateToTimeZoneJP(date);
  const year = jpDate.getFullYear();
  const month = jpDate.getMonth() + 1;
  const day = jpDate.getDate();

  if (!hasTime) {
    return `${year}年${month}月${day}日`;
  }

  const hours = ('0' + jpDate.getHours()).slice(-2);
  const minutes = ('0' + jpDate.getMinutes()).slice(-2);

  if (onlyHour) {
    return `${year}年${month}月${day}日 ${hours}時`;
  }

  if (isMMDDHHmm) {
    return `${month}月${day}日 ${hours}:${minutes}`;
  }

  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
};

export const convertTimeStampToEndTimeJP = (
  timestampStart: number,
  timestampEnd: number,
  hasTime?: boolean,
  onlyHour?: boolean,
) => {
  if (!timestampStart || !timestampEnd) {
    return '';
  }

  const dateStart = new Date(Number(timestampStart));
  const jpDateStart = convertDateToTimeZoneJP(dateStart);

  const yearStart = jpDateStart.getFullYear();
  const monthStart = jpDateStart.getMonth() + 1;
  const dayStart = jpDateStart.getDate();

  const dateEnd = new Date(Number(timestampEnd));
  const jpDateEnd = convertDateToTimeZoneJP(dateEnd);
  const yearEnd = jpDateEnd.getFullYear();
  const monthEnd = jpDateEnd.getMonth() + 1;
  const dayEnd = jpDateEnd.getDate();

  if (!hasTime) {
    return `${yearEnd}年${monthEnd}月${dayEnd}日`;
  }

  const hours = ('0' + jpDateEnd.getHours()).slice(-2);
  const minutes = ('0' + jpDateEnd.getMinutes()).slice(-2);

  if (yearStart == yearEnd && monthStart == monthEnd && dayStart == dayEnd) {
    if (onlyHour) {
      return `${hours}時`;
    }

    return `${hours}:${minutes}`;
  }

  if (onlyHour) {
    return `${yearEnd}年${monthEnd}月${dayEnd}日 ${hours}時`;
  }

  return `${yearEnd}年${monthEnd}月${dayEnd}日 ${hours}:${minutes}`;
};
