import NativeStorage from '@react-native-async-storage/async-storage';
import Config from '../constants/Config';

const scoped = key => `zango_${Config.COMPANY_ID}_${key}`;
export default {
  getItem: key => NativeStorage.getItem(scoped(key)),
  setItem: (key, value) => NativeStorage.setItem(scoped(key), value),
  removeItem: key => NativeStorage.removeItem(scoped(key)),
};
