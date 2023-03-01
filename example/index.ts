import { Kind, TSchema, SchemaOptions, IntersectReduce, IntersectEvaluate } from '@sinclair/typebox'

export interface IntersectAllOfOptions extends SchemaOptions {
  unevaluatedProperties?: boolean
}

export interface TAnd<T extends TSchema[] = []> extends TSchema {
  [Kind]: 'TAnd'
  static: IntersectReduce<unknown, IntersectEvaluate<T, []>>
  allOf: T
}

function And<T extends TSchema[] = []>(allOf: T): TAnd<T> {
  return { [Kind]: 'And', allOf } as any as TAnd<T>
}
