import * as migration_20260212_192713 from './20260212_192713';

export const migrations = [
  {
    up: migration_20260212_192713.up,
    down: migration_20260212_192713.down,
    name: '20260212_192713'
  },
];
