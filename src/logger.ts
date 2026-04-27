const BLUE = "\x1b[34m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

const timestamp = () => new Date().toISOString();

export const info = (message: string): void => {
  console.log(`${BLUE}[INFO]${RESET} ${timestamp()} ${message}`);
};

export const error = (message: string): void => {
  console.error(`${RED}[ERROR]${RESET} ${timestamp()} ${message}`);
};
