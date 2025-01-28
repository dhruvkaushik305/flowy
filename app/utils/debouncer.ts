let timer: NodeJS.Timeout | null = null;

export default function debouncer(fn: (...args: any[]) => void, time: number) {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(fn, time);
}
