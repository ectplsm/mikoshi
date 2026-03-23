import { nanoid } from "nanoid";

const PREFIX = "eng_";
const ID_LENGTH = 12;

export function generateEngramId(): string {
  return PREFIX + nanoid(ID_LENGTH);
}
