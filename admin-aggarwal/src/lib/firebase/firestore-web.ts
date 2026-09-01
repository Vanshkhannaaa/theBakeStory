import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as limitFn,
  writeBatch,
  getCountFromServer,
  type QueryConstraint,
  type DocumentReference,
} from "firebase/firestore";
import { getClientDb } from "./client";

class DocRef {
  constructor(
    readonly colName: string,
    readonly id: string,
  ) {}

  get ref(): DocumentReference {
    return doc(getClientDb(), this.colName, this.id);
  }

  async get() {
    const snap = await getDoc(this.ref);
    return {
      id: snap.id,
      exists: snap.exists(),
      data: () => snap.data()!,
      ref: this.ref,
    };
  }

  set(data: object, opts?: { merge?: boolean }) {
    return opts ? setDoc(this.ref, data, opts) : setDoc(this.ref, data);
  }

  update(data: object) {
    return updateDoc(this.ref, data as Record<string, unknown>);
  }

  delete() {
    return deleteDoc(this.ref);
  }
}

export class QueryBuilder {
  constructor(
    private colName: string,
    private constraints: QueryConstraint[] = [],
  ) {}

  where(field: string, op: "==", value: unknown) {
    return new QueryBuilder(this.colName, [...this.constraints, where(field, op as "==", value)]);
  }

  orderBy(field: string, dir: "asc" | "desc" = "asc") {
    return new QueryBuilder(this.colName, [...this.constraints, orderBy(field, dir)]);
  }

  limit(n: number) {
    return new QueryBuilder(this.colName, [...this.constraints, limitFn(n)]);
  }

  async get() {
    const snap = await getDocs(query(collection(getClientDb(), this.colName), ...this.constraints));
    return {
      empty: snap.empty,
      size: snap.size,
      docs: snap.docs.map((d) => ({
        id: d.id,
        data: () => d.data(),
        ref: doc(getClientDb(), this.colName, d.id),
      })),
    };
  }
}

export const adminDb = {
  collection(name: string) {
    return {
      doc(id?: string) {
        if (!id) {
          const generated = doc(collection(getClientDb(), name));
          return new DocRef(name, generated.id);
        }
        return new DocRef(name, id);
      },
      where(field: string, op: "==", value: unknown) {
        return new QueryBuilder(name).where(field, op, value);
      },
      orderBy(field: string, dir: "asc" | "desc" = "asc") {
        return new QueryBuilder(name).orderBy(field, dir);
      },
      get() {
        return new QueryBuilder(name).get();
      },
      count() {
        return {
          async get() {
            const snap = await getCountFromServer(collection(getClientDb(), name));
            return { data: () => ({ count: snap.data().count }) };
          },
        };
      },
    };
  },
  batch() {
    const batch = writeBatch(getClientDb());
    return {
      update(ref: DocRef | DocumentReference, data: object) {
        const target = ref instanceof DocRef ? ref.ref : ref;
        batch.update(target, data as Record<string, unknown>);
      },
      set(ref: DocRef | DocumentReference, data: object, opts?: { merge?: boolean }) {
        const target = ref instanceof DocRef ? ref.ref : ref;
        if (opts) batch.set(target, data, opts);
        else batch.set(target, data);
      },
      commit: () => batch.commit(),
    };
  },
  async getAll(...refs: DocRef[]) {
    return Promise.all(refs.map((ref) => ref.get()));
  },
};
