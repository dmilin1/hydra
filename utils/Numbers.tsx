export default class Numbers {
  num: number;

  constructor(num: number) {
    this.num = num;
  }

  prettyNum(): string {
    // make pretty and show to one decimal point
    if (this.num > 1_000_000_000) {
      return `${(this.num / 1_000_000_000).toFixed(1)}B`;
    } else if (this.num > 1_000_000) {
      return `${(this.num / 1_000_000).toFixed(1)}M`;
    } else if (this.num > 1_000) {
      return `${(this.num / 1_000).toFixed(1)}K`;
    } else {
      return `${this.num}`;
    }
  }
}
