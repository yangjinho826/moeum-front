import { useMediaQuery } from "@mantine/hooks";

/**
 * 마우스 같은 정밀 포인터 기기인지.
 *
 * 터치 기기에서 `searchable` Select 를 누르면 키보드가 떠 드롭다운을 가리므로
 * 검색은 이 값이 true 일 때만 켠다. 첫 렌더는 false(터치 기준)라 SSR 과 일치.
 */
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");
