
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