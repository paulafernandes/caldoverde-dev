import {
  ImageUploadError,
  saveUploadedImage,
} from "../../../../server/imageUploadService";
import {
  getAdminSession,
} from "../../../../server/getAdminSession";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  request,
  response
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");

    return response.status(405).json({
      error: "Método não permitido.",
    });
  }

  const session = await getAdminSession(request);

  if (!session) {
    return response.status(401).json({
      error: "Sessão de administradora necessária.",
    });
  }

  const contentType =
    request.headers["content-type"] ?? "";

  if (
    !contentType.includes(
      "multipart/form-data"
    )
  ) {
    return response.status(415).json({
      error:
        "O pedido deve utilizar multipart/form-data.",
    });
  }

  try {
    const result =
      await saveUploadedImage(request);

    return response.status(201).json(result);
  } catch (error) {
    if (error instanceof ImageUploadError) {
      return response
        .status(error.statusCode)
        .json({
          error: error.message,
        });
    }

    console.error(
      "Erro ao carregar a imagem:",
      error
    );

    return response.status(500).json({
      error:
        "Não foi possível carregar a imagem.",
    });
  }
}
