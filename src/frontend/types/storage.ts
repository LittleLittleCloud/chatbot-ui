import { IGroup } from '@/types/group';
import { IAgent } from './agent';
import JSZip from 'jszip';
import { ImageBlobStorage } from '@/utils/blobStorage';

export interface IUISettings extends IRecord{
}

export type availableValueTypes = string | number | boolean | Blob | undefined | IRecord;
export interface IRecord extends Record<string, availableValueTypes | availableValueTypes[]>{
  type: string;
}

export interface IStorage extends IRecord{
  agents: IAgent[];
  groups: IGroup[];
}

export function saveStorage(storage: IStorage){
  localStorage.setItem('storage', JSON.stringify(storage));
}

export function loadStorage(): IStorage{
  var storage = localStorage.getItem('storage');
  if(storage){
    return JSON.parse(storage);
  }
  return {
    type: "storage",
    agents: [],
    groups: []
  };
}

export async function exportZip(storage: IStorage): Promise<Blob>{
  var zip = new JSZip();
  zip.file("storage.json", JSON.stringify(storage));
  var imgs = zip.folder("images");
  var imageStorage = await ImageBlobStorage;
  var images = await imageStorage.listBlobs();
  for(var image of images){
    var blob = await imageStorage.getBlob(image);
    imgs!.file(image, blob);
  }

  return await zip.generateAsync({type:"blob"});
}

export async function importZip(blob: Blob): Promise<IStorage>{
  var zip = await JSZip.loadAsync(blob);
  var storage = await zip.file("storage.json")!.async("string");
  var imageStorage = await ImageBlobStorage;
  var images = zip.folder("images")?.forEach(async (relativePath, file) => {
    var blob = await file.async("blob");
    await imageStorage.saveBlob(blob, relativePath);
  });

  return JSON.parse(storage);
}