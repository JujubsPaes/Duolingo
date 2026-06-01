/**
 * Handler de Relatórios de Uso (Admin)
 * 
 * Endpoint:
 * - GET /admin/reports → Retorna métricas gerais da plataforma
 * 
 * Métricas disponíveis:
 * - Total de usuários cadastrados
 * - Lições mais concluídas (top 10)
 * - Taxa de acerto média por exercício
 * - Usuários com maior streak (top 10)
 * 
 * NOTA: Este endpoint usa Scan, que é custoso em tabelas grandes.
 * Em produção com muitos dados, considerar usar DynamoDB Streams + agregações.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { scanTable } from '../../lib/dynamo';
import { success, serverError } from '../../lib/response';

/**
 * GET /admin/reports
 * Gera relatórios de uso da plataforma para o painel administrativo.
 */
export async function getReports(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Busca todos os itens da tabela (necessário para agregar métricas)
    // Em produção, isso seria otimizado com streams ou tabelas de agregação
    const allItems = await scanTable();

    // ==========================================
    // 1. Total de usuários cadastrados
    // ==========================================
    // Usuários têm PK = USER#xxx e SK = PROFILE
    const users = allItems.filter(
      (item) => (item.PK as string).startsWith('USER#') && item.SK === 'PROFILE'
    );
    const totalUsers = users.length;

    // ==========================================
    // 2. Lições mais concluídas (baseado no histórico)
    // ==========================================
    // Histórico tem PK = USER#xxx e SK = HISTORY#timestamp
    const historyItems = allItems.filter(
      (item) => (item.SK as string).startsWith('HISTORY#')
    );

    // Conta quantas vezes cada lição aparece no histórico
    const lessonCompletionCount: Record<string, number> = {};
    for (const item of historyItems) {
      const lessonId = item.lessonId as string;
      if (lessonId) {
        lessonCompletionCount[lessonId] = (lessonCompletionCount[lessonId] || 0) + 1;
      }
    }

    // Busca os nomes das lições para enriquecer o relatório
    const lessonItems = allItems.filter(
      (item) => (item.SK as string).startsWith('LESSON#') && (item.PK as string).startsWith('MODULE#')
    );
    const lessonNameMap: Record<string, string> = {};
    for (const lesson of lessonItems) {
      lessonNameMap[lesson.lessonId as string] = lesson.name as string;
    }

    // Monta o ranking das lições mais concluídas (top 10)
    const mostCompletedLessons = Object.entries(lessonCompletionCount)
      .map(([lessonId, count]) => ({
        lessonId,
        lessonName: lessonNameMap[lessonId] || 'Lição desconhecida',
        completionCount: count,
      }))
      .sort((a, b) => b.completionCount - a.completionCount)
      .slice(0, 10);

    // ==========================================
    // 3. Taxa de acerto média por exercício
    // ==========================================
    // Erros recorrentes têm PK = USER#xxx e SK = ERROR#exerciseId
    const errorItems = allItems.filter(
      (item) => (item.SK as string).startsWith('ERROR#')
    );

    // Agrupa erros por exercício
    const exerciseErrorCount: Record<string, { totalErrors: number; userCount: number }> = {};
    for (const item of errorItems) {
      const exerciseId = (item.SK as string).replace('ERROR#', '');
      if (!exerciseErrorCount[exerciseId]) {
        exerciseErrorCount[exerciseId] = { totalErrors: 0, userCount: 0 };
      }
      exerciseErrorCount[exerciseId].totalErrors += (item.count as number) || 1;
      exerciseErrorCount[exerciseId].userCount += 1;
    }

    // Busca os nomes dos exercícios
    const exerciseItems = allItems.filter(
      (item) => (item.SK as string).startsWith('EXERCISE#') && (item.PK as string).startsWith('LESSON#')
    );
    const exerciseMap: Record<string, string> = {};
    for (const ex of exerciseItems) {
      exerciseMap[ex.exerciseId as string] = ex.question as string;
    }

    // Calcula taxa de acerto estimada (quanto mais erros, menor a taxa)
    // Fórmula simplificada: 100% - (média de erros por usuário * 10%)
    const averageAccuracyByExercise = Object.entries(exerciseErrorCount)
      .map(([exerciseId, data]) => {
        const avgErrors = data.totalErrors / data.userCount;
        // Limita entre 0% e 100%
        const accuracy = Math.max(0, Math.min(100, 100 - avgErrors * 10));
        return {
          exerciseId,
          question: exerciseMap[exerciseId] || 'Exercício desconhecido',
          averageAccuracy: Math.round(accuracy * 100) / 100,
        };
      })
      .sort((a, b) => a.averageAccuracy - b.averageAccuracy) // Menor acerto primeiro
      .slice(0, 10);

    // ==========================================
    // 4. Usuários com maior streak
    // ==========================================
    const topStreakUsers = users
      .filter((user) => (user.streak as number) > 0)
      .map((user) => ({
        userId: (user.PK as string).replace('USER#', ''),
        userName: (user.name as string) || 'Usuário',
        streak: (user.streak as number) || 0,
      }))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 10);

    // ==========================================
    // Monta resposta final
    // ==========================================
    const reports = {
      totalUsers,
      mostCompletedLessons,
      averageAccuracyByExercise,
      topStreakUsers,
      // Metadados do relatório
      generatedAt: new Date().toISOString(),
      totalCourses: allItems.filter(
        (item) => (item.PK as string).startsWith('COURSE#') && item.SK === 'METADATA'
      ).length,
      totalLessons: lessonItems.length,
      totalExercises: exerciseItems.length,
    };

    return success(reports);
  } catch (error) {
    console.error('Erro ao gerar relatórios:', error);
    return serverError('Erro ao gerar relatórios');
  }
}
