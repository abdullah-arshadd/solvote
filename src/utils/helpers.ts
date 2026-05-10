export async function sha256Hash(m: string): Promise<ArrayBuffer> {
  const data = new TextEncoder().encode(m);
  return crypto.subtle.digest("SHA-256", data);
}

export async function getDiscriminator(name: string): Promise<Uint8Array> {
  const h = await sha256Hash(`global:${name}`);
  return new Uint8Array(h.slice(0, 8));
}

export function toLEBytes(value: number, byteLength: number): Uint8Array {
  const buf = new ArrayBuffer(byteLength);
  const view = new DataView(buf);
  if (byteLength === 8) view.setBigUint64(0, BigInt(Math.floor(value)), true);
  else throw new Error("unsupported");
  return new Uint8Array(buf);
}

export function strToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

export function serializeString(s: string): Uint8Array {
  const utf8 = strToBytes(s);
  const len = new Uint8Array(4);
  new DataView(len.buffer).setUint32(0, utf8.length, true);
  const ret = new Uint8Array(4 + utf8.length);
  ret.set(len, 0);
  ret.set(utf8, 4);
  return ret;
}

export async function buildInstructionData(
  name: string,
  args: { [k: string]: any },
  argTypes: { [k: string]: string }
): Promise<Uint8Array> {
  const disc = await getDiscriminator(name);
  const parts: Uint8Array[] = [disc];
  for (const k of Object.keys(args)) {
    const t = argTypes[k], v = args[k];
    if (t === "u64" || t === "i64") parts.push(toLEBytes(Number(v), 8));
    else if (t === "string") parts.push(serializeString(v));
    else if (t === "pubkey") parts.push(new (await import("@solana/web3.js")).PublicKey(v).toBytes());
  }
  let total = parts.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

export function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}