import { NotificationType } from '@prisma/client';

export type NotificationTemplateParams = {
	title: string;
	description: string;
	type: NotificationType;
	appointmentDate?: string;
	action_url?: string;
	action_label?: string;
	logo_url?: string;
};

export const getNotificationTemplate = ({
	title,
	description,
	type,
	appointmentDate: date,
	action_url,
	action_label,
	logo_url,
}: NotificationTemplateParams) => {
	const typeNormalized =
		type === NotificationType.ALERT
			? 'Alerta'
			: type === NotificationType.INFO
				? 'Información'
				: 'Recordatorio';

	return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>

<body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,sans-serif;">

  <div style="padding:20px;background-color:#ffffff;">
    <div style="background-color:#ffffff;max-width:600px;margin:0 auto;border-radius:8px;padding:24px;box-shadow:0 0 10px rgba(0,0,0,0.05);">

      ${
				logo_url
					? `<div style="text-align:center;margin-bottom:20px;">
              <img src="${logo_url}" alt="Logo de la aplicación" style="max-width:160px;height:auto;" />
            </div>`
					: ''
			}

      <h1 style="font-size:22px;color:#333333;margin-bottom:10px;text-align:center;">
        ${title}
      </h1>

      <p style="color:#555555;font-size:16px;line-height:1.5;margin-bottom:20px;">
        ${description}
      </p>

      <p style="color:#555555;font-size:16px;line-height:1.5;margin-bottom:10px;">
        <strong>Tipo:</strong> ${typeNormalized}
      </p>

      ${
				date
					? `<p style="color:#555555;font-size:16px;line-height:1.5;margin-bottom:10px;">
        <strong>Fecha/Hora:</strong> ${date}
      </p>`
					: ''
			}

      ${
				action_url
					? `<div style="text-align:center;margin:24px 0;">
              <a href="${action_url}" 
                 style="background-color:#a855f7;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:5px;display:inline-block;font-size:16px;">
                ${action_label || 'Ver Detalles'}
              </a>
            </div>`
					: ''
			}

      <!-- Footer -->
      <div style="margin-top:40px;text-align:center;color:#999999;font-size:12px;">
        © 2025 NicoPets. Todos los derechos reservados.
      </div>

    </div>
  </div>

</body>
</html>
`;
};
