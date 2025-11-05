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
      // Valid: Using satisfies instead of as
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
      // Valid: as with non-object expressions
      {
        code: `
          const str = "hello" as string;
        `,
        filename: 'valid2.ts',
      },
      {
        code: `
          const num = getValue() as number;
        `,
        filename: 'valid3.ts',
      },
      {
        code: `
          const arr = [1, 2, 3] as number[];
        `,
        filename: 'valid4.ts',
      },
      // Valid: No type assertion at all
      {
        code: `
          const obj = { name: "test", value: 42 };
        `,
        filename: 'valid5.ts',
      },
    ],
    invalid: [
      // Invalid: Using as with object literal
      {
        code: `
          interface Config {
            name: string;
            value: number;
          }
          const config = { name: "test", value: 42 } as Config;
        `,
        filename: 'invalid1.ts',
        errors: [
          {
            messageId: 'avoidAsWithObjectLiteral',
          },
        ],
      },
      // Invalid: Using as with empty object literal
      {
        code: `
          const obj = {} as Record<string, any>;
        `,
        filename: 'invalid2.ts',
        errors: [
          {
            messageId: 'avoidAsWithObjectLiteral',
          },
        ],
      },
      // Invalid: Using as with nested object properties
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
        filename: 'invalid3.ts',
        errors: [
          {
            messageId: 'avoidAsWithObjectLiteral',
          },
        ],
      },
    ],
  });
});
