import React from 'react'
import { atom, useAtom } from 'jotai'
import { atomFamily } from 'jotai-family'

const testAtomFamily = atomFamily((_key: number) => atom(''))

function Row({ index }: { index: number }) {
  const [text, setText] = useAtom(testAtomFamily(index))
  return (
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
      style={{ width: 100, textOverflow: 'ellipsis' }}
    />
  )
}

export function App() {
  const [count, setCount] = React.useState(5)
  return (
    <div>
      <h1>atomFamily</h1>
      <div>
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          Add Row
        </button>
      </div>
      <ul>
        {Array.from({ length: count }, (_, i) => (
          <li key={Number(i)}>
            <Row index={i} />
          </li>
        ))}
      </ul>
    </div>
  )
}
