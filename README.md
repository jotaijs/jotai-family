# atomFamily

[jotai-family](https://github.com/jotaijs/jotai-family) is a package for atom collections.

## Parameters

```js
declare function atomFamily<Param, AtomType>(
  initializeAtom: (param: Param) => AtomType,
  hashFn?: (a: Param) => any
): (param: Param) => AtomType
```

## Usage

```js
import { atomFamily } from 'jotai-family'

const fooFamily = atomFamily((param) => atom(param))
const fooAtom = fooFamily('foo')
```

This will create a function that takes `param` and returns an atom. If the atom has already been created, it will be returned from the cache.

### Hash Function

The `hashFn` is used to map the `param` to a key in the cache. By default, it uses the `param` as the key. If you want to use a custom key, you can provide a `hashFn` function.
  
```js
const fooFamily = atomFamily((param) => atom(param), (param) => param.id)
const fooAtom = fooFamily({ id: 'foo' })
```

<CodeSandbox id="huxd4i" />

## Why use `atomFamily`?

Using `atomFamily` is a good way to manage a collection of atoms. It is useful for when you need to create atoms dynamically, for example when you have a list of items and you want to create an atom for each item. 

## Memory Safe

The new `atomFamily` does not suffer from memory leaks. Internally it uses `Map<any, WeakRef<AtomType>>` to store atoms. 
When the atom is garbage collected, the entry will be removed from the map automatically.
