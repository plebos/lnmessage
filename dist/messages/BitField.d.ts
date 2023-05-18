/// <reference types="node" />
import { Buffer } from 'buffer';
declare type BigIntInput = string | number | bigint | boolean;
/**
 * BitField assists with using bit flags to set or unset values in the bit
 * field. Preferrably a flag type is provided, otherwise it defaults to allow
 * arbitrary setting of integers corresponding to a particular bit index.
 *
 * Internally, values are stored as bigint so that more than 32 values
 * can be used since there is a limit of 31 digits that can be manipulated
 * using bitwise operations in JavaScript.
 */
export declare class BitField<T = number> {
    /**
     * Constructs a bitmask from a number
     */
    static fromNumber(value: number): BitField<number>;
    /**
     * Constructs a bitmask from a buffer
     */
    static fromBuffer(value: Buffer): BitField<number>;
    value: bigint;
    constructor(value?: bigint);
    isSet(bit: BigIntInput): boolean;
    set(bit: BigIntInput): void;
    unset(bit: BigIntInput): void;
    toggle(bit: BigIntInput): void;
    /**
     * Returns the full list of set flags for the bit field
     */
    flags(): T[];
    /**
     * Returns the index of the most-significant bit that is set
     */
    msb(): number;
    /**
     * Returns a new BitField with the bitwise AND of the two BitFields
     * @param bitfield
     */
    and(bitfield: BitField): BitField;
    /**
     * Returns a new BitField with the bitwise OR of the two BitFields
     * @param bitfield
     */
    or(bitfield: BitField): BitField;
    /**
     * Returns a new BitField with the bitwise XOR of the two BitFields
     * @param bitfield
     */
    xor(bitfield: BitField): BitField;
    toBigInt(): bigint;
    toNumber(): number;
    toBuffer(): Buffer;
}
export {};
