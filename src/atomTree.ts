import { Atom } from 'jotai'

type Node<AtomType extends Atom<unknown> = Atom<unknown>> = {
  children?: Map<unknown, Node<AtomType>>
  atom?: AtomType
}

type AtomTree<Path extends unknown[], AtomType extends Atom<unknown>> = {
  (path: Path): AtomType
  remove(path?: Path, removeSubTree?: boolean): void
  getSubTree(path?: Path): Node<AtomType>
  getNodePath(path?: Path): Node<AtomType>[]
}

/**
 * Creates a hierarchical structure of Jotai atoms.
 *
 * @template AtomType - The type of atom returned by the initialization function.
 * @param initializePathAtom - A function that takes a path array and returns an Atom.
 * @returns A function for creating and managing hierarchical atoms (with additional methods).
 */
export function atomTree<
  Path extends unknown[],
  AtomType extends Atom<unknown>,
>(initializePathAtom: (path: Path) => AtomType): AtomTree<Path, AtomType> {
  const root: Node<AtomType> = {}
  const defaultPath = [] as unknown[] as Path

  /**
   * Creates or retrieves an atom at the specified path in the hierarchy.
   *
   * @param path - Array of keys representing the location in the hierarchy.
   * @returns The Jotai atom for the specified path.
   */
  const createAtom: AtomTree<Path, AtomType> = (path) => {
    let node = root
    for (const key of path) {
      node.children ??= new Map()
      if (!node.children.has(key)) {
        node.children.set(key, {})
      }
      node = node.children.get(key)!
    }
    node.atom ??= initializePathAtom(path)
    return node.atom
  }

  /**
   * Removes an atom (and optionally its subtree) at the specified path.
   *
   * @param path - Array of keys representing the location in the hierarchy. Defaults to [] (root).
   * @param removeSubTree - If true, removes all children of that path as well. Defaults to false.
   * @throws Error if the path does not exist.
   */
  createAtom.remove = (path = defaultPath, removeSubTree = false) => {
    const nodePath = createAtom.getNodePath(path)
    const node = nodePath[nodePath.length - 1]!
    delete node.atom
    if (removeSubTree) {
      delete node.children
    }
    // delete empty subtrees from bottom to top
    for (let i = nodePath.length - 1; i >= 0; i--) {
      const node = nodePath[i]!
      if (!node.children?.size && i > 0) {
        const parentNode = nodePath[i - 1]!
        parentNode.children!.delete(path[i]!)
        if (!parentNode.children!.size) {
          delete parentNode.children
        }
      } else {
        break
      }
    }
  }

  /**
   * Retrieves the internal node (subtree) at a specified path.
   *
   * @param path - Array of keys representing the location in the hierarchy. Defaults to [] (root).
   * @returns A Node object with possible `children` and `atom`.
   * @throws Error if the path does not exist.
   */
  createAtom.getSubTree = (path = defaultPath) => {
    let node: Node<AtomType> | undefined = root
    for (const key of path) {
      node = node.children?.get(key)
      if (!node) {
        throw new Error('Path does not exist')
      }
    }
    return node
  }

  /**
   * Retrieves the internal node (subtree) at a specified path.
   *
   * @param path - Array of keys representing the location in the hierarchy. Defaults to [] (root).
   * @returns An array of Node objects representing the path.
   * @throws Error if the path does not exist.
   */
  createAtom.getNodePath = (path = defaultPath) => {
    const nodePath = [root]
    let node: Node<AtomType> | undefined = root
    for (const key of path) {
      node = node.children?.get(key)
      if (!node) {
        throw new Error('Path does not exist')
      }
      nodePath.push(node)
    }
    return nodePath
  }

  return createAtom
}
