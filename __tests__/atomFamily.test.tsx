import LeakDetector from 'jest-leak-detector'
import { atom } from 'jotai/vanilla'
import { atomFamily } from '../src/atomFamily'

test('atomFamily memoizes atoms to keys', () => {
  const testAtomFamily = atomFamily(atom)
  const atom1a = testAtomFamily(1)
  const atom2a = testAtomFamily(2)
  const atom1b = testAtomFamily(1)
  const atom2b = testAtomFamily(2)
  expect(atom1a === atom1b).toBe(true)
  expect(atom2a === atom2b).toBe(true)
  expect(atom1a === atom2a).toBe(false)
})

test('atomFamily uses hash function', () => {
  const hashFn = jest.fn((key: number) => key % 2)
  const testAtomFamily = atomFamily(atom, hashFn)

  const atom1 = testAtomFamily(1)
  expect(hashFn).toHaveBeenNthCalledWith(1, 1)

  const atom2 = testAtomFamily(2)
  expect(hashFn).toHaveBeenNthCalledWith(2, 2)

  const atom3 = testAtomFamily(3)
  expect(hashFn).toHaveBeenNthCalledWith(3, 3)

  const atom4 = testAtomFamily(4)
  expect(hashFn).toHaveBeenNthCalledWith(4, 4)

  expect(atom1 === atom3).toBe(true)
  expect(atom2 === atom4).toBe(true)
  expect(atom1 === atom2).toBe(false)
})

const TIMEOUT = 10_000
test(
  'atomFamily does not leak memory',
  async () => {
    const testAtomFamily = atomFamily(atom)
    let atom1: any = testAtomFamily(1)
    const detector = new LeakDetector(atom1)
    atom1 = undefined
    await waitFor(() => {
      global.gc?.()
      return detector.isLeaking()
    }, TIMEOUT)
    expect(await detector.isLeaking()).toBe(false)
  },
  TIMEOUT
)

function waitFor(
  condition: () => Promise<boolean> | boolean,
  timeout = 1000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const interval = setInterval(async () => {
      if (await condition()) {
        clearInterval(interval)
        resolve()
      } else if (Date.now() - start > timeout) {
        clearInterval(interval)
        reject(new Error('timeout'))
      }
    }, 10)
  })
}
