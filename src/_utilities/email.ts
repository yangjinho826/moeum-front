/**
 * 백엔드 `_EMAIL_RE`(`^[\w\.\-]+@[\w\.\-]+\.\w+$`, 1~255자)와 같은 규칙.
 * Python `\w` 는 유니코드 글자·숫자·밑줄이라 JS 에선 `\p{L}\p{N}_` + u 플래그로 맞춘다.
 * `+` 주소는 백엔드가 거절하므로 여기서도 거절한다(Mantine isEmail 은 통과시킴).
 */
const EMAIL_RE = /^[\p{L}\p{N}_.-]+@[\p{L}\p{N}_.-]+\.[\p{L}\p{N}_]+$/u;

export function isValidEmail(value: string): boolean {
  return value.length >= 1 && value.length <= 255 && EMAIL_RE.test(value);
}
