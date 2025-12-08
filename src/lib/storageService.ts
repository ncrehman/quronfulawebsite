
import { encryptData, decryptData } from "./encryptService";



export async function saveStorage(key: string, value: any) {
  await initiateStrage(key, value, false);
}
export async function saveLocalStorage(key: string, value: any) {
  await initiateStrage(key, value, false);
}


const initiateStrage = async (key: string, value: any, isLocal: boolean) => {
  const encptedKey = await encryptData(key);
  let encptedString = null;
  if (typeof value === "string") {
    encptedString = await encryptData(value);
  } else if (typeof value === "number") {
    encptedString = await encryptData(value);
  } else if (typeof value === "boolean") {
    encptedString = await encryptData(value);
  } else if (typeof value === "object") {
    encptedString = await encryptData(JSON.stringify(value));

  }
  if (!!encptedString) {
    // (await cookies()).set(encptedKey, encptedString);
    try {
      sessionStorage.setItem(encptedKey, encptedString);
    } catch (e) {
      console.log('error in storage:' + key)
    }
  }
}

export async function removeStorage(key: string) {
  const encptedKey = await encryptData(key);
  localStorage.removeItem(encptedKey);
  sessionStorage.removeItem(encptedKey);
  // (await cookies()).delete(encptedKey);

}

export async function getStorage(key: string) {
  let result: any = null;
  try {
    const encptedKey = await encryptData(key);

    // const sessionValue = (await cookies()).get(encptedKey)?.value;
    let sessionValue = sessionStorage.getItem(encptedKey);
    if (sessionValue == null || sessionValue === 'undefined' || sessionValue === undefined) {
      result = null;
    } else {
      const value = await decryptData(sessionValue);

      try {
        const jsonRegex = /{[^]*?}|[[^]*?]/g;
        const matches = value.match(jsonRegex);
        if (matches) {
          result = JSON.parse(value);
        } else {
          result = value;
        }
      } catch (e) {
        removeStorage(encptedKey);
        result = null;
      }
    }
  } catch (e) {
    return null;
  } finally {
    return result;
  }
}