import rawCombos from '@/data/characterCombos.json';
import {
  prepareComboDatabase,
  validateComboTiming,
  type ComboDatabase,
} from '@/services/combo-timing';

const comboDatabase = prepareComboDatabase(rawCombos as ComboDatabase);

const validationErrors = Object.values(comboDatabase).flat().flatMap(validateComboTiming);

if (validationErrors.length > 0) {
  console.warn('Combo timing validation errors:', validationErrors);
}

export default comboDatabase;
