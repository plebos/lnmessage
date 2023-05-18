import { BufferReader } from './buf.js';
/**
 * Reads TLVs from a reader until the entire stream is processed. The handler is
 * responsible for doing something with the data bytes.
 * @param reader
 * @param handler
 */
export declare function readTlvs(reader: BufferReader, handler: (type: bigint, value: BufferReader) => boolean): void;
