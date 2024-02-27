export const confirmationTemplate = (userName, confirmationCode) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmation Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h2 style="color: #333;">Confirmação de E-mail</h2>
                <p>Olá ${userName},</p>
                <p>Por favor, digite o código abaixo para confirmar seu e-mail:</p>
                <div style="padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                    <h3 style="margin-top: 0; font-size: 24px; color: #333;">${confirmationCode}</h3>
                </div>
                <p>Obrigado!</p>
            </div>
        </body>
        </html>
    `;
};

export const recoveryPassTemplate = (userName, recoveryCode) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Recovery Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h2 style="color: #333;">Recuperação de Senha</h2>
                <p>Olá ${userName},</p>
                <p>Se você solicitou a recuperação de senha, utilize o código abaixo:</p>
                <div style="padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                    <h3 style="margin-top: 0; font-size: 24px; color: #333;">${recoveryCode}</h3>
                </div>
                <p>Obrigado!</p>
            </div>
        </body>
        </html>
    `;
};
