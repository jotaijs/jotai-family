# atomFamily

[jotai-family](https://github.com/jotaijs/jotai-family) is a package for atom collections.

### Usage

```js
atomFamily(initializeAtom, areEqual): (param) => Atom
```

This will create a function that takes `param` and returns an atom.
If the atom has already been created, it will be returned from the cache.
`initializeAtom` is a function that can return any kind of atom (`atom()`, `atomWithDefault()`, ...).
Note that the `areEqual` argument is optional and compares
if two params are equal (defaults to `Object.is`).

To reproduce behavior similar to [Recoil's atomFamily/selectorFamily](https://recoiljs.org/docs/api-reference/utils/atomFamily),
specify a deepEqual function to `areEqual`. For example:

```js
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import deepEqual from 'fast-deep-equal'

const fooFamily = atomFamily((param) => atom(param), deepEqual)
```

### TypeScript

The atom family types will be inferred from initializeAtom. Here's a typical usage with a primitive atom.

```ts
import type { PrimitiveAtom } from 'jotai'

/**
 * here the atom(id) returns a PrimitiveAtom<number>
 * and PrimitiveAtom<number> is a WritableAtom<number, SetStateAction<number>>
 */
const myFamily = atomFamily((id: number) => atom(id)).
```

You can explicitly declare the type of parameter, value, and atom's setState function using TypeScript generics.

```ts
atomFamily<Param, Value, Update>(initializeAtom: (param: Param) => WritableAtom<Value, Update>, areEqual?: (a: Param, b: Param) => boolean)
atomFamily<Param, Value>(initializeAtom: (param: Param) => Atom<Value>, areEqual?: (a: Param, b: Param) => boolean)
```

If you want to explicitly declare the atomFamily for a primitive atom, you need to use `SetStateAction`.

```ts
type SetStateAction<Value> = Value | ((prev: Value) => Value)

const myFamily = atomFamily<number, number, SetStateAction<number>>(
  (id: number) => atom(id),
)
```

### Caveat: Memory Leaks

Internally, atomFamily is just a Map whose key is a param and whose value is an atom config.
Unless you explicitly remove unused params, this leads to memory leaks.
This is crucial if you use infinite number of params.

There are two ways to remove params.

- `myFamily.remove(param)` allows you to remove a specific param.
- `myFamily.setShouldRemove(shouldRemove)` is to register `shouldRemove` function which runs immediately **and** when you are to get an atom from a cache.
  - shouldRemove is a function that takes two arguments `createdAt` in milliseconds and `param`, and returns a boolean value.
  - setting `null` will remove the previously registered function.

### Examples

```js
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

const todoFamily = atomFamily((name) => atom(name))

todoFamily('foo')
// this will create a new atom('foo'), or return the one if already created
```

```js
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

const todoFamily = atomFamily((name) =>
  atom(
    (get) => get(todosAtom)[name],
    (get, set, arg) => {
      const prev = get(todosAtom)
      set(todosAtom, { ...prev, [name]: { ...prev[name], ...arg } })
    },
  ),
)
```

```js
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

const todoFamily = atomFamily(
  ({ id, name }) => atom({ name }),
  (a, b) => a.id === b.id,
)
```

### Codesandbox

<CodeSandbox id="huxd4i" />

---

## atomTree

The **atomTree** utility provides a hierarchical way to create, reuse, and remove Jotai atoms. Each atom is associated with a unique path, which is an array of unknown types. When you request the same path multiple times, `atomTree` ensures that the same atom instance is returned. You can also remove a specific atom or an entire subtree of atoms when they are no longer needed.

Use `atomTree` when you anticipate a large number of potential paths and want to:

- **Reuse the same atom** for repeated paths.  
- **Clean up** unwanted atoms easily, including entire subtrees.

```js
import { atom } from 'jotai'
import { atomTree } from 'jotai-family'

// Create a tree instance, passing a factory function
// that takes a path array and returns a new atom.
const tree = atomTree((path) => atom(path.join('-')))

// Create or retrieve the atom at ['foo', 'bar']
const atomA = tree(['foo', 'bar'])
const atomB = tree(['foo', 'bar'])

// atomA and atomB are the same instance.
console.log(atomA === atomB) // true

// Remove the atom at ['foo', 'bar']
// (and optionally remove its entire subtree)
tree.remove(['foo', 'bar'])
```

### API

#### Creating the tree

Creates a new hierarchical tree of Jotai atoms. It accepts a **initializePathAtom** function that receives a path array and returns an atom. The returned function can be used to create, retrieve, and remove atoms at specific paths.

```ts
function atomTree<Path, AtomType>(
  initializePathAtom: (path: Path) => AtomType
): {
  (path: Path): AtomType
  remove(path: Path, removeSubTree?: boolean): void
  getSubTree(path: Path): Node<AtomType> | undefined
  getNodePath(path: Path): Node<AtomType>[]
}

type Node<AtomType> = {
  atom?: AtomType
  children?: Map<PathSegment, Node<AtomType>>
}
```

### Creating Path Atoms
```ts
tree(path: Path): AtomType
```
Creates (or retrieves) an atom at the specified path. Subsequent calls with the same path return the same atom instance.

### Removing Path Atoms
```ts
tree.remove(path: Path, removeSubTree = false): void
```
Removes the atom at the specified path. If `removeSubTree` is `true`, all child paths under that path are also removed.

This method removes the atom at the specified path. If `removeSubTree` is `true`, it also removes all child paths under that path.

### Retrieving A Subtree
```ts
tree.getSubTree(path: Path): Node<AtomType> | undefined
```

Retrieves the internal node representing the specified path. This is useful for inspecting the tree structure. The node structure is as follows:

```ts
type Node<AtomType> = {
  atom?: AtomType
  children?: Map<PathSegment, Node<AtomType>>
}
```

### Retrieving A Node Path
```ts
tree.getNodePath(path: Path): Node<AtomType>[]
```
Returns an array of node objects from the root node to the node at the specified path, inclusive.

## Usage Example

```js
import { atom } from 'jotai'
import { atomTree } from 'jotai-family'

const btree = atomTree((path) => atom(`Data for path: ${path}`))

// Create or retrieve the atom at [true, false]
const userAtom = btree([true, false])

console.log(store.get(userAtom)) // 'Data for path: true,false'

// Remove the atom (and optionally remove its subtree)
btree.remove([true,false])
```
