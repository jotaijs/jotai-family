import type { Atom } from 'jotai/vanilla'

export type AtomFamily<Param, AtomType> = (param: Param) => AtomType

// setInterval(() => {
//   for (const entry of maps) {
//     const map = entry.deref()
//     if (!map) {
//       maps.delete(entry)
//       continue
//     }
//     for (const [k, v] of map.entries()) {
//       if (!v.deref()) {
//         map.delete(k)
//       }
//     }
//   }
// }, 10_000)

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
      const atom = initializeAtom(hash)
      const weakRef = new WeakRef(atom)
      finalizationRegistry.register(weakRef, hash, weakRef)
      map.set(key, weakRef)
      return atom
    }
    let deref = existing.deref()
    if (!deref) {
      const newRef = initializeAtom(hash)
      deref = newRef
      const weakRef = new WeakRef(newRef)
      map.set(key, weakRef)
      finalizationRegistry.register(weakRef, hash, weakRef)
    }
    return deref
  }
}
