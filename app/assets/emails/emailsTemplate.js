import fs from 'fs';

const loadEmailTemplate = (templateFileName) => {
    const templatePath = `./app/assets/emails/templates/${templateFileName}`;
    return fs.readFileSync(templatePath, 'utf8');
};

export const confirmationTemplate = (userName, confirmationCode, lang) => {
    let templateFileName;
    templateFileName = `confirmation_email_${lang}.html`;
    const emailTemplate = loadEmailTemplate(templateFileName);
    
    return emailTemplate.replace('${userName}', userName).replace('${confirmationCode}', confirmationCode);
};

export const recoveryPassTemplate = (userName, recoveryCode, lang) => {
    let templateFileName;
    templateFileName = `recovery_email_${lang}.html`;
    const emailTemplate = loadEmailTemplate(templateFileName);
    
    return emailTemplate.replace('${userName}', userName).replace('${recoveryCode}', recoveryCode);
};
