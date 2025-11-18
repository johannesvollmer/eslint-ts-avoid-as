# eslint-ts-avoid-as

[![npm version](https://badge.fury.io/js/eslint-ts-avoid-as.svg)](https://www.npmjs.com/package/eslint-ts-avoid-as)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

> An ESLint plugin that helps you write safer TypeScript code by discouraging the use of `as` type assertions on literal values.

## 🎯 What does it do?

This ESLint rule identifies cases where you're using TypeScript's `as` type assertion on literal values (objects, arrays, strings, numbers, etc.) and suggests using the safer `satisfies` operator instead.

### Why use `satisfies` instead of `as`?

The `satisfies` operator (introduced in TypeScript 4.9) is safer than `as` because:

- ✅ **Type checking**: `satisfies` validates that your value actually matches the type, catching errors at compile time
- ✅ **Inference preservation**: Your value keeps its specific inferred type (e.g., `"red"` stays as `"red"` instead of being widened to `string`)
- ❌ **Type assertions with `as`**: Can force incompatible types, potentially hiding bugs

### Example

**❌ Bad (using `as`):**
```typescript
interface Config {
  name: string;
  value: number;
}

// This compiles but loses type information
const config = { name: "test", value: 42 } as Config;

// Dangerous: TypeScript won't catch this error!
const broken = { name: "test", wrongProp: true } as Config;
```

**✅ Good (using `satisfies`):**
```typescript
interface Config {
  name: string;
  value: number;
}

// This validates the type AND preserves inference
const config = { name: "test", value: 42 } satisfies Config;

// TypeScript catches this error at compile time! 🎉
const broken = { name: "test", wrongProp: true } satisfies Config;
//    ^^^^^^ Error: Object literal may only specify known properties
```

## 📦 Installation

```bash
npm install --save-dev eslint-ts-avoid-as
```

**Peer Dependencies:**
- `eslint` >= 8.0.0
- `@typescript-eslint/parser` >= 8.0.0
- `typescript` >= 5.0.0

## 🚀 Usage

### 1. Configure ESLint

Add the plugin to your ESLint configuration:

**Using ESM (eslint.config.js):**
```javascript
import tsAvoidAs from 'eslint-ts-avoid-as';

export default [
  {
    plugins: {
      'ts-avoid-as': tsAvoidAs,
    },
    rules: {
      // Recommended: Use separate rules for better control
      'ts-avoid-as/use-satisfies-for-literals': 'warn',
      'ts-avoid-as/literal-type-mismatch': 'error',
      
      // Alternative: Use the combined rule (deprecated, kept for backwards compatibility)
      // 'ts-avoid-as/avoid-as': 'error',
    },
  },
];
```

**Using CommonJS (.eslintrc.js):**
```javascript
module.exports = {
  plugins: ['ts-avoid-as'],
  rules: {
    // Recommended: Use separate rules for better control
    'ts-avoid-as/use-satisfies-for-literals': 'warn',
    'ts-avoid-as/literal-type-mismatch': 'error',
    
    // Alternative: Use the combined rule (deprecated, kept for backwards compatibility)
    // 'ts-avoid-as/avoid-as': 'error',
  },
};
```

**Using JSON (.eslintrc.json):**
```json
{
  "plugins": ["ts-avoid-as"],
  "rules": {
    "ts-avoid-as/use-satisfies-for-literals": "warn",
    "ts-avoid-as/literal-type-mismatch": "error"
  }
}
```

### 2. Configure TypeScript Parser

This plugin requires type information, so make sure your ESLint config uses `@typescript-eslint/parser`:

**Using ESM:**
```javascript
import tsParser from '@typescript-eslint/parser';
import tsAvoidAs from 'eslint-ts-avoid-as';

export default [
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      'ts-avoid-as': tsAvoidAs,
    },
    rules: {
      'ts-avoid-as/use-satisfies-for-literals': 'warn',
      'ts-avoid-as/literal-type-mismatch': 'error',
    },
  },
];
```

**Using CommonJS:**
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['ts-avoid-as'],
  rules: {
    'ts-avoid-as/use-satisfies-for-literals': 'warn',
    'ts-avoid-as/literal-type-mismatch': 'error',
  },
};
```

## 📋 Rules

This plugin provides two separate rules that can be configured independently:

### `ts-avoid-as/use-satisfies-for-literals` (Recommended: `warn`)

This rule warns when you use `as` on literal values with compatible types and provides an auto-fix to replace `as` with `satisfies`.

**Why separate this rule?** Using `satisfies` instead of `as` preserves type inference while still checking type compatibility. This is usually a safe change that improves type safety without breaking your code.

### `ts-avoid-as/literal-type-mismatch` (Recommended: `error`)

This rule reports an error when you try to assert a literal value to an incompatible type using `as`. No auto-fix is provided because the code is likely incorrect and needs manual review.

**Why separate this rule?** Type mismatches are usually bugs that need immediate attention. Separating this allows you to treat them as errors while treating the safer `satisfies` suggestions as warnings.

### `ts-avoid-as/avoid-as` (Deprecated)

The original combined rule is kept for backwards compatibility. It reports both compatible and incompatible type assertions. Consider migrating to the two separate rules for better control over error severity.

## 📋 Rule Details

### 1. `use-satisfies-for-literals`: Compatible type assertions

When you use `as` on a literal value with a compatible type, this rule suggests using `satisfies` instead and provides an automatic fix.

**Examples of incorrect code:**

```typescript
// ❌ Object literals
const obj = { x: 1, y: 2 } as Point;

// ❌ Array literals
const arr = [1, 2, 3] as number[];

// ❌ String literals
const str = "hello" as string;

// ❌ Number literals
const num = 42 as number;

// ❌ Boolean literals
const flag = true as boolean;
```

**Examples of correct code:**

```typescript
// ✅ Using satisfies
const obj = { x: 1, y: 2 } satisfies Point;
const arr = [1, 2, 3] satisfies number[];

// ✅ Using as const (allowed)
const obj = { x: 1, y: 2 } as const;
const arr = [1, 2, 3] as const;

// ✅ Using as with non-literals (allowed)
const value = getValue() as number;
const result = someVariable as SomeType;
```

### 2. `literal-type-mismatch`: Incompatible type assertions

When you try to assert a literal value to an incompatible type, this rule reports an error without providing a fix (because the code is likely incorrect and needs manual review).

**Examples of incorrect code:**

```typescript
// ❌ Type mismatch
const num = "hello" as number;  // Error: Type 'string' is not assignable to type 'number'

// ❌ Wrong union member
type Status = "active" | "inactive";
const status = "pending" as Status;  // Error: Type '"pending"' is not assignable to type 'Status'

// ❌ Missing required properties
interface User { name: string; age: number; }
const user = { name: "John" } as User;  // Error: Property 'age' is missing
```

## 🔧 Options

These rules currently have no configuration options.

## 🤝 When NOT to use these rules

You might want to disable these rules if:

- You're working with legacy TypeScript code (< 4.9) that doesn't support `satisfies`
- You're intentionally using `as` for type assertions on literals (though we'd recommend reconsidering this)
- You're using `as const` exclusively (which is allowed by these rules)

## 🐛 Compatibility

- **TypeScript**: >= 5.0.0 (uses `satisfies` operator and advanced type checking features)
- **ESLint**: >= 8.0.0
- **Node.js**: >= 18.0.0

> **Note**: While the `satisfies` operator was introduced in TypeScript 4.9, this plugin requires TypeScript 5.0+ for full compatibility with its type checking features.

## 💡 Examples

### Before (using `as`):
```typescript
interface Config {
  theme: "light" | "dark";
  fontSize: number;
}

const config = {
  theme: "light",
  fontSize: 14
} as Config;

// Type of config.theme is "light" | "dark" (widened)
// Can't access the specific literal type
```

### After (using `satisfies`):
```typescript
interface Config {
  theme: "light" | "dark";
  fontSize: number;
}

const config = {
  theme: "light",
  fontSize: 14
} satisfies Config;

// Type of config.theme is "light" (preserved!)
// Can use this specific type in conditional logic
```

## 📝 License

ISC © [Johannes Vollmer](https://github.com/johannesvollmer)

## 🙏 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💖 Support

If you find this plugin helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 💰 [Sponsoring the author](https://github.com/sponsors/johannesvollmer)

## 🔗 Links

- [npm package](https://www.npmjs.com/package/eslint-ts-avoid-as)
- [GitHub repository](https://github.com/johannesvollmer/eslint-ts-avoid-as)
- [Issue tracker](https://github.com/johannesvollmer/eslint-ts-avoid-as/issues)
- [TypeScript `satisfies` documentation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)
