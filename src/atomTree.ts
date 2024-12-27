import { Atom } from 'jotai'

export function atomTree<Param, AtomType extends Atom<unknown>>(
  initializeAtom: (path: [Param, ...Param[]]) => AtomType
) {
  type Node = { m?: Map<Param, Node>; v?: AtomType }
  const root = new Map<Param, Node>()

  const createAtom = (path: [Param, ...Param[]]): AtomType => {
    if (path.length === 0) {
      throw new Error('Path must have at least one key')
    }
    let current = root
    for (let i = 0; i < path.length; i++) {
      const key = path[i]!
      let node = current.get(key)
      if (!node) {
        node = {}
        current.set(key, node)
      }
      if (i < path.length - 1) {
        current = node.m = new Map()
        continue
      }
      return (node.v = initializeAtom(path))
    }
    throw new Error('Unreachable')
  }
  createAtom.remove = (path: [Param, ...Param[]]) => {
    if (path.length === 0) {
      throw new Error('Path must have at least one key')
    }
    const current = root
    const nodePath: Node[] = []
    for (const segment of path) {
      const node = current.get(segment)
      if (!node) {
        break
      }
      nodePath.push(node)
    }
    delete nodePath[nodePath.length - 1]!.v
    // delete empty subtrees
    for (let i = nodePath.length - 1; i >= 0; i--) {
      const current = nodePath[i]!
      if (current.m?.size === 0 && i > 0) {
        nodePath[i - 1]!.m!.delete(path[i]!)
      } else {
        break
      }
    }
  }
  return createAtom
}
