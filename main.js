import { targets } from './company-names/companies.js';
import { seedDefaultSave } from './saves.js';
import { titleScreen } from './titlescreen.js';
import { userCreation } from './user-js/user-creation.js';

seedDefaultSave();
await titleScreen();
await userCreation();