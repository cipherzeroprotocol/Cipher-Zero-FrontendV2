export const saveToLocalStorage = <T>(key: string, value: T): void => {
  try {
    const serializedVal = JSON.stringify(value);
    localStorage.setItem(key, serializedVal);
  } catch (error) {
    console.error(error);
  }
};

export const getFromLocalStorage = <T>(key: string): T | null => {
  try {
    const serializedVal = localStorage.getItem(key);
    if (serializedVal === null) {
      return null;
    }
    return JSON.parse(serializedVal);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(error);
  }
};
