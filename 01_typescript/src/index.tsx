import React from 'react'
import { createRoot } from 'react-dom/client'
// @ts-expect-error TODO: we should not need to specifiy the .tsx extension
import { App } from './App.tsx'

const ele = document.getElementById('app')
if (ele) {
  createRoot(ele).render(React.createElement(App))
}
