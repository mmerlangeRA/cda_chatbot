export interface DocumentItem {
  id: number;
  name: string;
  url: string;
}

export interface Chunk {
  id: number;
  text: string;
  document_id: string;
  metadata?:string;
}

export interface Retriever{
    name:string;
    type?:string;
    description?:string;
}