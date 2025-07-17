export interface DocumentItem {
  id: number;
  name: string;
  url: string;
}

export interface Chunk {
  id: number;
  text: string;
  document_id: number;
  metadata?:{ [key: string]: any };
  confidence:number;
}

export interface Retriever{
    name:string;
    type?:string;
    description?:string;
}

export interface DocumentPage {
    document_id:number
    document_url:string
    metadata?:{ [key: string]: any };
    confidence:number;
}

