import { APIGatewayProxyHandler } from "aws-lambda";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME, Keys } from "../../lib/dynamo";
import { getUserFromEvent } from "../../lib/auth";
import { ok, notFound, serverError } from "../../lib/response";
import { CourseRecord, ModuleRecord } from "../../types";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    getUserFromEvent(event);

    const courseId = event.pathParameters?.id;
    if (!courseId) return notFound("ID do curso não informado.");

    // 1. Busca os metadados do curso
    const courseResult = await dynamo.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: Keys.course(courseId),
      })
    );

    if (!courseResult.Item) return notFound("Curso não encontrado.");
    const course = courseResult.Item as CourseRecord;

    // 2. Busca todos os módulos do curso
    const modulesResult = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `COURSE#${courseId}`,
          ":sk": "MODULE#",
        },
      })
    );

    const modules = (modulesResult.Items ?? []) as ModuleRecord[];
    modules.sort((a, b) => a.order - b.order);

    return ok({
      courseId: course.courseId,
      name: course.name,
      description: course.description,
      imageUrl: course.imageUrl,
      order: course.order,
      modules: modules.map((m) => ({
        moduleId: m.moduleId,
        courseId: m.courseId,
        name: m.name,
        order: m.order,
      })),
    });
  } catch (err) {
    console.error("getCourse error:", err);
    return serverError("Erro ao buscar curso.");
  }
};
