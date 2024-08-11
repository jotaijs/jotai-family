import type { Atom } from 'jotai/vanilla'

export type AtomFamily<Param, AtomType> = (param: Param) => AtomType

export function atomFamily<Key, AtomType extends Atom<unknown>>(
  initializeAtom: (key: Key) => AtomType,
  hashFn: (k: Key) => Key = (k) => k
) {
  const map = new Map<unknown, WeakRef<AtomType>>()
  const finalizationRegistry = new FinalizationRegistry((hash: Key) => {
    map.delete(hash)
  })

  return function createAtom(key: Key): AtomType {
    const hash = hashFn(key)
    const existing = map.get(hash)
    if (!existing) {
      const atom = initializeAtom(key)
      const weakRef = new WeakRef(atom)
      finalizationRegistry.register(weakRef, hash, weakRef)
      map.set(hash, weakRef)
      return atom
    }
    let deref = existing.deref()
    if (!deref) {
      deref = initializeAtom(key)
      const weakRef = new WeakRef(deref)
      map.set(hash, weakRef)
      finalizationRegistry.register(weakRef, hash, weakRef)
    }
    return deref
  }
}
