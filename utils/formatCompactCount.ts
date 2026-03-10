export default function formatCompactCount(value: number) {
  const sign = value < 0 ? "-" : "";
  let absoluteValue = Math.abs(value);

  if (absoluteValue < 1000) {
    return `${value}`;
  }

  const suffixes = ["k", "m", "b"];
  let suffixIndex = -1;

  while (absoluteValue >= 1000 && suffixIndex < suffixes.length - 1) {
    absoluteValue /= 1000;
    suffixIndex++;
  }

  if (absoluteValue >= 1000 && suffixIndex === suffixes.length - 1) {
    return `${sign}${Math.round(absoluteValue)}${suffixes[suffixIndex]}`;
  }

  const fractionDigits = absoluteValue < 100 ? 1 : 0;
  const roundedValue = Number(absoluteValue.toFixed(fractionDigits));

  if (roundedValue >= 1000 && suffixIndex < suffixes.length - 1) {
    const nextValue = roundedValue / 1000;
    const nextFractionDigits = nextValue < 100 ? 1 : 0;
    return `${sign}${nextValue.toFixed(nextFractionDigits).replace(/\.0$/, "")}${suffixes[suffixIndex + 1]}`;
  }

  return `${sign}${roundedValue.toFixed(fractionDigits).replace(/\.0$/, "")}${suffixes[suffixIndex]}`;
}
