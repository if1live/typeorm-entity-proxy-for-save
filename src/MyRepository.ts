import {
  Repository,
  ObjectLiteral,
} from 'typeorm';

export class MyRepository<T extends ObjectLiteral> extends Repository<T> {
  public async customSave(proxy: EntityProxy<T>) {
    const { inner, diff } = proxy;
    if (!diff) { return; }

    const id = this.getId(inner);
    await this.update(id, diff);
  }
}

function createPartialEntity<T>(
  ent: T,
  iter: IterableIterator<keyof T>,
): Partial<T> {
  const data: Partial<T> = {};
  for (const f of iter) {
    data[f] = ent[f];
  };
  return data;
}

function extractColumns<T>(ent: T): string[] {
  return Object.keys(ent).filter(propertyName => {
    const keys = Reflect.getMetadataKeys(ent, propertyName);
    // https://github.com/typeorm/typeorm/blob/master/src/decorator/columns/Column.ts#L114
    return keys.includes('design:type');
  });
}

export class EntityProxy<T> {
  private readonly fields = new Set<keyof T>();

  constructor(public readonly inner: T) {
    const columns = extractColumns(inner);
    for (const p of columns) {
      this.defineProperty(p);
    }
  }

  public get diff(): Partial<T> | undefined {
    if (!this.fields.size) { return; }
    const iter = this.fields[Symbol.iterator]();
    const data = createPartialEntity(this.inner, iter);
    this.fields.clear();
    return data;
  }

  public defineProperty(p: string) {
    Object.defineProperty(this, p, {
      get() { return this.inner[p]; },
      set(newValue) {
        this.fields.add(p);
        this.inner[p] = newValue;
      },
    })
  }

  public static create<T>(ent: T): EntityProxy<T> & T {
    const proxy = new EntityProxy<T>(ent);
    return proxy as any;
  }
}
