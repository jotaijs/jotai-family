import { atom, createStore } from 'jotai/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { atomTree } from '../src/atomTree'

describe('atomTree', () => {
  it('creates atoms at a given path', function test() {
    const store = createStore()
    const initializeAtom = vi.fn((path: number[]) => atom(path.join('-')))
    const tree = atomTree(initializeAtom)

    const atomA = tree([1, 2, 3])
    expect(initializeAtom).toHaveBeenCalledTimes(1)
    expect(store.get(atomA)).toBe('1-2-3')

    const atomB = tree([1, 2, 3])
    expect(initializeAtom).toHaveBeenCalledTimes(1)
    // Should return the same atom instance if called with the same path
    expect(atomA).toBe(atomB)
    expect(store.get(atomB)).toBe('1-2-3')

    const atomC = tree([1, 3])
    expect(initializeAtom).toHaveBeenCalledTimes(2)
    expect(store.get(atomC)).toBe('1-3')
  })

  it('removes an atom at a given path', function test() {
    const store = createStore()
    const initializeAtom = (path: (number | string)[]) => atom(path.join('-'))
    const tree = atomTree(initializeAtom)

    // Create an atom
    const myAtom = tree([1, 'test'])
    expect(store.get(myAtom)).toBe('1-test')

    // Remove it
    tree.remove([1, 'test'])
    // Re-creating should yield a new atom
    const newAtom = tree([1, 'test'])
    expect(newAtom).not.toBe(myAtom)
  })

  it('removes an atom subtree correctly', function test() {
    const store = createStore()
    const initializeAtom = (path: string[]) => atom(path.join('-'))
    const tree = atomTree(initializeAtom)

    const atomA = tree(['parent', 'childA'])
    expect(store.get(atomA)).toBe('parent-childA')

    const atomB = tree(['parent', 'childB'])
    expect(store.get(atomB)).toBe('parent-childB')

    // Remove whole subtree under 'parent'
    tree.remove(['parent'], true)

    // Re-create them; they should be new atoms
    const atomA2 = tree(['parent', 'childA'])
    const atomB2 = tree(['parent', 'childB'])
    expect(atomA2).not.toBe(atomA)
    expect(atomB2).not.toBe(atomB)
  })

  it('throws if path does not exist when removing without prior creation', () => {
    const tree = atomTree((path) => atom(path.join('-')))
    expect(() => tree.remove(['nonexistent'])).toThrowError(
      'Path does not exist'
    )
  })

  it('retrieves subtree node correctly', function test() {
    const store = createStore()
    const tree = atomTree((path: string[]) => atom(path.join('-')))

    const myAtom = tree(['foo', 'bar'])
    expect(store.get(myAtom)).toBe('foo-bar')

    // getSubTree should give us the correct node
    const subTree = tree.getSubTree(['foo', 'bar'])
    expect(subTree.atom).toBe(myAtom)
  })

  it('throws when retrieving subtree that does not exist', function test() {
    const tree = atomTree((path: string[]) => atom(path.join('-')))
    expect(() => tree.getSubTree(['no', 'such', 'thing'])).toThrowError(
      'Path does not exist'
    )
  })

  it('retrieves the node path correctly', function test() {
    const tree = atomTree((path) => atom(path.join('-')))

    tree(['branch', 'leaf'])
    const nodePath = tree.getNodePath(['branch', 'leaf'])
    expect(nodePath).toHaveLength(3)
    expect(nodePath[0]!.children?.has('branch')).toBe(true)
    expect(nodePath[1]!.children?.has('leaf')).toBe(true)
    expect(nodePath[2]!.atom).toBeDefined()
  })

  it('throws when retrieving node path that does not exist', function test() {
    const tree = atomTree((path: unknown[]) => atom(path.join('-')))
    expect(() => tree.getNodePath(['no', 'such', 'thing'])).toThrowError(
      'Path does not exist'
    )
  })
})
