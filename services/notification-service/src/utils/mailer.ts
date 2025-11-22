
require('isomorphic-fetch');
export type BrevoEmail = {
  to: Array<{ name: string; email: string }>;
  templateId: number;
  params: { [key: string]: string | number };
};

export async function sendEmailWithBrevo(options: BrevoEmail) {
  // Mode mock pour projet académique si Brevo n'est pas configuré
  const isMockMode = !process.env.BREVO_API_KEY || !process.env.BREVO_SMTP_URL;
  
  if (isMockMode) {
    console.log(`[MOCK EMAIL] To: ${options.to.map(t => `${t.name} <${t.email}>`).join(', ')} | Template: ${options.templateId}`);
    return Promise.resolve();
  }

  const headers = {
    'Content-Type': 'application/json',
    accept: 'application/json',
    'api-key': process.env.BREVO_API_KEY,
  };

  const method = 'POST';
  const body = JSON.stringify({
    ...options,
    ...{
      headers: {
        'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2|custom_header_3:custom_value_3',
        charset: 'iso-8859-1',
      },
    },
  });

  try {
    const response = await fetch(process.env.BREVO_SMTP_URL!, {
      method,
      body,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error: ${response.status} - ${errorText}`);
    }

    console.log(`Email sent via Brevo | To: ${options.to.map(t => t.email).join(', ')}`);
    return Promise.resolve();
  } catch (error) {
    console.error('There was a problem sending the email with Brevo:', error);
    throw error; // Propager l'erreur pour que le service puisse la gérer
  }
}

export async function sendNotificationStatus(
  customerEmail: string,
  customerName: string,
  deliveryId: string,
  orderStatus: string,
  trackingUrl: string,
) {
  return await sendEmailWithBrevo({
    to: [
      {
        name: customerName,
        email: customerEmail,
      },
    ],
    templateId: 1,
    params: {
      customerName,
      deliveryId,
      orderStatus,
      trackingUrl,
    },
  });
}

