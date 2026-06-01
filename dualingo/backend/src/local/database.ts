/**
 * Banco de dados local — simula o DynamoDB sem precisar da AWS.
 *
 * Funciona assim: tudo fica num Map em memória pra ser rápido,
 * e a cada escrita salva num arquivo JSON (backend/data/db.json)
 * pra não perder os dados quando reiniciar o servidor.
 *
 * Usa o mesmo padrão de PK/SK do DynamoDB (Single Table Design).
 */

import { v4 as uuid } from "uuid";
import * as fs from "fs";
import * as path from "path";

// Tipo genérico para qualquer item do "banco"
export type DBItem = Record<string, any>;

// Caminho do arquivo de persistência
const DATA_DIR = path.join(__dirname, "../../data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Armazena todos os itens indexados por "PK#SK"
const store = new Map<string, DBItem>();

/**
 * Carrega os dados do arquivo JSON para a memória.
 * Chamado ao iniciar o servidor.
 */
function loadFromDisk(): void {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const items: DBItem[] = JSON.parse(raw);
      for (const item of items) {
        const key = compositeKey(item.PK, item.SK);
        store.set(key, item);
      }
      console.log(`📂 Banco carregado do disco (${items.length} itens)`);
    }
  } catch (err) {
    console.warn("⚠️ Erro ao carregar banco do disco, iniciando vazio:", err);
  }
}

/**
 * Salva todos os dados da memória para o arquivo JSON.
 * Chamado após cada operação de escrita.
 */
function saveToDisk(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const items = Array.from(store.values());
    fs.writeFileSync(DB_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Erro ao salvar banco no disco:", err);
  }
}

// Carrega os dados ao importar o módulo
loadFromDisk();

/**
 * Gera a chave composta usada internamente no Map.
 */
function compositeKey(pk: string, sk: string): string {
  return `${pk}#${sk}`;
}

/**
 * Insere ou sobrescreve um item no banco.
 */
export function putItem(item: DBItem): void {
  const key = compositeKey(item.PK, item.SK);
  store.set(key, { ...item });
  saveToDisk();
}

/**
 * Busca um item pela chave primária (PK + SK).
 */
export function getItem(pk: string, sk: string): DBItem | undefined {
  return store.get(compositeKey(pk, sk));
}

/**
 * Busca itens por PK e prefixo de SK (simula begins_with).
 */
export function queryItems(pk: string, skPrefix?: string): DBItem[] {
  const results: DBItem[] = [];

  for (const item of store.values()) {
    if (item.PK !== pk) continue;
    if (skPrefix && !item.SK.startsWith(skPrefix)) continue;
    results.push(item);
  }

  return results;
}

/**
 * Busca itens pelo valor exato de SK (simula GSI1 onde SK é a PK do índice).
 */
export function queryBySK(sk: string): DBItem[] {
  const results: DBItem[] = [];

  for (const item of store.values()) {
    if (item.SK === sk) results.push(item);
  }

  return results;
}

/**
 * Busca itens por um campo arbitrário (simula GSI2 ou filtro).
 */
export function queryByField(field: string, value: any): DBItem[] {
  const results: DBItem[] = [];

  for (const item of store.values()) {
    if (item[field] === value) results.push(item);
  }

  return results;
}

/**
 * Atualiza campos de um item existente.
 * Retorna o item atualizado ou undefined se não encontrado.
 */
export function updateItem(
  pk: string,
  sk: string,
  updates: Record<string, any>
): DBItem | undefined {
  const key = compositeKey(pk, sk);
  const existing = store.get(key);

  if (!existing) return undefined;

  const updated = { ...existing, ...updates };
  store.set(key, updated);
  saveToDisk();
  return updated;
}

/**
 * Remove um item do banco.
 */
export function deleteItem(pk: string, sk: string): boolean {
  const result = store.delete(compositeKey(pk, sk));
  if (result) saveToDisk();
  return result;
}

/**
 * Retorna todos os itens (para debug).
 */
export function getAllItems(): DBItem[] {
  return Array.from(store.values());
}

/**
 * Limpa todo o banco (usado antes do seed).
 */
export function clearAll(): void {
  store.clear();
  saveToDisk();
}

/**
 * Gera um UUID v4.
 */
export function generateId(): string {
  return uuid();
}

export default {
  putItem,
  getItem,
  queryItems,
  queryBySK,
  queryByField,
  updateItem,
  deleteItem,
  getAllItems,
  clearAll,
  generateId,
};
