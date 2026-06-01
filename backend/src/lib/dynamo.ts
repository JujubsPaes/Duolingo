/**
 * Cliente DynamoDB compartilhado
 * 
 * Centraliza a configuração do DynamoDB para reutilização em todos os handlers.
 * Usa o Document Client (lib-dynamodb) que converte automaticamente
 * entre tipos nativos do JS e o formato do DynamoDB.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  PutCommandInput,
  GetCommandInput,
  QueryCommandInput,
  UpdateCommandInput,
  DeleteCommandInput,
  ScanCommandInput,
} from '@aws-sdk/lib-dynamodb';

// Instância do cliente DynamoDB (reutilizada entre invocações da Lambda)
const client = new DynamoDBClient({});

// Document Client com marshalling automático de tipos
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true, // Remove campos undefined antes de salvar
  },
});

// Nome da tabela vem da variável de ambiente (definida no serverless.yml)
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'dualingo-backend-dev';

/**
 * Insere ou substitui um item na tabela.
 * Usado para criar novos registros (cursos, módulos, lições, exercícios).
 */
export async function putItem(item: Record<string, unknown>) {
  const params: PutCommandInput = {
    TableName: TABLE_NAME,
    Item: item,
  };
  return docClient.send(new PutCommand(params));
}

/**
 * Busca um item específico pela chave primária (PK + SK).
 * Retorna undefined se o item não existir.
 */
export async function getItem(pk: string, sk: string) {
  const params: GetCommandInput = {
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  };
  const result = await docClient.send(new GetCommand(params));
  return result.Item;
}

/**
 * Consulta itens pela Partition Key com filtro opcional no Sort Key.
 * Usado para listar módulos de um curso, lições de um módulo, etc.
 */
export async function queryItems(
  pk: string,
  skPrefix?: string,
  indexName?: string
) {
  const params: QueryCommandInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: skPrefix
      ? 'PK = :pk AND begins_with(SK, :sk)'
      : 'PK = :pk',
    ExpressionAttributeValues: skPrefix
      ? { ':pk': pk, ':sk': skPrefix }
      : { ':pk': pk },
  };

  // Se um índice secundário for especificado, usa ele
  if (indexName) {
    params.IndexName = indexName;
  }

  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
}

/**
 * Atualiza campos específicos de um item existente.
 * Monta a expressão de update dinamicamente a partir dos campos fornecidos.
 */
export async function updateItem(
  pk: string,
  sk: string,
  updates: Record<string, unknown>
) {
  // Monta a expressão de update: "SET #field1 = :val1, #field2 = :val2, ..."
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  Object.entries(updates).forEach(([key, value]) => {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  });

  const params: UpdateCommandInput = {
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };

  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
}

/**
 * Remove um item da tabela pela chave primária.
 * IMPORTANTE: Nunca usar para deletar progresso de usuários!
 */
export async function deleteItem(pk: string, sk: string) {
  const params: DeleteCommandInput = {
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  };
  return docClient.send(new DeleteCommand(params));
}

/**
 * Faz um scan completo da tabela com filtro opcional.
 * CUIDADO: Scan é custoso em tabelas grandes. Usar apenas para relatórios admin.
 */
export async function scanTable(filterExpression?: string, expressionValues?: Record<string, unknown>) {
  const params: ScanCommandInput = {
    TableName: TABLE_NAME,
  };

  if (filterExpression && expressionValues) {
    params.FilterExpression = filterExpression;
    params.ExpressionAttributeValues = expressionValues;
  }

  const result = await docClient.send(new ScanCommand(params));
  return result.Items || [];
}
