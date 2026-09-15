import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const KST = "Asia/Seoul";

/** KST 기준 dayjs 객체 — 시간 연산의 모든 진입점 */
export const nowKst = () => dayjs().tz(KST);

/** "YYYY-MM-DD" — KST 기준 오늘 */
export const todayIsoKst = (): string => nowKst().format("YYYY-MM-DD");

/** "YYYY-MM" — KST 기준 이번 달 */
export const currentYearMonthKst = (): string => nowKst().format("YYYY-MM");

/** "YYYY-MM-DD" — KST 기준 그달 1일 (deltaMonths 옵션) */
export const firstDayOfMonthKst = (deltaMonths = 0): string =>
  nowKst().add(deltaMonths, "month").startOf("month").format("YYYY-MM-DD");

/** "YYYY-MM-DD" — KST 기준 올해 1월 1일 */
export const firstDayOfYearKst = (): string => nowKst().startOf("year").format("YYYY-MM-DD");

/** ISO 8601 timestamp — KST 오프셋 포함 (frstRegDt/lastMdfcnDt 용) */
export const nowIsoKst = (): string => nowKst().format();

/** "YYYY-MM-DD" 문자열을 KST 기준 dayjs 로 안전 파싱 */
export const parseKstDate = (yyyyMmDd: string) => dayjs.tz(yyyyMmDd, KST);
