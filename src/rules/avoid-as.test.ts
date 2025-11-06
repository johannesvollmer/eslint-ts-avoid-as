import path from 'path';
import { RuleTester } from '@typescript-eslint/rule-tester';
import parser from '@typescript-eslint/parser';
import rule from './avoid-as';

// Configure RuleTester afterAll for Jest compatibility
RuleTester.afterAll = afterAll;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: parser as any,
    parserOptions: {
      projectService: {
        allowDefaultProject: ['*.ts*'],
        maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 100,
      },
      tsconfigRootDir: path.join(__dirname, '../..'),
    },
  },
} as any);

describe('avoid-as', () => {
  ruleTester.run('avoid-as', rule, {
    valid: [
      // Valid: Using satisfies instead of as with object literal
      {
        code: `
          interface Config {
            name: string;
            value: number;
          }
          const config = { name: "test", value: 42 } satisfies Config;
        `,
        filename: 'valid1.ts',
      },
      // Valid: Using satisfies instead of as with array literal
      {
        code: `
          const arr = [1, 2, 3] satisfies number[];
        `,
        filename: 'valid2.ts',
      },
      // Valid: Using satisfies instead of as with string literal
      {
        code: `
          const str = "hello" satisfies string;
        `,
        filename: 'valid3.ts',
      },
      // Valid: as with non-literal expressions (function calls, identifiers)
      {
        code: `
          const num = getValue() as number;
        `,
        filename: 'valid4.ts',
      },
      {
        code: `
          const value = someVariable as SomeType;
        `,
        filename: 'valid5.ts',
      },
      // Valid: No type assertion at all
      {
        code: `
          const obj = { name: "test", value: 42 };
        `,
        filename: 'valid6.ts',
      },
      // Valid: as const (const assertions are allowed)
      {
        code: `
          const config = { name: "test", value: 42 } as const;
        `,
        filename: 'valid7.ts',
      },
      {
        code: `
          const arr = [1, 2, 3] as const;
        `,
        filename: 'valid8.ts',
      },
      {
        code: `
          const tuple = ["hello", 42, true] as const;
        `,
        filename: 'valid9.ts',
      },
      // Valid: as with any (non-literal expressions only - these are identifiers/calls)
      {
        code: `
          const data = fetchData() as any;
        `,
        filename: 'valid10.ts',
      },
      {
        code: `
          const result = someValue as unknown;
        `,
        filename: 'valid11.ts',
      },
      // Valid: as in null/undefined checks with non-literals
      {
        code: `
          const value = maybeValue as string | null;
        `,
        filename: 'valid12.ts',
      },
      {
        code: `
          const item = getItem() as undefined | number;
        `,
        filename: 'valid13.ts',
      },
      // Valid: as with template literal expressions (non-literal)
      {
        code: `
          const id = \`user-\${userId}\` as string;
        `,
        filename: 'valid14.ts',
      },
      // Valid: as with function expressions
      {
        code: `
          const fn = function() { return 42; } as () => number;
        `,
        filename: 'valid15.ts',
      },
      {
        code: `
          const arrow = (() => 42) as () => number;
        `,
        filename: 'valid16.ts',
      },
      // Valid: as with class instances
      {
        code: `
          class MyClass {}
          const instance = new MyClass() as MyClass;
        `,
        filename: 'valid17.ts',
      },
      // Valid: as with conditional expressions
      {
        code: `
          const value = (condition ? "yes" : "no") as string;
        `,
        filename: 'valid18.ts',
      },
      // Valid: as with typeof expressions
      {
        code: `
          const t = typeof value as "string" | "number";
        `,
        filename: 'valid19.ts',
      },
    ],
    invalid: [
      // Invalid: Using as with object literal (compatible type - suggestion)
      {
        code: `
          interface Config {
            name: string;
            value: number;
          }
          const config = { name: "test", value: 42 } as Config;
        `,
        output: `
          interface Config {
            name: string;
            value: number;
          }
          const config = { name: "test", value: 42 } satisfies Config;
        `,
        filename: 'invalid1.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with empty object literal (compatible type - suggestion)
      {
        code: `
          const obj = {} as Record<string, any>;
        `,
        output: `
          const obj = {} satisfies Record<string, any>;
        `,
        filename: 'invalid2.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with nested object properties (compatible type - suggestion)
      {
        code: `
          type User = {
            name: string;
            address: {
              city: string;
              zip: string;
            };
          };
          const user = {
            name: "John",
            address: {
              city: "NYC",
              zip: "10001"
            }
          } as User;
        `,
        output: `
          type User = {
            name: string;
            address: {
              city: string;
              zip: string;
            };
          };
          const user = {
            name: "John",
            address: {
              city: "NYC",
              zip: "10001"
            }
          } satisfies User;
        `,
        filename: 'invalid3.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with array literal (compatible type - suggestion)
      {
        code: `
          const arr = [1, 2, 3] as number[];
        `,
        output: `
          const arr = [1, 2, 3] satisfies number[];
        `,
        filename: 'invalid4.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with string literal (compatible type - suggestion)
      {
        code: `
          const str = "hello" as string;
        `,
        output: `
          const str = "hello" satisfies string;
        `,
        filename: 'invalid5.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with number literal (compatible type - suggestion)
      {
        code: `
          const num = 42 as number;
        `,
        output: `
          const num = 42 satisfies number;
        `,
        filename: 'invalid6.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with boolean literal (compatible type - suggestion)
      {
        code: `
          const flag = true as boolean;
        `,
        output: `
          const flag = true satisfies boolean;
        `,
        filename: 'invalid7.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with null literal (compatible type - suggestion)
      {
        code: `
          const val = null as null;
        `,
        output: `
          const val = null satisfies null;
        `,
        filename: 'invalid8.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with bigint literal (compatible type - suggestion)
      {
        code: `
          const big = 100n as bigint;
        `,
        output: `
          const big = 100n satisfies bigint;
        `,
        filename: 'invalid9.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with readonly array (compatible type - suggestion)
      {
        code: `
          const arr = [1, 2, 3] as readonly number[];
        `,
        output: `
          const arr = [1, 2, 3] satisfies readonly number[];
        `,
        filename: 'invalid10.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with tuple type (compatible type - suggestion)
      {
        code: `
          const tuple = ["hello", 42] as [string, number];
        `,
        output: `
          const tuple = ["hello", 42] satisfies [string, number];
        `,
        filename: 'invalid11.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with union type (compatible type - suggestion)
      {
        code: `
          const val = "hello" as string | number;
        `,
        output: `
          const val = "hello" satisfies string | number;
        `,
        filename: 'invalid12.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with nested arrays (compatible type - suggestion)
      {
        code: `
          const matrix = [[1, 2], [3, 4]] as number[][];
        `,
        output: `
          const matrix = [[1, 2], [3, 4]] satisfies number[][];
        `,
        filename: 'invalid13.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with object containing methods (compatible type - suggestion)
      {
        code: `
          interface Calculator {
            add: (a: number, b: number) => number;
          }
          const calc = { add: (a: number, b: number) => a + b } as Calculator;
        `,
        output: `
          interface Calculator {
            add: (a: number, b: number) => number;
          }
          const calc = { add: (a: number, b: number) => a + b } satisfies Calculator;
        `,
        filename: 'invalid14.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with empty array (compatible type - suggestion)
      {
        code: `
          const arr = [] as string[];
        `,
        output: `
          const arr = [] satisfies string[];
        `,
        filename: 'invalid15.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with specific string literal type (compatible type - suggestion)
      {
        code: `
          type Color = "red" | "green" | "blue";
          const color = "red" as Color;
        `,
        output: `
          type Color = "red" | "green" | "blue";
          const color = "red" satisfies Color;
        `,
        filename: 'invalid16.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with specific number literal type (compatible type - suggestion)
      {
        code: `
          type Version = 1 | 2 | 3;
          const version = 2 as Version;
        `,
        output: `
          type Version = 1 | 2 | 3;
          const version = 2 satisfies Version;
        `,
        filename: 'invalid17.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with intersection type (compatible type - suggestion)
      {
        code: `
          type HasName = { name: string };
          type HasAge = { age: number };
          const person = { name: "John", age: 30 } as HasName & HasAge;
        `,
        output: `
          type HasName = { name: string };
          type HasAge = { age: number };
          const person = { name: "John", age: 30 } satisfies HasName & HasAge;
        `,
        filename: 'invalid18.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with optional properties (compatible type - suggestion)
      {
        code: `
          interface User {
            name: string;
            email?: string;
          }
          const user = { name: "Alice" } as User;
        `,
        output: `
          interface User {
            name: string;
            email?: string;
          }
          const user = { name: "Alice" } satisfies User;
        `,
        filename: 'invalid19.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Using as with index signature (compatible type - suggestion)
      {
        code: `
          const dict = { key1: "value1", key2: "value2" } as { [key: string]: string };
        `,
        output: `
          const dict = { key1: "value1", key2: "value2" } satisfies { [key: string]: string };
        `,
        filename: 'invalid20.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // INCOMPATIBLE TYPE ASSERTIONS (problem, not suggestion)
      // Invalid: String literal as boolean
      {
        code: `
          const val = "hi" as boolean;
        `,
        filename: 'invalid21.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '"hi"',
              targetType: 'boolean',
            },
          },
        ],
      },
      // Invalid: Number literal as string
      {
        code: `
          const val = 42 as string;
        `,
        filename: 'invalid22.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '42',
              targetType: 'string',
            },
          },
        ],
      },
      // Invalid: Boolean literal as number
      {
        code: `
          const val = true as number;
        `,
        filename: 'invalid23.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: 'true',
              targetType: 'number',
            },
          },
        ],
      },
      // Invalid: Array literal as object type with incompatible structure
      {
        code: `
          interface User {
            name: string;
            age: number;
          }
          const val = [1, 2, 3] as User;
        `,
        filename: 'invalid24.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: 'number[]',
              targetType: 'User',
            },
          },
        ],
      },
      // Invalid: Object literal with wrong structure
      {
        code: `
          interface Config {
            name: string;
            value: number;
          }
          const val = { name: "test", wrongProp: true } as Config;
        `,
        filename: 'invalid25.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
          },
        ],
      },
      // Invalid: String literal as specific string literal type that doesn't match
      {
        code: `
          type Status = "active" | "inactive";
          const val = "pending" as Status;
        `,
        filename: 'invalid26.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '"pending"',
              targetType: 'Status',
            },
          },
        ],
      },
      // Invalid: Number literal as specific number literal type that doesn't match
      {
        code: `
          type Port = 80 | 443 | 8080;
          const val = 3000 as Port;
        `,
        filename: 'invalid27.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '3000',
              targetType: 'Port',
            },
          },
        ],
      },
      // Invalid: Null as non-nullable object type
      {
        code: `
          interface User {
            name: string;
          }
          const val = null as User;
        `,
        filename: 'invalid28.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: 'null',
              targetType: 'User',
            },
          },
        ],
      },
      // Invalid: Object literal as primitive
      {
        code: `
          const val = { x: 1 } as number;
        `,
        filename: 'invalid29.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
          },
        ],
      },
      // Invalid: Array as string
      {
        code: `
          const val = [1, 2, 3] as string;
        `,
        filename: 'invalid30.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: 'number[]',
              targetType: 'string',
            },
          },
        ],
      },
      // Invalid: Empty object as interface with required properties (compatible - TypeScript allows this)
      {
        code: `
          interface Required {
            id: number;
            name: string;
          }
          const val = {} as Required;
        `,
        output: `
          interface Required {
            id: number;
            name: string;
          }
          const val = {} satisfies Required;
        `,
        filename: 'invalid31.ts',
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      // Invalid: Wrong tuple length
      {
        code: `
          const val = [1, 2, 3] as [number, number];
        `,
        filename: 'invalid32.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
          },
        ],
      },
      // Invalid: Wrong tuple element types
      {
        code: `
          const val = ["hello", "world"] as [string, number];
        `,
        filename: 'invalid33.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
          },
        ],
      },
      // Invalid: Incompatible union types
      {
        code: `
          type A = "a" | "b";
          type B = "c" | "d";
          const val = "a" as B;
        `,
        filename: 'invalid34.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '"a"',
              targetType: 'B',
            },
          },
        ],
      },
      // Invalid: Incompatible interfaces
      {
        code: `
          interface A {
            propA: string;
          }
          interface B {
            propB: number;
          }
          const val = { propA: "test" } as B;
        `,
        filename: 'invalid35.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
          },
        ],
      },
      // Invalid: Number as boolean
      {
        code: `
          const val = 1 as boolean;
        `,
        filename: 'invalid36.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '1',
              targetType: 'boolean',
            },
          },
        ],
      },
      // Invalid: Boolean as string
      {
        code: `
          const val = false as string;
        `,
        filename: 'invalid37.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: 'false',
              targetType: 'string',
            },
          },
        ],
      },
      // Invalid: String as number array
      {
        code: `
          const val = "hello" as number[];
        `,
        filename: 'invalid38.ts',
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '"hello"',
              targetType: 'number[]',
            },
          },
        ],
      },
    ],
  });
});
