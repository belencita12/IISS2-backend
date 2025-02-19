export type PassResetParams = {
	link: string;
	username: string;
};

export const getPassResetTemplate = ({ link, username }: PassResetParams) =>
	`<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reinicio de Contraseña</title>
  <style>
    /* Estilos globales */
    * {
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #f0f0f0;
      font-family: Arial, sans-serif;
      text-align: center; /* Centra todo el contenido dentro de body */
    }

    .card-wrapper {
      display: table;
      width: 100%;
      height: 100vh;
      background-color: #f0f0f0; /* Fondo gris claro */
      padding: 20px;
      text-align: center; /* Asegura que el contenido de la tarjeta esté centrado */
    }

    .card {
      background-color: #fff;
      padding: 32px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      gap: 12px;
      max-width: 320px;
      margin: auto; 
    }

    .card h1 {
      font-size: 24px;
      margin-bottom: 12px; 
    }

    .card p {
      margin-bottom: 12px; 
    }

    .btn {
      background-color: #007bff;
      color: white !important;
      padding: 12px 20px;
      border: none;
      border-radius: 5px;
      text-decoration: none;
      font-size: 16px;
      display: inline-block; 
      margin-bottom: 20px;
    }

    .btn:link, .btn:visited, .btn:active, .btn:hover {
      color: white !important;
    }

    .btn:hover {
      background-color: #0056b3;
    }

    img {
      max-width: 240px;
      height: auto;
      margin-bottom: 20px; /* Margin inferior a la imagen */
    }

    .saludo {
      font-size: 24px;
      margin-bottom: 12px; /* Margin inferior al saludo */
    }
  </style>
</head>

<body>

  <div class="card-wrapper">
    <div class="card">
      <img src="https://images.emojiterra.com/google/android-12l/512px/1f512.png" alt="Bloqueo de contraseña" />
      <h1>Reinicio de Contraseña</h1>
      <p class="saludo">Saludos ${username},</p>
      <p>Se ha generado un enlace para que pueda reiniciar su contraseña. Por favor haga clic en el botón y será redirigido al formulario.</p>
      <a href="${link}" class="btn">Reiniciar Contraseña</a>
    </div>
  </div>

</body>

</html>
`;
