import { APIGatewayProxyHandler } from "aws-lambda";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME } from "../../lib/dynamo";
import { getUserFromEvent } from "../../lib/auth";
import { ok, serverError } from "../../lib/response";
import { CourseRecord } from "../../types";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    getUserFromEvent(event);

    // Busca todos os cursos via GSI1 (SK = "METADATA")
    const result = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "SK = :sk",
        ExpressionAttributeValues: { ":sk": "METADATA" },
      })
    );

    const courses = (result.Items ?? []) as CourseRecord[];

    // Ordena pelo campo `order`
    courses.sort((a, b) => a.order - b.order);

    return ok(
      courses.map((c) => ({
        courseId: c.courseId,
        name: c.name,
        description: c.description,
        imageUrl: c.imageUrl,
        order: c.order,
      }))
    );
  } catch (err) {
    console.error("listCourses error:", err);
    return serverError("Erro ao listar cursos.");
  }
};
