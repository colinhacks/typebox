### Types
- [ ] Consider checking `void` as `undefined`.
- [ ] Add symbol to extends checks

### Symbol

- [ ] Add tests

### Pick / Omit 
- [ ] Re-enable these to be picked from Union<Literal[]>

### Value
- [ ] Investigate performance degredation on `Value.Check`. Blowout for `Array_ObjectA` and `Array_ObjectB` and `Array_Recursive` especially.

### Compiler and Check

- [ ] Fix existing tests for intersect schema (possible related to second item)
- [ ] Implement tests for intersection
- [ ] Implement tests for symbol
- [ ] Fix compiler, ensure all $id schemas are hoisted into functions (assert for duplicate)
- [ ] Store hashed map for schemas created via type builder. Support auto deref for
      pick, omit, partial, required and keyof

### Extends 
- [ ] Implement intersection tests
- [ ] Implement symbol tests

### ChangeLog


#### TypeGuard

The TypeGuard module has been moved as a top level export

```typescript
// before
import { TypeGuard } from '@sinclair/typebox/guard'
// after
import { TypeGuard } from '@sinclair/typebox'
```

#### Conditional

The Conditional module has been integrated on `Type`. The `Extends`, `Exclude`, and `Exclude` functions are now available directly on `Type` and the `Conditional` module no longer exists.

```typescript
// before
import { Conditional } from '@sinclair/typebox/conditional'
import { Type } from '@sinclair/typebox'

const T = Conditional.Extends(
    Type.String(),
    Type.Number(),
    Type.Literal(true),
    Type.Literal(false)
)

// after
import { Type } from '@sinclair/typebox'

const T = Type.Extends(
    Type.String(),
    Type.Number(),
    Type.Literal(true),
    Type.Literal(false)
)
```

#### Format and Custom

The `Format` and `Custom` modules have been moved under the `system` module.

```typescript
// before
import { Format } from '@sinclair/typebox/format'
import { Custom } from '@sinclair/typebox/custom'

Format.Create('test', value => true)
Custom.Create('test', value => true)

// after
import { Format, Custom } from '@sinclair/typebox/system'

Format.Create('test', value => true)
Custom.Create('test', value => true)
```

### Update

This is a major update to TypeBox and a minor semver release. These updates provision TypeBox for a future 1.0 release with the 0.26.x minor revision anticipated to be the last minor revision before 1.0.

Updates:

- `Type.Intersect([])` Now expressed as `allOf` schema representation.
- `Type.Evaluate()` Produces evaluated types derived from `Type.Union()` and `Type.Intersect()`
- `Type.Symbol()` Support for symbol validation.
- `Type.Not()` Allows check logic to be inverted using the JSON Schema `not` keyword.
- `Type.Extends()` Promoted from `Conditional`
- `Type.Exclude()` Promoted from `Conditional`
- `Type.Extract()` Promoted from `Conditional`

Notes:

#### Intersect, Evaluate and Computed Types

The update to `Intersect` has required a significant restructuring of TypeBox's internal `Type.*` compositor system to support full computed types. The update essentially reverts `allOf` schema representation present on `0.23.x`, but is now backed by composition and inference logic that lines up to the TypeScript compiler. It's now possible to use `Pick`, `Omit`, `Required`, `Partial` and `KeyOf` with intersection (as well as with unions), and the update also allows intersections of unions (which was lost functionality).

As a consequence of this update, the return type for Intersect has changed from `TObject` back to `TIntersect`. 
