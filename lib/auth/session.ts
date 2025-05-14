import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NewUser } from '@/lib/db/schema';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));  // Gerar o sal aleatório
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // Concatenar o sal com a senha
  const combined = new Uint8Array(salt.length + data.length);
  combined.set(salt);
  combined.set(data, salt.length);

  let hashBuffer = await crypto.subtle.digest('SHA-256', combined);

  // Repetir o processo de hashing conforme o número de iterações (SALT_ROUNDS)
  for (let i = 1; i < SALT_ROUNDS; i++) {
    hashBuffer = await crypto.subtle.digest('SHA-256', new Uint8Array(hashBuffer));
  }

  // Converter o hash final em uma string hexadecimal
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

  // Concatenar o sal com o hash gerado para armazenamento
  const saltHex = Array.from(salt)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  return `${saltHex}$${hashHex}`;
}

export async function comparePasswords(storedHash: string, password: string): Promise<boolean> {
  const [storedSalt, storedPasswordHash] = storedHash.split('$');

  const salt = new Uint8Array(storedSalt.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []);
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  const combined = new Uint8Array(salt.length + data.length);
  combined.set(salt);
  combined.set(data, salt.length);

  // Realizar as iterações de hash, conforme feito no hashPassword
  let hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  for (let i = 1; i < SALT_ROUNDS; i++) {
    hashBuffer = await crypto.subtle.digest('SHA-256', new Uint8Array(hashBuffer));
  }

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

  return hashHex === storedPasswordHash;
}

type SessionData = {
  user: { id: number };
  expires: string;
};

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day from now')
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionData;
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await verifyToken(session);
}

export async function setSession(user: NewUser) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: { id: user.id! },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
}
