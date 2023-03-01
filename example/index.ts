import { Type, Kind, Static, Modifier, TSchema, SchemaOptions, IntersectReduce, IntersectEvaluate, TObject, TProperties, TNumber, UnionToIntersect } from '@sinclair/typebox'

function Create(value: any): any {
  return value
}
function Clone(value: any): any {
  return value
}


export interface AndOptions extends SchemaOptions {
  unevaluatedProperties?: boolean
}

export interface TAnd<T extends TSchema[] = []> extends TSchema, AndOptions {
  [Kind]: 'And'
  static: IntersectReduce<unknown, IntersectEvaluate<T, []>>
  allOf: T
}

function And<T extends TSchema[] = []>(allOf: T, options: AndOptions = {}): TAnd<T> {
  return { ...options, [Kind]: 'And', allOf } as any as TAnd<T>
}

type ObjectLike = TAnd<TObject[]> | TObject

// -------------------------------------------------------------------------------------
// Normalize
// -------------------------------------------------------------------------------------

export type NormalizeObjectIntersect<T extends TAnd<TObject[]>> = UnionToIntersect<({
  [K in keyof T['allOf']]: T['allOf'][K] extends infer P ? P extends TObject ? P['properties'] : never : never
})[number]> extends infer O ? O extends TProperties ? TObject<O> : never: never

export type NormalizeObject<T extends TObject> = T

export type TNormalize<T> = 
  T extends TAnd<TObject[]> ? NormalizeObjectIntersect<T> : 
  T extends TObject ? NormalizeObject<T> : 
  never

function Normalize<T extends ObjectLike>(schema: T): TNormalize<T> {
  const isOptionalProperty = (schema: TSchema) => (schema[Modifier] && schema[Modifier] === 'Optional') || schema[Modifier] === 'ReadonlyOptional'
  const isIntersect = (schema: ObjectLike): schema is TAnd<TObject[]> => (Kind in schema) && (schema[Kind] === 'And') && schema.allOf.every(object => isObject(object))
  const isObject = (schema: ObjectLike): schema is TObject => (Kind in schema) && schema[Kind] === 'Object'
  if(isObject(schema)) return Clone(schema)
  if(!isIntersect(schema)) throw Error('Error: Unable to normalize to object for non-object type')
  const [required, optional] = [new Set<string>(), new Set<string>()]
  for (const object of schema.allOf) {
    for (const [key, schema] of Object.entries(object.properties)) {
      if (isOptionalProperty(schema)) optional.add(key)
    }
  }
  for (const object of schema.allOf) {
    for (const key of Object.keys(object.properties)) {
      if (!optional.has(key)) required.add(key)
    }
  }
  const properties = {} as Record<string, any>
  for (const object of schema.allOf) {
    for (const [key, schema] of Object.entries(object.properties)) {
      properties[key] = properties[key] === undefined ? schema : { [Kind]: 'Union', anyOf: [properties[key], { ...schema }] }
    }
  }
  const unevaluatedProperties = ('unevaluatedProperties' in schema) ? schema.unevaluatedProperties : true
  const additionalProperties = unevaluatedProperties  ? { } : { additionalProperties: false }
  if (required.size > 0) {
    return Create({ ...additionalProperties, [Kind]: 'Object', type: 'object', properties, required: [...required] })
  } else {
    return Create({ ...additionalProperties, [Kind]: 'Object', type: 'object', properties })
  }
}


type A = TObject<{ x: TNumber }>
type B = TObject<{ y: TNumber }>
type C = TAnd<[A, B]>


type O = NormalizeObjectIntersect<C>

type X = O extends TProperties ? true : false

const A = Type.Object({ 
  a: Type.String()
})
const B = Type.Object({ 
  a: Type.String()
})

const C = And([A, B], { })

const D = Normalize(C)

console.log(JSON.stringify(D, null, 2))

type T = { x: number } & { y: number }

type F = { [K in keyof T]: T[K] }

// type F = { x: number, y: number }

