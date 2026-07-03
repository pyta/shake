export interface MergedSocket {
  boardSocketId: string;
  catalogSocketId: string;
  name: string;
  type: 'input' | 'output';
  limit: number | null;
}

export interface BoardNodeFlowData {
  name: string;
  slug: string;
  inputs: MergedSocket[];
  outputs: MergedSocket[];
}
