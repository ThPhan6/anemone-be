export enum ChangedContentPattern {
  pattern1,
  pattern2,
}

export class ChangedInfo {
  private prev: string[];
  private current: string[];
  public isChanged: boolean;

  constructor(
    private name: string,
    prev: string | string[],
    current: string | string[],
    public group: string,
  ) {
    this.prev = Array.isArray(prev) ? prev : [prev];
    this.current = Array.isArray(current) ? current : [current];
    this.isChanged = this.getChangedStatus();
  }

  getChangedStatus(): boolean {
    if (this.prev.length !== this.current.length) {
      return true;
    }

    if (this.prev.length === 0) {
      return false;
    }

    return this.prev.findIndex((v, i) => this.current[i] !== v) > -1;
  }

  getContent(pattern: ChangedContentPattern): string {
    if (!this.isChanged) {
      return '';
    }

    switch (pattern) {
      case ChangedContentPattern.pattern1:
        return this.getContent1();

      case ChangedContentPattern.pattern2:
        return this.getContent2();
    }

    return '';
  }

  private defaultValueIfEmpty(value: string): string {
    return value || '(未入力)';
  }

  private getContentWithType(old: string, current: string): string {
    const tOld = old.trim();
    const tCurrent = current.trim();
    if (tOld === '' && tCurrent !== '') {
      return `   ${current}  追加`;
    }

    if (tOld !== '' && tCurrent === '') {
      return `   ${old}  削除`;
    }

    if (tOld !== tCurrent) {
      return `   ${current}  更新`;
    }

    return `   ${current}  `;
  }

  private getContent1(): string {
    const data = this.getChanged();

    return data.prev.reduce(
      (r, v, i) =>
        r +
        `\n      変更前：${this.defaultValueIfEmpty(v)}  →  変更後：${this.defaultValueIfEmpty(
          data.current[i],
        )}`,
      `    [${this.name}] 変更`,
    );
  }

  private getContent2(): string {
    const data = this.getChanged();

    return data.prev.map((v, i) => this.getContentWithType(v, data.current[i])).join('\n');
  }

  private getChanged(): { prev: string[]; current: string[] } {
    const length = this.current.length - this.prev.length;
    if (length === 0) {
      return { prev: this.prev, current: this.current };
    }

    if (length < 0) {
      return { prev: this.prev, current: [...this.current, ...Array(-length).fill('')] };
    }

    return { prev: [...this.prev, ...Array(length).fill('')], current: this.current };
  }
}

export class ChangeInfoManager {
  private infoList: ChangedInfo[] = [];
  private isChangedResult: { [group: string]: boolean } = {};

  add(name: string, prev: string, current: string, group = ''): ChangedInfo {
    const info = new ChangedInfo(name, prev, current, group);
    this.infoList.push(info);

    return info;
  }

  isChanged(group = ''): boolean {
    if (this.isChangedResult[group] !== undefined) {
      return this.isChangedResult[group];
    }

    if (group === '') {
      this.isChangedResult[group] = this.infoList.findIndex((v) => v.isChanged) > -1;

      return this.isChangedResult[group];
    }

    this.isChangedResult[group] =
      this.infoList.findIndex((v) => v.group === group && v.isChanged) > -1;

    return this.isChangedResult[group];
  }

  getContent(pattern: ChangedContentPattern): string {
    const str = this.infoList.reduce((r, v) => {
      if (v.isChanged) {
        return r + '\n' + v.getContent(pattern);
      }

      return r;
    }, '');

    return str.slice(1);
  }
}
