import * as migration_20260212_192713 from './20260212_192713';
import * as migration_20260222_173707 from './20260222_173707';

export const migrations = [
  {
    up: migration_20260212_192713.up,
    down: migration_20260212_192713.down,
    name: '20260212_192713',
  },
  {
    up: migration_20260222_173707.up,
    down: migration_20260222_173707.down,
    name: '20260222_173707'
  },
];
