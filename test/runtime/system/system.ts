import { Ok, Fail } from '../compiler/validate'
import { Assert } from '../assert/index'
import { TypeSystem } from '@sinclair/typebox/system'
import { Type } from '@sinclair/typebox'

describe('system/TypeSystem/AllowNaN', () => {
  before(() => {
    TypeSystem.AllowNaN = true
  })
  after(() => {
    TypeSystem.AllowNaN = false
  })
  // ---------------------------------------------------------------
  // Number
  // ---------------------------------------------------------------
  it('Should validate number with NaN', () => {
    const T = Type.Number()
    Ok(T, NaN)
  })

  // ---------------------------------------------------------------
  // Integer
  //
  // Note: The Number.isInteger() test will fail for NaN. Because
  // of this we cannot reasonably override NaN handling for integers.
  // ---------------------------------------------------------------
  it('Should not validate integer with NaN', () => {
    const T = Type.Integer()
    Fail(T, NaN)
  })
})

describe('system/TypeSystem/AllowArrayObjects', () => {
  before(() => {
    TypeSystem.AllowArrayAsObject = true
  })
  after(() => {
    TypeSystem.AllowArrayAsObject = false
  })
  // ---------------------------------------------------------------
  // Object
  // ---------------------------------------------------------------
  it('Should validate arrays with empty objects', () => {
    const T = Type.Object({})
    Ok(T, [0, 1, 2])
  })
  it('Should validate arrays with objects with length property', () => {
    const T = Type.Object({ length: Type.Number() })
    Ok(T, [0, 1, 2])
  })
  it('Should validate arrays with objects with additionalProperties false when array has no elements', () => {
    const T = Type.Object({ length: Type.Number() }, { additionalProperties: false })
    Ok(T, [])
  })
  it('Should not validate arrays with objects with additionalProperties false when array has elements', () => {
    const T = Type.Object({ length: Type.Number() }, { additionalProperties: false })
    Fail(T, [0, 1, 2])
  })
  it('Should not validate arrays with objects when length property is string', () => {
    const T = Type.Object({ length: Type.String() })
    Fail(T, [0, 1, 2])
  })
  // ---------------------------------------------------------------
  // Record
  // ---------------------------------------------------------------
  it('Should validate arrays as Records with String Keys', () => {
    const T = Type.Record(Type.String(), Type.Number())
    Ok(T, [0, 1, 2])
  })
  it('Should not validate arrays as Records with Number Keys', () => {
    const T = Type.Record(Type.Integer(), Type.Number())
    Fail(T, [0, 1, 2])
  })
  it('Should not validate arrays as Records with Object Values', () => {
    const T = Type.Record(
      Type.String(),
      Type.Object({
        x: Type.Number(),
        y: Type.Number(),
        z: Type.Number(),
      }),
    )
    Ok(T, [
      { x: 1, y: 1, z: 1 },
      { x: 1, y: 1, z: 1 },
      { x: 1, y: 1, z: 1 },
    ])
  })
})

describe('system/TypeSystem/CreateFormat', () => {
  it('Should create and validate a format', () => {
    TypeSystem.CreateFormat('CreateFormat0', (value) => value === value.toLowerCase())
    const T = Type.String({ format: 'CreateFormat0' })
    Ok(T, 'action')
    Fail(T, 'ACTION')
  })
  it('Should throw if registering the same format twice', () => {
    TypeSystem.CreateFormat('CreateFormat1', (value) => true)
    Assert.throws(() => TypeSystem.CreateFormat('CreateFormat1', (value) => true))
  })
})

describe('system/TypeSystem/CreateType', () => {
  it('Should create and validate a type', () => {
    type BigNumberOptions = { minimum?: bigint; maximum?: bigint }
    const BigNumber = TypeSystem.CreateType<bigint, BigNumberOptions>('CreateType0', (options, value) => {
      if (typeof value !== 'bigint') return false
      if (options.maximum !== undefined && value > options.maximum) return false
      if (options.minimum !== undefined && value < options.minimum) return false
      return true
    })
    const T = BigNumber({ minimum: 10n, maximum: 20n })
    Ok(T, 15n)
    Fail(T, 5n)
    Fail(T, 25n)
  })
  it('Should throw if registering the same type twice', () => {
    TypeSystem.CreateType('CreateType1', () => true)
    Assert.throws(() => TypeSystem.CreateType('CreateType1', () => true))
  })
})
