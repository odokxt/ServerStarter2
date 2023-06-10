/** mod/plugin/datapackのデータを表す */
export type FileData = {
  name: string;
  description?: string;
};
 
/** 新しく追加する際のmod/plugin/datapackのデータを表す */
export type NewData = {
  name: string;
  path: string;
  description?: string;
};
