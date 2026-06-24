import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { generatePassword, validatePasswordOptions, getDefaultPasswordOptions } from '../passwordGenerator';

const PasswordGeneratorOptionsSchema = z.object({
  length: z.number().min(8).max(64).default(16),
  includeUppercase: z.boolean().default(true),
  includeLowercase: z.boolean().default(true),
  includeNumbers: z.boolean().default(true),
  includeSymbols: z.boolean().default(true),
  excludeSimilar: z.boolean().default(true),
});

export const generatorRouter = router({
  generate: publicProcedure
    .input(PasswordGeneratorOptionsSchema)
    .query(({ input }) => {
      const errors = validatePasswordOptions(input);
      if (errors.length > 0) {
        throw new Error(errors[0]);
      }

      const result = generatePassword(input);
      return {
        password: result.password,
        strength: result.strength,
        entropy: Math.round(result.entropy * 100) / 100,
      };
    }),

  getDefaults: publicProcedure.query(() => {
    return getDefaultPasswordOptions();
  }),
});
