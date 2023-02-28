/*--------------------------------------------------------------------------

@sinclair/typebox/fluent

The MIT License (MIT)

Copyright (c) 2017-2023 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import { TypeCompiler, ValueError, TypeCheck } from '@sinclair/typebox/compiler'
import { Conditional } from '@sinclair/typebox/conditional'
import { TypeSystem } from '@sinclair/typebox/system'
import { TypeGuard } from '@sinclair/typebox/guard'
import { Custom } from '@sinclair/typebox/custom'
import { Value } from '@sinclair/typebox/value'
import * as Types from '@sinclair/typebox'

// -----------------------------------------------------------------
// Formats: Built In
// -----------------------------------------------------------------
// prettier-ignore
TypeSystem.CreateFormat('email', (value) => /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(value))
// prettier-ignore
TypeSystem.CreateFormat('uuid', (value) => /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value))
// prettier-ignore
TypeSystem.CreateFormat('url', (value) => /^(?:https?|wss?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu.test(value))
// prettier-ignore
TypeSystem.CreateFormat('ipv6', (value) => /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i.test(value))
// prettier-ignore
TypeSystem.CreateFormat('ipv4', (value) => /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/.test(value))

// -----------------------------------------------------------------
// Into
// -----------------------------------------------------------------
export type IntoFluent<T extends Types.TSchema> = FluentType<T>
export type IntoFluentProperties<T extends Types.TProperties> = { [K in keyof T]: T[K] extends Types.TSchema ? IntoFluent<T[K]> : never }
export type IntoFluentTuple<T extends Types.TSchema[]> = [...{ [K in keyof T]: IntoFluent<T[K]> }]

// -----------------------------------------------------------------
// Error
// -----------------------------------------------------------------
export class FluentError extends Error {
  constructor(public readonly errors: ValueError[]) {
    super('Value is Invalid')
  }
}

// -----------------------------------------------------------------
// Assert
// -----------------------------------------------------------------
export interface FluentAssert<T extends Types.TSchema> {
  Check(value: unknown): value is Types.Static<T>
  Errors(value: unknown): IterableIterator<ValueError>
  Code(): string
}
export class FluentAssertDynamic<T extends Types.TSchema> implements FluentAssert<T> {
  readonly #schema: T
  constructor(schema: T) {
    this.#schema = schema
  }
  public Check(value: unknown): value is Types.Static<T, []> {
    return Value.Check(this.#schema, [], value)
  }
  public Errors(value: unknown): IterableIterator<ValueError> {
    return Value.Errors(this.#schema, [], value)
  }
  public Code(): string {
    return TypeCompiler.Code(this.#schema, [])
  }
}
export class FluentAssertCompiled<T extends Types.TSchema> implements FluentAssert<T> {
  readonly #typecheck: TypeCheck<T>
  constructor(schema: T) {
    this.#typecheck = TypeCompiler.Compile(schema)
  }
  public Check(value: unknown): value is Types.Static<T, []> {
    return this.#typecheck.Check(value)
  }
  public Errors(value: unknown): IterableIterator<ValueError> {
    return this.#typecheck.Errors(value)
  }
  public Code(): string {
    return this.#typecheck.Code()
  }
}
// -----------------------------------------------------------------
// Types
// -----------------------------------------------------------------
export class FluentType<T extends Types.TSchema = Types.TSchema> {
  #assert: FluentAssert<T>
  #schema: T
  constructor(schema: T) {
    this.#assert = new FluentAssertDynamic(schema)
    this.#schema = schema
  }
  public Check(value: unknown): value is Types.Static<T> {
    return this.#assert.Check(value)
  }
  public Assert(value: unknown): void {
    if (this.#assert.Check(value)) return
    throw new FluentError([...this.#assert.Errors(value)])
  }
  public Parse(value: unknown): Types.Static<T> {
    this.Assert(value)
    return value
  }
  public Ensure(value: unknown): Types.Static<T> {
    return Value.Cast(this.#schema, [], value)
  }
  public Create(): Types.Static<T> {
    return Value.Create(this.#schema, [])
  }
  public Default(value: Types.Static<T>): this {
    return new FluentType({ ...this.#schema, default: value }) as this
  }
  public ReadonlyOptional(): FluentType<Types.TReadonlyOptional<T>> {
    return new FluentType(Types.Type.ReadonlyOptional(this.#schema))
  }
  public Optional(): FluentType<Types.TOptional<T>> {
    return new FluentType(Types.Type.Optional(this.#schema))
  }
  public Readonly(): FluentType<Types.TReadonly<T>> {
    return new FluentType(Types.Type.Readonly(this.#schema))
  }
  public Nullable() {
    return new FluentUnion(Types.Type.Union([this.#schema, Types.Type.Null()]))
  }
  public Or<T extends Types.TSchema>(type: IntoFluent<T>) {
    return new FluentType(Types.Type.Union([this.#schema, type.Schema]))
  }
  public Not<U extends Types.TSchema>(type: IntoFluent<U>) {
    return new FluentNot(Types.Type.Not(type.Schema, this.Schema))
  }
  public get Code(): string {
    return this.#assert.Code()
  }
  public get Schema(): T {
    return Value.Clone(this.#schema)
  }
  public Compile(): this {
    const compiled = new FluentType(this.#schema)
    compiled.#assert = new FluentAssertCompiled(this.#schema)
    return compiled as this
  }
}
export class FluentObject<T extends Types.TObject = Types.TObject> extends FluentType<T> {
  public Intersect<U extends Types.TObject>(type: IntoFluent<U>) {
    return new FluentIntersect(Types.Type.Intersect([this.Schema, type.Schema]))
  }
  public Extend<U extends Types.TProperties>(properties: IntoFluentProperties<U>) {
    const props = Object.keys(properties).reduce((acc, key) => ({ ...acc, [key]: properties[key].Schema }), {} as Types.TProperties) as U
    const object = Types.Type.Object(props)
    return new FluentIntersect(Types.Type.Intersect([this.Schema, object]))
  }
  public Partial() {
    return new FluentObject(Types.Type.Partial(this.Schema))
  }
  public Required() {
    return new FluentObject(Types.Type.Required(this.Schema))
  }
  public Pick<K extends Types.ObjectPropertyKeys<T>[]>(keys: [...K]) {
    return new FluentObject(Types.Type.Pick(this.Schema, keys))
  }
  public Omit<K extends Types.ObjectPropertyKeys<T>[]>(keys: readonly [...K]) {
    return new FluentObject(Types.Type.Omit(this.Schema, keys))
  }
  public Strict(): this {
    return new FluentObject({ ...this.Schema, additionalProperties: false }) as this
  }
  public KeyOf() {
    return new FluentKeyOf(Types.Type.KeyOf(this.Schema))
  }
}
export class FluentArray<T extends Types.TArray<Types.TSchema>> extends FluentType<T> {
  public MinLength(n: number) {
    return new FluentArray(Types.Type.Array({ ...this.Schema, maxItems: n }))
  }
  public MaxLength(n: number) {
    return new FluentArray(Types.Type.Array({ ...this.Schema, maxItems: n }))
  }
  public Length(n: number) {
    return new FluentArray(Types.Type.Array({ ...this.Schema, minItems: n, maxItems: n }))
  }
  public Distinct() {
    return new FluentArray(Types.Type.Array({ ...this.Schema, uniqueItems: true }))
  }
}
export class FluentString<Format extends string = string> extends FluentType<Types.TString<Format>> {
  public Equals(n: string) {
    return new FluentString<Format>(Types.Type.String({ ...this.Schema, pattern: `^${n}$` }))
  }
  public Includes(n: string) {
    return new FluentString<Format>(Types.Type.String({ ...this.Schema, pattern: n }))
  }
  public StartsWith(n: string) {
    return new FluentString<Format>(Types.Type.String({ ...this.Schema, pattern: `^${n}` }))
  }
  public EndsWith(n: string) {
    return new FluentString<Format>(Types.Type.String({ ...this.Schema, pattern: `${n}$` }))
  }
  public MinLength(n: number) {
    return new FluentString<Format>(Types.Type.String({ ...this.Schema, minLength: n }))
  }
  public MaxLength(n: number) {
    return new FluentString<Format>(Types.Type.String({ ...this.Schema, maxLength: n }))
  }
  public Length(n: number) {
    return new FluentString<Format>(Types.Type.String({ ...this.Schema, maxLength: n, minLength: n }))
  }
  public Pattern(n: string) {
    return new FluentString<Format>(Types.Type.String({ ...this.Schema, pattern: n }))
  }
  public Format<F extends Format>(n: F) {
    return new FluentString<F>(Types.Type.String({ ...this.Schema, format: n }))
  }
  public Email() {
    return new FluentString<'email'>(Types.Type.String({ ...this.Schema, format: 'email' }))
  }
  public Uuid() {
    return new FluentString<'uuid'>(Types.Type.String({ ...this.Schema, format: 'uuid' }))
  }
  public Url() {
    return new FluentString<'url'>(Types.Type.String({ ...this.Schema, format: 'url' }))
  }
  public Ipv6() {
    return new FluentString<'ipv6'>(Types.Type.String({ ...this.Schema, format: 'ipv6' }))
  }
  public Ipv4() {
    return new FluentString<'ipv4'>(Types.Type.String({ ...this.Schema, format: 'ipv4' }))
  }
}
export class FluentNumber extends FluentType<Types.TNumber> {
  public Equals(n: number) {
    return new FluentInteger(Types.Type.Integer({ ...this.Schema, minimum: n, maximum: n }))
  }
  public GreaterThan(n: number) {
    return new FluentNumber(Types.Type.Number({ ...this.Schema, exclusiveMinimum: n }))
  }
  public GreaterThanEqual(n: number) {
    return new FluentNumber(Types.Type.Number({ ...this.Schema, minimum: n }))
  }
  public LessThan(n: number) {
    return new FluentNumber(Types.Type.Number({ ...this.Schema, exclusiveMaximum: n }))
  }
  public LessThanEqual(n: number) {
    return new FluentNumber(Types.Type.Number({ ...this.Schema, maximum: n }))
  }
  public MultipleOf(n: number) {
    return new FluentNumber(Types.Type.Number({ ...this.Schema, multipleOf: n }))
  }
  public Positive() {
    return new FluentNumber(Types.Type.Number({ ...this.Schema, minimum: 0 }))
  }
  public Negative() {
    return new FluentNumber(Types.Type.Number({ ...this.Schema, maximum: 0 }))
  }
}
export class FluentInteger extends FluentType<Types.TInteger> {
  public Equals(n: number) {
    return new FluentInteger(Types.Type.Integer({ ...this.Schema, minimum: Math.floor(n), maximum: Math.floor(n) }))
  }
  public GreaterThan(n: number) {
    return new FluentInteger(Types.Type.Integer({ ...this.Schema, exclusiveMinimum: n }))
  }
  public GreaterThanEqual(n: number) {
    return new FluentInteger(Types.Type.Integer({ ...this.Schema, minimum: n }))
  }
  public LessThan(n: number) {
    return new FluentInteger(Types.Type.Integer({ ...this.Schema, exclusiveMaximum: n }))
  }
  public LessThanEqual(n: number) {
    return new FluentInteger(Types.Type.Integer({ ...this.Schema, maximum: n }))
  }
  public MultipleOf(n: number) {
    return new FluentInteger(Types.Type.Integer({ ...this.Schema, multipleOf: n }))
  }
  public Positive() {
    return new FluentInteger(Types.Type.Integer({ ...this.Schema, minimum: 0 }))
  }
  public Negative() {
    return new FluentInteger(Types.Type.Integer({ ...this.Schema, maximum: 0 }))
  }
}
export class FluentDate extends FluentType<Types.TDate> {
  public Equals(n: Date) {
    return new FluentDate(Types.Type.Date({ ...this.Schema, maximumTimestamp: n.getTime(), minimumTimestamp: n.getTime() }))
  }
  public Before(n: Date) {
    return new FluentDate(Types.Type.Date({ ...this.Schema, maximumTimestamp: n.getTime() }))
  }
  public After(n: Date) {
    return new FluentDate(Types.Type.Date({ ...this.Schema, minimumTimestamp: n.getTime() }))
  }
}
export class FluentUint8Array<T extends Types.TUint8Array> extends FluentType<T> {
  public MinByteLength(n: number) {
    return new FluentUint8Array(Types.Type.Uint8Array({ ...this.Schema, minByteLength: n }))
  }
  public MaxByteLength(n: number) {
    return new FluentUint8Array(Types.Type.Uint8Array({ ...this.Schema, maxByteLength: n }))
  }
  public Length(n: number) {
    return new FluentUint8Array(Types.Type.Uint8Array({ ...this.Schema, minByteLength: n, maxByteLength: n }))
  }
}

export class FluentRecord<T extends Types.TSchema> extends FluentType<Types.TRecord<Types.TString, T>> {}
export class FluentSelf extends FluentType<Types.TSelf> {}
export class FluentRecursive<T extends Types.TSchema> extends FluentType<T> {}
export class FluentIntersect<T extends Types.TIntersect> extends FluentObject<T> {}
export class FluentAny<T extends Types.TAny> extends FluentType<T> {}
export class FluentLiteral<T extends Types.TLiteral<Types.TLiteralValue>> extends FluentType<T> {}
export class FluentUnknown<T extends Types.TUnknown> extends FluentType<T> {}
export class FluentNull<T extends Types.TNull> extends FluentType<T> {}
export class FluentNever<T extends Types.TNever> extends FluentType<T> {}
export class FluentNot<T extends Types.TNot<Types.TSchema, Types.TSchema>> extends FluentType<T> {}
export class FluentUndefined<T extends Types.TUndefined> extends FluentType<T> {}
export class FluentBoolean extends FluentType<Types.TBoolean> {}
export class FluentKeyOf<T extends Types.TKeyOf<any>> extends FluentType<T> {}
export type FluentProperties = Record<any, FluentType>
export class FluentPromise<T extends Types.TSchema> extends FluentType<T> {}
export class FluentUnion<T extends Types.TUnion> extends FluentType<T> {}
export class FluentTuple<T extends Types.TTuple> extends FluentType<T> {}
export class FluentPick<T extends Types.TObject, Properties extends Types.ObjectPropertyKeys<T>[]> extends FluentType<Types.TPick<T, Properties>> {}
export class FluentUnsafe<T extends Types.TUnsafe<unknown>> extends FluentType<T> {}
export class FluentVoid<T extends Types.TVoid> extends FluentType<T> {}

// -----------------------------------------------------------------
// Function
// -----------------------------------------------------------------
export type FluentFunctionParameters<T extends Types.TSchema[]> = [...{ [K in keyof T]: Types.Static<T[K]> }]

export type FluentFunction<T extends Types.TFunction<any[], any>> = (...param: FluentFunctionParameters<T['parameters']>) => Types.Static<T['returns']>

export class FluentFunctionSignature<T extends Types.TFunction<any[], any>> {
  constructor(public readonly schema: T) {}
  public Implement(callback: FluentFunction<T>): FluentFunction<T> {
    const typecheck = TypeCompiler.Compile(Types.Type.Parameters(this.schema))
    return (...params: unknown[]) => {
      if (typecheck.Check(params)) return callback(...params)
      const error: ValueError = typecheck.Errors(params).next()!.value
      throw new Error(`${error.path} ${error.message}`)
    }
  }
}

// -----------------------------------------------------------------
// Extends
// -----------------------------------------------------------------

export class FluentThen<Left extends Types.TSchema, Right extends Types.TSchema, True extends Types.TSchema> {
  constructor(
    private readonly left: Left,
    private readonly right: Right,
    private readonly _true: True
  ) {}
  public Else<False extends Types.TSchema>(_false: IntoFluent<False>) {
    const result = Conditional.Extends(this.left, this.right, this._true, _false.Schema)
    return new FluentType(result)
  }
}

export class FluentExtends<Left extends Types.TSchema, Right extends Types.TSchema> {
  constructor(public readonly left: Left, public readonly right: Right) {}
  public Then<True extends Types.TSchema>(_true: IntoFluent<True>): FluentThen<Left, Right, True> {
    return new FluentThen(this.left, this.right, _true.Schema)
  }
}


// -----------------------------------------------------------------
// Builder
// -----------------------------------------------------------------

let kindOrdinal = 0

export class FluentTypeBuilder {
  public Any(options: Types.SchemaOptions = {}) {
    return new FluentAny(Types.Type.Any(options))
  }
  public Array<T extends Types.TSchema>(item: FluentType<T>, options: Types.ArrayOptions = {}) {
    return new FluentArray(Types.Type.Array(item.Schema, options))
  }
  public Boolean(options: Types.SchemaOptions = {}) {
    return new FluentBoolean(Types.Type.Boolean(options))
  }
  public Extends<Left extends Types.TSchema, Right extends Types.TSchema>(left: IntoFluent<Left>, right: IntoFluent<Right>) {
    return new FluentExtends(left.Schema, right.Schema)
  }
  public Create<Infer extends unknown = unknown, Options extends unknown = unknown>(callback: (options: Options, value: unknown) => boolean) {
    const type = TypeSystem.CreateType<Infer, Options>(`kind_${kindOrdinal++}`, callback)
    return function UserFluentType(options: Partial<Options> = {}) {return new FluentUnsafe(type(options)) }
  }
  public Date(options: Types.DateOptions = {}) {
    return new FluentDate(Types.Type.Date(options))
  }
  public Function<P extends Types.TSchema[], R extends Types.TSchema>(params: IntoFluentTuple<P>, returns: IntoFluent<R>) {
    return new FluentFunctionSignature(Types.Type.Function(params.map((param) => param.Schema) as [...P], returns.Schema))
  }
  public Format<T extends string>(format: T, callback: (value: string) => boolean) {
    TypeSystem.CreateFormat(format, callback)
    return format
  }
  public Integer(options: Types.NumericOptions = {}) {
    return new FluentInteger(Types.Type.Integer())
  }
  public Intersect<T extends Types.TObject[]>(objects: [...IntoFluentTuple<T>]) {
    return new FluentObject(Types.Type.Intersect(objects.map((type) => type.Schema))) as FluentObject<Types.TIntersect<T>>
  }
  public Null(options: Types.SchemaOptions = {}) {
    return new FluentNull(Types.Type.Null())
  }
  public Not<N extends Types.TSchema, T extends Types.TSchema>(not: IntoFluent<N>, type: IntoFluent<T>, options: Types.SchemaOptions = {}) {
    return new FluentNot(Types.Type.Not(not.Schema, type.Schema, options))
  }
  public Never(options: Types.SchemaOptions = {}) {
    return new FluentNever(Types.Type.Never(options))
  }
  public Number(options: Types.NumericOptions = {}) {
    return new FluentNumber(Types.Type.Number(options))
  }
  public Object<T extends Types.TProperties>(properties: IntoFluentProperties<T>, options: Types.ObjectOptions = {}) {
    const mapped = Object.keys(properties).reduce((acc, key) => ({ ...acc, [key]: properties[key].Schema }), {} as Types.TProperties)
    return new FluentObject(Types.Type.Object(mapped, options)) as FluentObject<Types.TObject<T>>
  }
  public Literal<T extends Types.TLiteralValue>(value: T, options: Types.SchemaOptions = {}) {
    return new FluentLiteral(Types.Type.Literal(value, options))
  }
  public Promise<T extends Types.TSchema>(type: IntoFluent<T>, options: Types.SchemaOptions = {}) {
    return new FluentPromise(Types.Type.Promise(type.Schema, options))
  }

  public Record<K extends Types.TUnion<Types.TLiteral[]>, T extends Types.TSchema>(key: IntoFluent<K>, schema: IntoFluent<T>, options?: Types.ObjectOptions): FluentObject<Types.TObject<Types.TRecordProperties<K, T>>>
  public Record<K extends Types.TString | Types.TNumeric, T extends Types.TSchema>(key: IntoFluent<K>, schema: IntoFluent<T>, options?: Types.ObjectOptions): FluentRecord<Types.TRecord<K, T>>
  public Record(...args: any[]): any {
    if(TypeGuard.TUnion(args[0].Schema) && args[0].Schema.anyOf.every((schema: Types.TSchema) => TypeGuard.TLiteral(schema))) {
      return new FluentObject(Types.Type.Record(args[0].Schema as any, args[1].Schema) as any)
    } else {
      return new FluentRecord(Types.Type.Record(args[0].Schema as any, args[1].Schema) as any)
    }
  }
  public Recursive<T extends Types.TSchema>(callback: (self: FluentSelf) => FluentType<T>, options: Types.SchemaOptions = {}) {
    // prettier-ignore
    return new FluentRecursive(Types.Type.Recursive((Self) => callback(new FluentSelf(Self)).Schema, options))
  }
  public String() {
    return new FluentString(Types.Type.String())
  }
  public Tuple<T extends Types.TSchema[]>(tuple: IntoFluentTuple<T>) {
    return new FluentTuple(Types.Type.Tuple(tuple.map((type) => type.Schema))) as FluentTuple<Types.TTuple<T>>
  }
  public Uint8Array() {
    return new FluentUint8Array(Types.Type.Uint8Array())
  }
  public Undefined() {
    return new FluentUndefined(Types.Type.Undefined())
  }
  public Union<T extends Types.TSchema[]>(union: [...IntoFluentTuple<T>]) {
    return new FluentUnion(Types.Type.Union(union.map((type) => type.Schema))) as FluentUnion<Types.TUnion<T>>
  }
  public Unknown() {
    return new FluentUnknown(Types.Type.Unknown())
  }
  public Unsafe<T = unknown>(callback: (value: unknown) => boolean) {
    const kind = `kind_${kindOrdinal++}`
    Custom.Set(kind, (_, value) => callback(value))
    return new FluentUnsafe(Types.Type.Unsafe<T>({ [Types.Kind]: kind }))
  }
  public Void() {
    return new FluentVoid(Types.Type.Void())
  }
}

export type Static<T> = T extends FluentType<infer S> ? Types.Static<S> : unknown

export const Type = new FluentTypeBuilder()

export default Type
