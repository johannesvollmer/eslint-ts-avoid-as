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
        maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 50,
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
      // INCOMPATIBLE TYPE ASSERTIONS (problem, not suggestion)
      // Invalid: String literal as boolean
      {
        code: `
          const val = "hi" as boolean;
        `,
        filename: 'invalid8.ts',
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
        filename: 'invalid9.ts',
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
        filename: 'invalid10.ts',
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
        filename: 'invalid11.ts',
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
        filename: 'invalid12.ts',
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
        filename: 'invalid13.ts',
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
        filename: 'invalid14.ts',
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
    ],
  });
});
