import * as bigintutil from './BigIntUtils.js';
import { Buffer } from 'buffer';
/**
 * BitField assists with using bit flags to set or unset values in the bit
 * field. Preferrably a flag type is provided, otherwise it defaults to allow
 * arbitrary setting of integers corresponding to a particular bit index.
 *
 * Internally, values are stored as bigint so that more than 32 values
 * can be used since there is a limit of 31 digits that can be manipulated
 * using bitwise operations in JavaScript.
 */
export class BitField {
    /**
     * Constructs a bitmask from a number
     */
    static fromNumber(value) {
        return new BitField(BigInt(value));
    }
    /**
     * Constructs a bitmask from a buffer
     */
    static fromBuffer(value) {
        if (value.length === 0)
            return new BitField();
        return new BitField(BigInt('0x' + value.toString('hex')));
    }
    value;
    constructor(value) {
        this.value = value || BigInt(0);
    }
    isSet(bit) {
        return (this.value & (BigInt(1) << BigInt(bit))) > BigInt(0);
    }
    set(bit) {
        this.value |= BigInt(1) << BigInt(bit);
    }
    unset(bit) {
        this.value &= ~(this.value & (BigInt(1) << BigInt(bit)));
    }
    toggle(bit) {
        this.value ^= BigInt(1) << BigInt(bit);
    }
    /**
     * Returns the full list of set flags for the bit field
     */
    flags() {
        const bits = [];
        let bit = 0;
        let val = 1n;
        while (val < this.value) {
            if (this.value & val)
                bits.push(bit);
            bit += 1;
            val <<= 1n;
        }
        return bits;
    }
    /**
     * Returns the index of the most-significant bit that is set
     */
    msb() {
        let num = this.value;
        let bit = 0;
        while (num > 1) {
            num = num >> 1n;
            bit += 1;
        }
        return bit;
    }
    /**
     * Returns a new BitField with the bitwise AND of the two BitFields
     * @param bitfield
     */
    and(bitfield) {
        return new BitField(this.value & bitfield.value);
    }
    /**
     * Returns a new BitField with the bitwise OR of the two BitFields
     * @param bitfield
     */
    or(bitfield) {
        return new BitField(this.value | bitfield.value);
    }
    /**
     * Returns a new BitField with the bitwise XOR of the two BitFields
     * @param bitfield
     */
    xor(bitfield) {
        return new BitField(this.value ^ bitfield.value);
    }
    toBigInt() {
        return this.value;
    }
    toNumber() {
        return Number(this.value);
    }
    toBuffer() {
        if (this.value === BigInt(0))
            return Buffer.alloc(0);
        return bigintutil.bigintToBuffer(this.value);
    }
}
//# sourceMappingURL=BitField.js.map