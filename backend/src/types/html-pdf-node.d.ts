// src/types/html-pdf-node.d.ts
declare module 'html-pdf-node' {
  export interface Options {
    format?: string;
    printBackground?: boolean;
    margin?: {
      top?: string;
      bottom?: string;
      left?: string;
      right?: string;
    };
  }

  export function generatePdf(
    html: { content: string },
    options: Options
  ): Promise<Buffer>;
}