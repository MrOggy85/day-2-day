import RNFS from 'react-native-fs';

type Filename = 'tasks.json' | 'events.json';

export async function readJsonFile<T>(filename: Filename): Promise<T | null> {
  const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
  try {
    const contents = await RNFS.readFile(path);
    const object = JSON.parse(contents) as T;
    return object;
  } catch (error) {
    console.log('readJsonFile error', error)
    return null;
  }
}

export async function readJsonFileRaw(filename: Filename): Promise<string> {
  const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
  try {
    const contents = await RNFS.readFile(path);
    return contents;
  } catch (error) {
    console.log('readJsonFileRaw error', error)
    return '';
  }
}

export async function writeJsonFile<T>(filename: Filename, object: T): Promise<boolean> {
  const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
  try {
    const stringifiedValue = JSON.stringify(object);
    await RNFS.writeFile(path, stringifiedValue);
    return true;
  } catch (error) {
    console.log('writeJsonFile error', error)
    return false;
  }
}

export async function resetJsonFile(filename: Filename, contents: string): Promise<boolean> {
  const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
  try {
    await RNFS.unlink(path);
  } catch (error) {
    console.log('unlink error', error)
  }

  try {
    await RNFS.writeFile(path, contents);
    return true;
  } catch (error) {
    console.log('writeJsonFile error', error)
    return false;
  }
}
