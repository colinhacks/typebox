import { Type } from '@sinclair/typebox'
import { Ok, Fail } from './validate'

describe('type/compiler/Literal', () => {
  it('Should validate literal number', () => {
    const T = Type.Literal(42)
    Ok(T, 42)
  })
  it('Should validate literal string', () => {
    const T = Type.Literal('hello')
    Ok(T, 'hello')
  })

  it('Should validate literal boolean', () => {
    const T = Type.Literal(true)
    Ok(T, true)
  })

  it('Should not validate invalid literal number', () => {
    const T = Type.Literal(42)
    Fail(T, 43)
  })
  it('Should not validate invalid literal string', () => {
    const T = Type.Literal('hello')
    Fail(T, 'world')
  })
  it('Should not validate invalid literal boolean', () => {
    const T = Type.Literal(false)
    Fail(T, true)
  })

  it('Should validate literal union', () => {
    const T = Type.Union([Type.Literal(42), Type.Literal('hello')])
    Ok(T, 42)
    Ok(T, 'hello')
  })

  it('Should not validate invalid literal union', () => {
    const T = Type.Union([Type.Literal(42), Type.Literal('hello')])
    Fail(T, 43)
    Fail(T, 'world')
  })
})
